
import { useState } from 'react';
import { Plus, X, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JobExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  isCurrentJob: boolean;
}

interface JobExperienceSectionProps {
  jobExperience: JobExperience[];
  onChange: (jobs: JobExperience[]) => void;
}

const JobExperienceSection = ({ jobExperience, onChange }: JobExperienceSectionProps) => {
  const [jobs, setJobs] = useState<JobExperience[]>(jobExperience);

  const addJob = () => {
    const newJob: JobExperience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      responsibilities: '',
      isCurrentJob: false
    };
    const updatedJobs = [...jobs, newJob];
    setJobs(updatedJobs);
    onChange(updatedJobs);
  };

  const removeJob = (id: string) => {
    const updatedJobs = jobs.filter(job => job.id !== id);
    setJobs(updatedJobs);
    onChange(updatedJobs);
  };

  const updateJob = (id: string, field: keyof JobExperience, value: string | boolean) => {
    const updatedJobs = jobs.map(job => 
      job.id === id ? { ...job, [field]: value } : job
    );
    setJobs(updatedJobs);
    onChange(updatedJobs);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center">
          <Briefcase className="w-4 h-4 mr-2" />
          Work Experience
        </Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addJob}
          className="flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add Job</span>
        </Button>
      </div>

      {jobs.map((job, index) => (
        <Card key={job.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Job {index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeJob(job.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`jobTitle-${job.id}`}>Job Title *</Label>
                <Input
                  id={`jobTitle-${job.id}`}
                  placeholder="e.g., Software Engineer"
                  value={job.jobTitle}
                  onChange={(e) => updateJob(job.id, 'jobTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`company-${job.id}`}>Company *</Label>
                <Input
                  id={`company-${job.id}`}
                  placeholder="e.g., Tech Corp"
                  value={job.company}
                  onChange={(e) => updateJob(job.id, 'company', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${job.id}`}>Start Date</Label>
                <Input
                  id={`startDate-${job.id}`}
                  type="month"
                  value={job.startDate}
                  onChange={(e) => updateJob(job.id, 'startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${job.id}`}>End Date</Label>
                <Input
                  id={`endDate-${job.id}`}
                  type="month"
                  value={job.endDate}
                  onChange={(e) => updateJob(job.id, 'endDate', e.target.value)}
                  disabled={job.isCurrentJob}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`current-${job.id}`}
                    checked={job.isCurrentJob}
                    onChange={(e) => {
                      updateJob(job.id, 'isCurrentJob', e.target.checked);
                      if (e.target.checked) {
                        updateJob(job.id, 'endDate', '');
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`current-${job.id}`} className="text-sm">Current position</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`responsibilities-${job.id}`}>Key Responsibilities</Label>
              <Textarea
                id={`responsibilities-${job.id}`}
                placeholder="Describe your key responsibilities and achievements..."
                value={job.responsibilities}
                onChange={(e) => updateJob(job.id, 'responsibilities', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {jobs.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No work experience added yet</p>
              <p className="text-sm">Click "Add Job" to start building your experience</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobExperienceSection;
