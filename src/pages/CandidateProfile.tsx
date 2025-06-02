import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Linkedin, Github, Star } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';

const CandidateProfile: React.FC<{ parsedResumeData?: any }> = ({ parsedResumeData }) => {
  const { candidateId } = useParams();
  if (!candidateId) {
    return <div className="text-center text-red-500 py-12">Invalid candidate profile link.</div>;
  }
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { role } = useUserRole();
  // Recruiter message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();
      if (!error && data) {
        setCandidate(data);
      }
      setLoading(false);
    };
    fetchCandidate();
  }, [candidateId]);

  // Use parsedResumeData to populate the candidate state if available
  useEffect(() => {
    if (parsedResumeData) {
      setCandidate(parsedResumeData);
    }
  }, [parsedResumeData]);

  // Function to save candidate data to Supabase
  const saveCandidateData = async () => {
    if (!candidate) return;
    const { error } = await (supabase as any)
      .from('candidates')
      .upsert(candidate, { on_conflict: 'id' });
    if (error) {
      console.error('Error saving candidate data:', error);
    } else {
      console.log('Candidate data saved successfully');
    }
  };

  // Helper to get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Helper functions to safely extract first and last names
  const getFirstName = (name: string) => {
    if (!name) return '';
    return name.split(' ')[0];
  };
  const getLastName = (first: string, last: string) => {
    if (!last && first && first.split(' ').length > 1) {
      // If last_name is missing but first_name has multiple words, use the rest as last name
      return first.split(' ').slice(1).join(' ');
    }
    return last || '';
  };

  const openMessageModal = async () => {
    setShowMessageModal(true);
    setAiLoading(true);
    // Fetch AI summary and Q&A from backend
    try {
      const res = await fetch('/api/candidate-background-check', {
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
    if (!user?.id || !candidate) return;
    await supabase.from('messages').insert([
      {
        sender_id: user.id,
        receiver_id: candidate.user_id,
        message,
      }
    ]);
    setShowMessageModal(false);
    setMessage('');
    setAiSummary('');
    setAiQuestions([]);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : !candidate ? (
        <div className="text-center text-gray-500 py-12">Candidate not found.</div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Profile Card */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-md">
                <div className="md:flex md:space-x-8 p-8">
                  {/* Left: Profile summary */}
                  <div className="md:w-1/3 flex flex-col items-center md:items-start mb-8 md:mb-0">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                      {getInitials(candidate.first_name)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center md:text-left">
                      {getFirstName(candidate.first_name)}
                      {getLastName(candidate.first_name, candidate.last_name) ? ` ${getLastName(candidate.first_name, candidate.last_name)}` : ''}
                    </div>
                    <div className="text-gray-500 text-center md:text-left mb-2">{candidate.email}</div>
                    <div className="flex gap-3 mb-4">
                      {candidate.linkedin_url && (
                        <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                          <Button size="icon" variant="ghost"><Linkedin className="w-5 h-5" /></Button>
                        </a>
                      )}
                      {candidate.github_url && (
                        <a href={candidate.github_url} target="_blank" rel="noopener noreferrer" title="GitHub">
                          <Button size="icon" variant="ghost"><Github className="w-5 h-5" /></Button>
                        </a>
                      )}
                      {candidate.email && (
                        <a href={`mailto:${candidate.email}`} title="Email">
                          <Button size="icon" variant="ghost"><Mail className="w-5 h-5" /></Button>
                        </a>
                      )}
                    </div>
                    <div className="mb-6 w-full">
                      <div className="font-semibold text-gray-700 mb-2">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills?.length > 0 ? candidate.skills.map((skill: string, idx: number) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                            {skill}
                          </span>
                        )) : <span className="text-gray-400">N/A</span>}
                      </div>
                    </div>
                    {candidate.certifications && candidate.certifications.length > 0 && (
                      <div className="mb-6 w-full">
                        <div className="font-semibold text-gray-700 mb-2">Certifications</div>
                        <ul className="list-disc ml-6 text-sm text-gray-700">
                          {candidate.certifications.map((cert: string, idx: number) => (
                            <li key={idx}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {role === 'recruiter' && (
                      <Button className="mt-4 w-full bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={openMessageModal}>
                        Message Candidate
                      </Button>
                    )}
                  </div>
                  {/* Right: Details */}
                  <div className="md:w-2/3 space-y-8">
                    <div>
                      <div className="font-semibold text-lg text-indigo-700 mb-2">Job Experience</div>
                      <ul className="space-y-4">
                        {candidate.job_experience?.length > 0 ? candidate.job_experience.map((exp: any, idx: number) => (
                          <li key={idx} className="bg-indigo-50 rounded-lg p-4 shadow-sm">
                            <div className="font-bold text-gray-900">{exp.position} at {exp.company}</div>
                            <div className="text-xs text-gray-500 mb-1">{exp.start_date} - {exp.end_date || 'Present'}</div>
                            <ul className="list-disc ml-6 text-sm text-gray-700">
                              {exp.responsibilities?.map((r: string, i: number) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </li>
                        )) : <li className="text-gray-400">N/A</li>}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-indigo-700 mb-2">Education</div>
                      <ul className="space-y-4">
                        {candidate.education_history?.length > 0 ? candidate.education_history.map((edu: any, idx: number) => (
                          <li key={idx} className="bg-blue-50 rounded-lg p-4 shadow-sm">
                            <div className="font-bold text-gray-900">{edu.degree} at {edu.institution}</div>
                            <div className="text-xs text-gray-500">{edu.start_date} - {edu.end_date || 'Present'}</div>
                          </li>
                        )) : <li className="text-gray-400">N/A</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          {/* Modal for recruiter messaging */}
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
      )}
    </div>
  );
};

export default CandidateProfile; 