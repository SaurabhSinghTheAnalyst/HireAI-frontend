import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import JobPostingModal from './JobPostingModal';
import { useNavigate } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string;
  created_at?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_KEY;

const JobBoard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [candidateScores, setCandidateScores] = useState<{[id: string]: string}>({});
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('jobs')
      .select('*')
      .eq('recruiter_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setJobs(data as Job[]);
    }
    setLoading(false);
  };

  const fetchApplicants = async (jobId: string) => {
    setApplicantsLoading(true);
    setShowApplicantsModal(true);
    setApplicants([]);
    const { data, error } = await (supabase as any)
      .from('applications')
      .select('*, candidates(*)')
      .eq('job_id', jobId);
    if (!error && data) {
      setApplicants(data);
    }
    setApplicantsLoading(false);
  };

  const handleScoreCandidates = async (job, applicants) => {
    if (!job || !Array.isArray(applicants) || applicants.length === 0) {
      setScoring(false);
      return;
    }
    setScoring(true);
    setCandidateScores({});
    // Only include valid candidate profiles
    const candidateProfiles = applicants
      .map(app => app.candidates)
      .filter(Boolean); // Remove null/undefined

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
    scores.forEach(s => { 
      scoreMap[s.candidate_id] = s.score;
      // Store score in localStorage
      localStorage.setItem(`candidate_score_${s.candidate_id}`, JSON.stringify({
        score: s.score,
        reason: s.reason
      }));
    });
    setCandidateScores(scoreMap);
    setScoring(false);
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [user]);

  const handleJobPosted = () => {
    setIsModalOpen(false);
    fetchJobs();
  };

  // Helper to parse score and reason from LLM response
  const parseScoreAndReason = (scoreString) => {
    if (!scoreString) return { score: null, reason: null };
    const match = scoreString.match(/SCORE:\s*(\d+)/i);
    const reasonMatch = scoreString.match(/REASON:\s*(.*)/i);
    return {
      score: match ? match[1] : null,
      reason: reasonMatch ? reasonMatch[1] : null
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Job Posts</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          + Create New Job Post
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>You haven't posted any jobs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedJob(job)}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <p className="text-gray-600 text-sm">{job.company}</p>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 mb-2">{job.location} • {job.type}</div>
                <div className="text-gray-700 mb-2">{job.salary}</div>
                <div className="text-gray-700 line-clamp-3 mb-2">{job.description}</div>
                <div className="text-xs text-gray-400">Posted: {job?.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</div>
                <Button
                  className="mt-2 w-full"
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/jobs/${job.id}/applicants`);
                  }}
                >
                  Applicants
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {isModalOpen && (
        <JobPostingModal isOpen={isModalOpen} onClose={handleJobPosted} />
      )}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setSelectedJob(null)}>&times;</button>
            <h3 className="text-2xl font-bold mb-2">{selectedJob.title}</h3>
            <p className="text-gray-600 mb-1">{selectedJob.company}</p>
            <div className="text-gray-700 mb-2">{selectedJob.location} • {selectedJob.type}</div>
            <div className="text-gray-700 mb-2">Salary: {selectedJob.salary}</div>
            <div className="text-gray-700 mb-2">Description: {selectedJob.description}</div>
            <div className="text-gray-700 mb-2">Requirements:
              <ul className="list-disc ml-6 text-gray-700 text-sm">
                {selectedJob.requirements.split(';').map((req, idx) => req.trim() && (
                  <li key={idx}>{req.trim()}</li>
                ))}
              </ul>
            </div>
            <div className="text-xs text-gray-400 mt-4">Posted: {selectedJob?.created_at ? new Date(selectedJob.created_at).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>
      )}
      {showApplicantsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowApplicantsModal(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowApplicantsModal(false)}>&times;</button>
            <h3 className="text-2xl font-bold mb-4">Applicants</h3>
            <Button
              className="mb-4"
              onClick={() => {
                console.log("Score Candidates button clicked", { selectedJob, applicants });
                handleScoreCandidates(selectedJob, applicants);
              }}
              disabled={applicants.length === 0 || scoring}
            >
              {scoring ? "Scoring..." : "Score Candidates"}
            </Button>
            {applicantsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No applicants yet.</div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {applicants.map((app) => {
                  const score = app.llm_score;
                  const reason = app.llm_evaluation;
                  return (
                    <div key={app.id} className="border rounded-lg p-4 relative cursor-pointer" onClick={() => { setSelectedApplicant({ ...app, score, reason }); setShowApplicantModal(true); }}>
                      {/* Score in top right */}
                      {score && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-bold shadow">
                          {parseInt(score, 10) * 10}%
                        </div>
                      )}
                      <div className="font-semibold text-lg">{app.candidates?.first_name} {app.candidates?.last_name}</div>
                      <div className="text-gray-600 text-sm">{app.candidates?.email}</div>
                      <div className="text-gray-700 mt-2">Cover Letter: {app.cover_letter || 'N/A'}</div>
                      <div className="text-xs text-gray-400 mt-1">Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Applicant Details Modal */}
      {showApplicantModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowApplicantModal(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowApplicantModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2">{selectedApplicant.candidates?.first_name} {selectedApplicant.candidates?.last_name}</h3>
            <div className="text-gray-600 mb-2">{selectedApplicant.candidates?.email}</div>
            <div className="mb-2"><b>Score:</b> {selectedApplicant.score ? `${parseInt(selectedApplicant.score, 10) * 10}%` : 'N/A'}</div>
            <div className="mb-2"><b>Cover Letter:</b> {selectedApplicant.cover_letter || 'N/A'}</div>
            <div className="mb-2"><b>Applied:</b> {selectedApplicant.created_at ? new Date(selectedApplicant.created_at).toLocaleDateString() : 'N/A'}</div>
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <b>LLM Explanation:</b>
              <div>{selectedApplicant.reason || 'No explanation available.'}</div>
            </div>
            <div className="flex gap-4 mt-6">
              <a
                href={selectedApplicant.candidates?.linkedin_url || selectedApplicant.candidates?.github_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button disabled={!(selectedApplicant.candidates?.linkedin_url || selectedApplicant.candidates?.github_url)}>
                  Open Profile
                </Button>
              </a>
              <a
                href={`mailto:${selectedApplicant.candidates?.email}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button disabled={!selectedApplicant.candidates?.email} variant="secondary">
                  Contact Candidate
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard; 