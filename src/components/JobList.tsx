import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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

const JobList: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [candidateProfile, setCandidateProfile] = useState<any>(null);

  const fetchJobs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (job: Job) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
    setCandidateProfile(null);
    if (user) {
      const { data, error } = await (supabase as any)
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (!error && data) {
        setCandidateProfile(data);
      }
    }
  };

  const handleConfirmApply = async () => {
    if (!user || !candidateProfile) {
      toast({
        title: "Error",
        description: "Could not find your candidate profile.",
        variant: "destructive"
      });
      return;
    }
    try {
      const { error } = await (supabase as any)
        .from('applications')
        .insert([
          {
            job_id: selectedJob.id,
            candidate_id: candidateProfile.id,
          }
        ]);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Your application has been submitted successfully!",
      });
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">All Job Openings</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">
          <p>{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No jobs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <p className="text-gray-600 text-sm">{job.company}</p>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 mb-2">{job.location} • {job.type}</div>
                <div className="text-gray-700 mb-2">{job.salary}</div>
                <div className="text-gray-700 line-clamp-3 mb-2">{job.description}</div>
                <div className="text-xs text-gray-400 mb-2">Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</div>
                <Button onClick={() => handleApply(job)} className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">Apply</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div>
            <h3 className="font-semibold mt-2">Job Description</h3>
            <p>{selectedJob?.description}</p>
            <h3 className="font-semibold mt-2">Roles and Responsibilities</h3>
            <p>{selectedJob?.requirements}</p>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmApply} disabled={!candidateProfile}>Apply with Hire AI Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobList; 