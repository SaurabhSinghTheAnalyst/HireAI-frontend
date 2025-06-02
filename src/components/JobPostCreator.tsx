import { useState } from 'react';
import { Plus, X, CheckCircle, Wand2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface JobData {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  salary: string;
}

interface PublishingOptions {
  hiringCopilot: boolean;
  linkedin: boolean;
  seek: boolean;
  indeed: boolean;
  createLinkedinPost: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_KEY;

const JobPostCreator = () => {
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    company: '',
    location: '',
    type: '',
    description: '',
    requirements: '',
    salary: ''
  });
  const [textPrompt, setTextPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedLinkedinPost, setGeneratedLinkedinPost] = useState('');
  const { toast } = useToast();
  const [publishingOptions, setPublishingOptions] = useState<PublishingOptions>({
    hiringCopilot: true,
    linkedin: false,
    seek: false,
    indeed: false,
    createLinkedinPost: false
  });
  const [isGeneratingLinkedin, setIsGeneratingLinkedin] = useState(false);
  const { user } = useAuth();

  const handleInputChange = (field: keyof JobData, value: string) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const generateJobDescription = async () => {
    if (!textPrompt.trim()) {
      toast({
        title: "Enter a description",
        description: "Please describe the job you want to create",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    try {
      // Call FastAPI backend for LLM-based JD generation
      const response = await fetch(`${API_BASE_URL}/generate-job-description/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textPrompt })
      });
      const data = await response.json();
      if (data && data.jobData) {
        setJobData(prev => ({
          ...prev,
          title: data.jobData.title || prev.title,
          company: data.jobData.company || prev.company,
          location: data.jobData.location || prev.location,
          type: data.jobData.type || prev.type,
          description: data.jobData.description || prev.description,
          requirements: data.jobData.requirements || prev.requirements,
          salary: data.jobData.salary || prev.salary
        }));
        toast({
          title: "Job description generated!",
          description: "Your job posting has been created from your description",
        });
      }
    } catch (error) {
      console.error('Error generating job description:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate job description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLinkedInPost = async () => {
    if (!jobData.title || !jobData.company) {
      toast({
        title: "Missing job details",
        description: "Please fill in the job title and company first",
        variant: "destructive"
      });
      return;
    }
    console.log('Setting isGeneratingLinkedin to true');
    setIsGeneratingLinkedin(true);
    setGeneratedLinkedinPost(''); // Clear the textarea while generating
    try {
      console.log('Making API call to generate LinkedIn post');
      const response = await fetch(`${API_BASE_URL}/generate-linkedin-post/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobData })
      });
      const data = await response.json();
      if (data?.linkedinPost) {
        setGeneratedLinkedinPost(data.linkedinPost);
        toast({
          title: "LinkedIn post generated!",
          description: "Your LinkedIn post content is ready",
        });
      }
    } catch (error) {
      console.error('Error generating LinkedIn post:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate LinkedIn post. Please try again.",
        variant: "destructive"
      });
    } finally {
      console.log('Setting isGeneratingLinkedin to false');
      setIsGeneratingLinkedin(false);
    }
  };

  const handlePublish = async () => {
    if (!jobData.title || !jobData.company || !jobData.location || !jobData.type || !jobData.description || !jobData.requirements) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all the job details before publishing",
        variant: "destructive"
      });
      return;
    }
    setIsPublishing(true);
    try {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await (supabase as any)
        .from('jobs')
        .insert([{ ...jobData, recruiter_id: user.id, posted_at: new Date().toISOString() }]);
      if (error) throw error;
      setShowSuccessModal(true);
      toast({
        title: "Job published successfully!",
        description: `Your job posting for ${jobData.title} at ${jobData.company} has been published`,
      });
    } catch (error) {
      console.error('Error publishing job:', error);
      toast({
        title: "Publishing failed",
        description: "Failed to publish job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Create a Job Post</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Describe your ideal job opening and let AI create a compelling job posting for you
        </p>
      </div>

      {/* AI Job Description Generator */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5" />
            <span>AI Job Description Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe the job you want to create</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., We need a senior React developer for our fintech startup in London. The role involves building user-facing applications, working with APIs, and mentoring junior developers. Remote work is possible."
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            onClick={generateJobDescription}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Job Description
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Job Details Form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineer"
                value={jobData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="e.g., TechCorp Inc."
                value={jobData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={jobData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the job role and responsibilities..."
              value={jobData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Job Requirements</Label>
            <Textarea
              id="requirements"
              placeholder={`• 2-4 years of data analysis experience\n• Proficient in SQL and Excel\n• Experience with Power BI or Tableau\n• Basic knowledge of Python or R\n• Excellent communication skills`}
              value={jobData.requirements
                .split(';')
                .map(req => req.trim())
                .filter(Boolean)
                .join('\n')}
              onChange={e => {
                // Convert newlines to semicolon-separated string for storage
                const value = e.target.value
                  .split('\n')
                  .map(line => line.replace(/^•\s*/, '').trim())
                  .filter(Boolean)
                  .join('; ');
                handleInputChange('requirements', value);
              }}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              placeholder="e.g., $100k - $120k, Negotiable"
              value={jobData.salary}
              onChange={e => handleInputChange('salary', e.target.value)}
            />
          </div>
        
          {/* Publishing Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Publishing Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hiringCopilot"
                  checked={publishingOptions.hiringCopilot}
                  onCheckedChange={(checked) => 
                    setPublishingOptions(prev => ({ 
                      ...prev, 
                      hiringCopilot: checked === true 
                    }))
                  }
                />
                <Label htmlFor="hiringCopilot">Post on Hiring Copilot</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linkedin"
                  checked={publishingOptions.linkedin}
                  onCheckedChange={(checked) => 
                    setPublishingOptions(prev => ({ 
                      ...prev, 
                      linkedin: checked === true 
                    }))
                  }
                />
                <Label htmlFor="linkedin">Post on LinkedIn Jobs</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="seek"
                  checked={publishingOptions.seek}
                  onCheckedChange={(checked) => 
                    setPublishingOptions(prev => ({ 
                      ...prev, 
                      seek: checked === true 
                    }))
                  }
                />
                <Label htmlFor="seek">Post on Seek</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="indeed"
                  checked={publishingOptions.indeed}
                  onCheckedChange={(checked) => 
                    setPublishingOptions(prev => ({ 
                      ...prev, 
                      indeed: checked === true 
                    }))
                  }
                />
                <Label htmlFor="indeed">Post on Indeed</Label>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createLinkedinPost"
                  checked={publishingOptions.createLinkedinPost}
                  onCheckedChange={(checked) => 
                    setPublishingOptions(prev => ({ 
                      ...prev, 
                      createLinkedinPost: checked === true 
                    }))
                  }
                />
                <Label htmlFor="createLinkedinPost">Create LinkedIn post to share job opening</Label>
              </div>
              
              {publishingOptions.createLinkedinPost && (
                <div className="ml-6 space-y-3">
                  <Button
                    variant="outline"
                    onClick={generateLinkedInPost}
                    className="flex items-center space-x-2"
                    disabled={isGeneratingLinkedin}
                  >
                    {isGeneratingLinkedin ? (
                      <div className="flex items-center justify-center w-full">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="ml-2 text-white">Generating...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate LinkedIn Post</span>
                      </>
                    )}
                  </Button>
                  {generatedLinkedinPost && (
                    <div className="space-y-2">
                      <Label>Generated LinkedIn Post</Label>
                      <Textarea
                        value={generatedLinkedinPost}
                        onChange={(e) => setGeneratedLinkedinPost(e.target.value)}
                        rows={4}
                        className="bg-blue-50"
                      />
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-gray-500 ml-6">
                Generate a social media post to announce this job opening on your LinkedIn profile
              </p>
            </div>
          </div>

          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isPublishing ? 'Publishing...' : 'Publish Job'}
          </Button>
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="max-w-md p-6" role="dialog" aria-labelledby="success-title" aria-describedby="success-description">
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <h3 id="success-title" className="text-2xl font-semibold text-gray-900">Job Published!</h3>
              <p id="success-description" className="text-gray-600 text-center">
                Your job posting for <strong>{jobData.title}</strong> at <strong>{jobData.company}</strong> has been successfully published across your selected platforms.
              </p>
              <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JobPostCreator;
