import { useState } from 'react';
import { Plus, X, CheckCircle, Wand2, Sparkles, Briefcase, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface JobData {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
}

interface PublishingOptions {
  hiringCopilot: boolean;
  linkedin: boolean;
  seek: boolean;
  indeed: boolean;
  createLinkedinPost: boolean;
}

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_KEY;

const JobPostingModal = ({ isOpen, onClose }: JobPostingModalProps) => {
  const [step, setStep] = useState<'platforms' | 'details' | 'success'>('platforms');
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    company: '',
    location: '',
    type: '',
    description: '',
    requirements: ''
  });
  const [textPrompt, setTextPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedLinkedinPost, setGeneratedLinkedinPost] = useState('');
  const { toast } = useToast();
  const [publishingOptions, setPublishingOptions] = useState<PublishingOptions>({
    hiringCopilot: false,
    linkedin: false,
    seek: false,
    indeed: false,
    createLinkedinPost: false
  });
  const [isGeneratingLinkedinPost, setIsGeneratingLinkedinPost] = useState(false);
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
      const response = await fetch(`${API_BASE_URL}/generate-job-description/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textPrompt })
      });
      const data = await response.json();
      
      if (data?.jobData) {
        setJobData(prev => ({
          ...prev,
          title: data.jobData.title || prev.title,
          company: data.jobData.company || prev.company,
          location: data.jobData.location || prev.location,
          type: data.jobData.type || prev.type,
          description: data.jobData.description || prev.description,
          requirements: data.jobData.requirements || prev.requirements
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

    setIsGeneratingLinkedinPost(true);
    try {
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
      setIsGeneratingLinkedinPost(false);
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

    const selectedPlatforms = Object.values(publishingOptions).some(Boolean);
    if (!selectedPlatforms) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform to publish to",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    try {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await (supabase as any)
        .from('jobs')
        .insert([
          {
            ...jobData,
            recruiter_id: user.id
          }
        ]);
      if (error) throw error;
      setStep('success');
      toast({
        title: "Job published successfully!",
        description: `Your job posting for ${jobData.title} at ${jobData.company} has been published`,
      });
      if (onClose) onClose();
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

  const handleClose = () => {
    setStep('platforms');
    setJobData({
      title: '',
      company: '',
      location: '',
      type: '',
      description: '',
      requirements: ''
    });
    setTextPrompt('');
    setGeneratedLinkedinPost('');
    setPublishingOptions({
      hiringCopilot: false,
      linkedin: false,
      seek: false,
      indeed: false,
      createLinkedinPost: false
    });
    onClose();
  };

  const platforms = [
    {
      id: 'hiringCopilot',
      name: 'Hiring Copilot',
      icon: '🚀',
      description: 'Post on our platform',
      color: 'bg-blue-500'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Jobs',
      icon: '💼',
      description: 'Professional network',
      color: 'bg-blue-600'
    },
    {
      id: 'seek',
      name: 'Seek',
      icon: '🔍',
      description: 'Australia\'s job site',
      color: 'bg-orange-500'
    },
    {
      id: 'indeed',
      name: 'Indeed',
      icon: '📋',
      description: 'World\'s #1 job site',
      color: 'bg-blue-700'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Post a Job</span>
          </DialogTitle>
        </DialogHeader>

        {step === 'platforms' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Where would you like to post your job?</h3>
              <p className="text-gray-600">Select the platforms where you want to publish your job posting</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    publishingOptions[platform.id as keyof PublishingOptions]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => 
                    setPublishingOptions(prev => ({ 
                      ...prev, 
                      [platform.id]: !prev[platform.id as keyof PublishingOptions]
                    }))
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{platform.name}</h4>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                    </div>
                    <div className="ml-auto">
                      <Checkbox
                        checked={publishingOptions[platform.id as keyof PublishingOptions]}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  publishingOptions.createLinkedinPost
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => 
                  setPublishingOptions(prev => ({ 
                    ...prev, 
                    createLinkedinPost: !prev.createLinkedinPost
                  }))
                }
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">LinkedIn Social Post</h4>
                    <p className="text-sm text-gray-600">Create a post to share this job opening on your LinkedIn profile</p>
                  </div>
                  <div className="ml-auto">
                    <Checkbox
                      checked={publishingOptions.createLinkedinPost}
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep('details')}
              disabled={!Object.values(publishingOptions).some(Boolean)}
              className="w-full"
            >
              Continue to Job Details
            </Button>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-6">
            {/* AI Job Description Generator */}
            <Card>
              <CardHeader>
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
                    placeholder="e.g., We need a senior React developer for our fintech startup in London. The role involves building user-facing applications, working with APIs, and mentoring junior developers."
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
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {publishingOptions.createLinkedinPost && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>LinkedIn Post Content</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={generateLinkedInPost}
                        className="flex items-center space-x-2"
                        disabled={isGeneratingLinkedinPost}
                      >
                        {isGeneratingLinkedinPost ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span>Generating...</span>
                          </div>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Generate Post</span>
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {generatedLinkedinPost && (
                      <Textarea
                        value={generatedLinkedinPost}
                        onChange={(e) => setGeneratedLinkedinPost(e.target.value)}
                        rows={4}
                        className="bg-blue-50"
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setStep('platforms')}
                className="flex-1"
              >
                Back to Platforms
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isPublishing ? 'Publishing...' : 'Publish Job'}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h3 className="text-2xl font-semibold text-gray-900">Job Published!</h3>
            <p className="text-gray-600 text-center max-w-md">
              Your job posting for <strong>{jobData.title}</strong> at <strong>{jobData.company}</strong> has been successfully published across your selected platforms.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Create Another Job
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobPostingModal;
