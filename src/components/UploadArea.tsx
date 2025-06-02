import { useState, useEffect } from 'react';
import { User, Upload, Briefcase, GraduationCap, MapPin, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import ResumeParser from './ResumeParser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
}

interface Education {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
}

interface CandidateInfo {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  location: string;
  city: string;
  state: string;
  professionalSummary: string;
  workExperience: WorkExperience[];
  education: Education[];
  interestedIn: string;
  requiresVisa: boolean;
  visaExpiry?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_KEY;

const UploadArea = () => {
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    github: '',
    linkedin: '',
    location: '',
    city: '',
    state: '',
    professionalSummary: '',
    workExperience: [],
    education: [],
    interestedIn: '',
    requiresVisa: false,
    visaExpiry: undefined
  });
  const [parsedData, setParsedData] = useState<any>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [editingWorkIdx, setEditingWorkIdx] = useState<number | null>(null);
  const [editingEduIdx, setEditingEduIdx] = useState<number | null>(null);
  const [workDraft, setWorkDraft] = useState<WorkExperience | null>(null);
  const [eduDraft, setEduDraft] = useState<Education | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setCandidateInfo(prev => ({
          ...prev,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          github: data.github_url || '',
          linkedin: data.linkedin_url || '',
          city: data.city || '',
          state: data.state || '',
          professionalSummary: data.professional_summary || '',
          workExperience: Array.isArray(data.job_experience) ? (data.job_experience as unknown as WorkExperience[]) : [],
          education: Array.isArray(data.education_history) ? (data.education_history as unknown as Education[]) : [],
          interestedIn: 'interested_in' in data ? (data.interested_in as string) || '' : '',
          requiresVisa: 'requires_visa' in data ? Boolean(data.requires_visa) : false,
          visaExpiry: 'visa_expiry' in data ? (data.visa_expiry as string) || undefined : undefined,
        }));
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handler to map backend AI data to form fields
  const handleResumeParsed = (data: any) => {
    console.log('UploadArea received parsed data:', data);
    setParsedData(data); // Save for summary generation

    // Support both backend key styles
    let firstName = data.first_name || (data.full_name ? data.full_name.split(' ')[0] : '');
    let lastName = data.last_name || (data.full_name ? data.full_name.split(' ').slice(1).join(' ') : '');

    // If firstName contains a space, split it
    if (firstName && firstName.includes(' ')) {
      const parts = firstName.trim().split(' ');
      if (!lastName || lastName.toLowerCase() === parts[parts.length - 1].toLowerCase()) {
        lastName = parts.slice(1).join(' ');
      }
      firstName = parts[0];
    }

    // Normalize workExperience so responsibilities is always an array
    const rawWork = Array.isArray(data.job_experience)
      ? data.job_experience
      : Array.isArray(data.employment_details)
        ? data.employment_details
        : [];
    const workExperience = rawWork.map((job: any) => ({
      ...job,
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities
        : typeof job.responsibilities === 'string' && job.responsibilities
          ? [job.responsibilities]
          : [],
    }));

    setCandidateInfo(prev => ({
      ...prev,
      firstName,
      lastName,
      email: data.email || prev.email,
      phone: data.phone || prev.phone,
      github: data.github_url || data.github || prev.github,
      linkedin: data.linkedin_url || data.linkedin || data.linkedinId || prev.linkedin,
      city: data.city || prev.city,
      state: data.state || prev.state,
      professionalSummary: data.professional_summary || data.summary || prev.professionalSummary,
      workExperience: workExperience.length > 0 ? workExperience : prev.workExperience,
      education: Array.isArray(data.education_history)
        ? data.education_history
        : Array.isArray(data.education)
          ? data.education
          : prev.education,
      // Optionally map skills/certifications if you have those fields in your form
      // skills: data.skills || data.technical_skills || [],
      // certifications: data.certifications || [],
    }));

    // Reset editing states
    setWorkDraft(null);
    setEditingWorkIdx(null);
    setEduDraft(null);
    setEditingEduIdx(null);

    // Show success toast
    toast({
      title: "Resume parsed successfully!",
      description: "Your profile has been auto-filled with extracted data",
    });
  };

  // Generate professional summary using OpenAI
  const handleGenerateSummary = async () => {
    if (!parsedData) return;
    setIsGeneratingSummary(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-summary/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });
      const result = await response.json();
      setCandidateInfo(prev => ({ ...prev, professionalSummary: result.summary || '' }));
    } catch (err) {
      alert('Failed to generate summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Work Experience Section
  const handleEditWork = (idx: number) => {
    setEditingWorkIdx(idx);
    setWorkDraft({ ...candidateInfo.workExperience[idx] });
  };
  const handleSaveWork = (idx: number) => {
    setCandidateInfo(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((job, i) => i === idx ? workDraft! : job)
    }));
    setEditingWorkIdx(null);
    setWorkDraft(null);
  };
  const handleDeleteWork = (idx: number) => {
    setCandidateInfo(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== idx)
    }));
    setEditingWorkIdx(null);
    setWorkDraft(null);
  };

  // Education Section
  const handleEditEdu = (idx: number) => {
    setEditingEduIdx(idx);
    setEduDraft({ ...candidateInfo.education[idx] });
  };
  const handleSaveEdu = (idx: number) => {
    setCandidateInfo(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === idx ? eduDraft! : edu)
    }));
    setEditingEduIdx(null);
    setEduDraft(null);
  };
  const handleDeleteEdu = (idx: number) => {
    setCandidateInfo(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
    setEditingEduIdx(null);
    setEduDraft(null);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const userId = parsedData?.user_id || '';
      const payload = {
        user_id: userId,
        first_name: candidateInfo.firstName,
        last_name: candidateInfo.lastName,
        email: candidateInfo.email,
        phone: candidateInfo.phone,
        github_url: candidateInfo.github,
        linkedin_url: candidateInfo.linkedin,
        city: candidateInfo.city,
        state: candidateInfo.state,
        professional_summary: candidateInfo.professionalSummary,
        job_experience: candidateInfo.workExperience,
        education_history: candidateInfo.education,
        interested_in: candidateInfo.interestedIn,
        requires_visa: candidateInfo.requiresVisa,
        visa_expiry: candidateInfo.visaExpiry,
        // Add more fields as needed
      };
      const response = await fetch(`${API_BASE_URL}/save-candidate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        toast({ title: 'Profile saved!', description: 'Your profile has been updated.' });
      } else {
        toast({ title: 'Save failed', description: 'Could not save your profile.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Save failed', description: 'An error occurred.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">My Profile</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Upload your resume and let AI help you create a professional profile that stands out to recruiters.
        </p>
      </div>

      {/* Resume Upload Section */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-blue-500 transition-colors">
        <CardContent className="p-8">
          <ResumeParser onDataParsed={handleResumeParsed} />
        </CardContent>
      </Card>

      {/* Personal Information Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-2xl font-semibold text-gray-900">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">First Name</Label>
              <Input
                value={candidateInfo.firstName}
                onChange={(e) => setCandidateInfo(prev => ({ ...prev, firstName: e.target.value }))}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Last Name</Label>
              <Input
                value={candidateInfo.lastName}
                onChange={(e) => setCandidateInfo(prev => ({ ...prev, lastName: e.target.value }))}
                className="h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={candidateInfo.email}
                  onChange={(e) => setCandidateInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="h-11 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={candidateInfo.phone}
                onChange={(e) => setCandidateInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-11 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={candidateInfo.city}
                  onChange={(e) => setCandidateInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="h-11 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">State</Label>
              <Input
                value={candidateInfo.state}
                onChange={(e) => setCandidateInfo(prev => ({ ...prev, state: e.target.value }))}
                className="h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={candidateInfo.linkedin}
                  onChange={(e) => setCandidateInfo(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="h-11 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">GitHub</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={candidateInfo.github}
                  onChange={(e) => setCandidateInfo(prev => ({ ...prev, github: e.target.value }))}
                  className="h-11 pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-2xl font-semibold text-gray-900">Professional Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          <Textarea
            value={candidateInfo.professionalSummary}
            onChange={(e) => setCandidateInfo(prev => ({ ...prev, professionalSummary: e.target.value }))}
            className="min-h-[150px] resize-none"
            placeholder="Write a compelling summary of your professional background..."
          />
          <Button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary || !parsedData}
            className="w-full md:w-auto"
          >
            {isGeneratingSummary ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              'Generate Summary with AI'
            )}
                </Button>
        </CardContent>
      </Card>

      {/* Work Experience Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-900">Work Experience</CardTitle>
            <Button
              onClick={() => {
                setCandidateInfo(prev => ({
                  ...prev,
                  workExperience: [
                    ...prev.workExperience,
                    {
                      company: '',
                      position: '',
                      start_date: '',
                      end_date: '',
                      responsibilities: []
                    }
                  ]
                }));
                setWorkDraft({
                  company: '',
                  position: '',
                  start_date: '',
                  end_date: '',
                  responsibilities: []
                });
                setEditingWorkIdx(candidateInfo.workExperience.length);
              }}
              className="bg-blue-600 hover:bg-indigo-700"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {candidateInfo.workExperience.map((job, idx) => (
            <Card key={idx} className="border border-gray-200">
              <CardContent className="p-6">
                {editingWorkIdx === idx ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={workDraft?.company}
                          onChange={(e) => setWorkDraft(prev => ({ ...prev!, company: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input
                          value={workDraft?.position}
                          onChange={(e) => setWorkDraft(prev => ({ ...prev!, position: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={workDraft?.start_date}
                          onChange={(e) => setWorkDraft(prev => ({ ...prev!, start_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={workDraft?.end_date}
                          onChange={(e) => setWorkDraft(prev => ({ ...prev!, end_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Responsibilities</Label>
                      <Textarea
                        value={workDraft?.responsibilities.join('\n')}
                        onChange={(e) => setWorkDraft(prev => ({
                          ...prev!,
                          responsibilities: e.target.value.split('\n').filter(Boolean)
                        }))}
                        placeholder="Enter each responsibility on a new line"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingWorkIdx(null);
                          setWorkDraft(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveWork(idx)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.position}</h3>
                        <p className="text-gray-600">{job.company}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(job.start_date).toLocaleDateString()} - {new Date(job.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditWork(idx)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteWork(idx)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {job.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-900">Education</CardTitle>
            <Button
              onClick={() => {
                setCandidateInfo(prev => ({
                  ...prev,
                  education: [
                    ...prev.education,
                    {
                      degree: '',
                      institution: '',
                      start_date: '',
                      end_date: ''
                    }
                  ]
                }));
                setEduDraft({
                  degree: '',
                  institution: '',
                  start_date: '',
                  end_date: ''
                });
                setEditingEduIdx(candidateInfo.education.length);
              }}
              className="bg-blue-600 hover:bg-indigo-700"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {candidateInfo.education.map((edu, idx) => (
            <Card key={idx} className="border border-gray-200">
              <CardContent className="p-6">
                {editingEduIdx === idx ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={eduDraft?.degree}
                          onChange={(e) => setEduDraft(prev => ({ ...prev!, degree: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={eduDraft?.institution}
                          onChange={(e) => setEduDraft(prev => ({ ...prev!, institution: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={eduDraft?.start_date}
                          onChange={(e) => setEduDraft(prev => ({ ...prev!, start_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={eduDraft?.end_date}
                          onChange={(e) => setEduDraft(prev => ({ ...prev!, end_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingEduIdx(null);
                          setEduDraft(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveEdu(idx)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(edu.start_date).toLocaleDateString()} - {new Date(edu.end_date).toLocaleDateString()}
                      </p>
                </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEdu(idx)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteEdu(idx)}
                      >
                        Delete
                      </Button>
          </div>
        </div>
      )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadArea;
