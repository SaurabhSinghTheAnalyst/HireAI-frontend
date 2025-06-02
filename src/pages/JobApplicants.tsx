import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_KEY;

const JobApplicants: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [candidateScores, setCandidateScores] = useState<{[id: string]: string}>({});
  const [job, setJob] = useState<any>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useAuth();
  const recruiterId = user?.id;

  const fetchApplicants = async (jobIdParam = jobId) => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('applications')
      .select('*, candidates(*)')
      .eq('job_id', jobIdParam);
    if (!error && data) {
      setApplicants(data);
    }
    setLoading(false);
  };

  const fetchJob = async () => {
    const { data, error } = await (supabase as any)
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    if (!error && data) {
      setJob(data);
    }
  };

  useEffect(() => {
    fetchApplicants();
    fetchJob();
  }, [jobId]);

  const handleScoreCandidates = async () => {
    setScoring(true);
    setCandidateScores({});
    const candidateProfiles = applicants.map(app => ({
      ...app.candidates,
      job_id: app.job_id,
      candidate_id: app.candidate_id,
      application_id: app.id
    })).filter(Boolean);
    const res = await fetch(`${API_BASE_URL}/api/score-candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job,
        candidates: candidateProfiles
      })
    });
    const scores = await res.json();
    const scoreMap = {};
    scores.forEach(s => { scoreMap[s.candidate_id] = s.score; });
    setCandidateScores(scoreMap);
    setScoring(false);
    // Re-fetch applications to get updated llm_score and llm_evaluation
    fetchApplicants(job.id);
  };

  const parseScoreAndReason = (scoreString: string) => {
    if (!scoreString) return { score: null, reason: null };
    const match = scoreString.match(/SCORE:\s*(\d+)/i);
    const reasonMatch = scoreString.match(/REASON:\s*(.*)/i);
    return {
      score: match ? match[1] : null,
      reason: reasonMatch ? reasonMatch[1] : null
    };
  };

  const openMessageModal = async (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowMessageModal(true);
    setAiLoading(true);
    // Fetch AI summary and Q&A from backend
    try {
      const res = await fetch(`${API_BASE_URL}/api/candidate-background-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate }),
      });
      const data = await res.json();
      setAiSummary(data.summary);
      setAiQuestions(data.questions);
    } catch (e) {
      setAiSummary('Could not load AI background check.');
      setAiQuestions([]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!recruiterId || !selectedCandidate) return;
    await supabase.from('messages').insert([
      {
        sender_id: recruiterId,
        receiver_id: selectedCandidate.user_id,
        message,
      }
    ]);
    setShowMessageModal(false);
    setMessage('');
    setAiSummary('');
    setAiQuestions([]);
    setSelectedCandidate(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-700 tracking-tight">Hiring Copilot</span>
          <span
            className="ml-4 text-blue-600 font-semibold cursor-pointer hover:underline transition"
            onClick={() => navigate('/dashboard')}
          >
            Home
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Applicants for Job</h2>
        <Button onClick={handleScoreCandidates} disabled={applicants.length === 0 || scoring}>
          {scoring ? 'Scoring...' : 'Score Candidates'}
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No applicants yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applicants.map((app) => {
            const score = app.llm_score;
            const reason = app.llm_evaluation;
            return (
              <Card key={app.id} className="hover:shadow-lg transition-shadow cursor-pointer relative">
                {score && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-bold shadow">
                    {parseInt(score, 10) * 10}%
                  </div>
                )}
                <CardHeader
                  onClick={() => {
                    if (app.candidates?.id) {
                      navigate(`/candidates/${app.candidates.id}`);
                    } else {
                      alert('Candidate profile not found for this applicant.');
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <CardTitle>{app.candidates?.first_name} {app.candidates?.last_name}</CardTitle>
                  <div className="text-gray-600 text-sm">{app.candidates?.email}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 mb-2">Skills: {app.candidates?.skills?.join(', ') || 'N/A'}</div>
                  <div className="text-gray-700 mb-2">Open to: {app.candidates?.work_preference || 'N/A'}</div>
                  {score && reason && (
                    <Accordion type="single" collapsible className="mt-4">
                      <AccordionItem value="llm-explanation">
                        <AccordionTrigger>Show LLM Evaluation</AccordionTrigger>
                        <AccordionContent>
                          <div className="bg-blue-50 rounded-lg p-3 text-blue-900 text-sm">
                            {reason}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  <Button onClick={() => openMessageModal(app.candidates)} className="mt-2 w-full bg-blue-100 text-blue-700 hover:bg-blue-200">Message Candidate</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Message Candidate</h2>
            {aiLoading ? (
              <div>Loading AI background check...</div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="font-semibold text-blue-700">AI Background Check:</div>
                  <div className="text-gray-700">{aiSummary}</div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold text-blue-700">Suggested Q&A:</div>
                  <ul className="list-disc ml-6 text-gray-700">
                    {aiQuestions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              </>
            )}
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={4}
              placeholder="Type your message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowMessageModal(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={handleSendMessage} className="px-4 py-2 rounded bg-blue-600 text-white">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants; 