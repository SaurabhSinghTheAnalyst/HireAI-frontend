import { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ResumeParser from './ResumeParser';
import JobExperienceSection from './profile/JobExperienceSection';
import EducationSection from './profile/EducationSection';
import CertificationSection from './profile/CertificationSection';
import { useCandidateProfile } from '@/hooks/useCandidateProfile';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  summary: string;
  skills: string;
  githubPortfolio: string;
  linkedinId: string;
}

const EditProfile = () => {
  const { profile, loading, saveProfile } = useCandidateProfile();
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    summary: '',
    skills: '',
    githubPortfolio: '',
    linkedinId: ''
  });
  
  const [jobExperience, setJobExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load existing profile data when component mounts or profile changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        summary: profile.professional_summary || '',
        skills: profile.skills?.join(', ') || '',
        githubPortfolio: profile.github_url || '',
        linkedinId: profile.linkedin_url || ''
      });

      // Load structured data
      setJobExperience(profile.job_experience || []);
      setEducation(profile.education_history || []);
      setCertifications(profile.certification_history || []);
    }
  }, [profile]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleResumeDataParsed = async (parsedData: any) => {
    // Map flat structure from parsedData
    const updatedProfileData = {
      firstName: parsedData.first_name || profileData.firstName,
      lastName: parsedData.last_name || profileData.lastName,
      email: parsedData.email || profileData.email,
      phone: parsedData.phone || profileData.phone,
      address: parsedData.address || profileData.address,
      city: parsedData.city || profileData.city,
      state: parsedData.state || profileData.state,
      summary: parsedData.professional_summary || profileData.summary,
      skills: Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : profileData.skills,
      zipCode: profileData.zipCode,
      githubPortfolio: parsedData.github_url || profileData.githubPortfolio,
      linkedinId: parsedData.linkedin_url || profileData.linkedinId
    };
    setProfileData(updatedProfileData);

    // Set job experience, education, certifications if present
    if (Array.isArray(parsedData.job_experience)) {
      setJobExperience(parsedData.job_experience);
    }
    if (Array.isArray(parsedData.education_history)) {
      setEducation(parsedData.education_history);
    }
    if (Array.isArray(parsedData.certification_history)) {
      setCertifications(parsedData.certification_history);
    }

    // Automatically save the parsed data to Supabase
    const candidateData = {
      first_name: updatedProfileData.firstName,
      last_name: updatedProfileData.lastName,
      email: updatedProfileData.email,
      phone: updatedProfileData.phone,
      address: updatedProfileData.address,
      city: updatedProfileData.city,
      state: updatedProfileData.state,
      zip_code: updatedProfileData.zipCode,
      professional_summary: updatedProfileData.summary,
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      job_experience: Array.isArray(parsedData.job_experience) ? parsedData.job_experience : [],
      education_history: Array.isArray(parsedData.education_history) ? parsedData.education_history : [],
      certification_history: Array.isArray(parsedData.certification_history) ? parsedData.certification_history : [],
      resume_file_name: 'parsed_resume.pdf',
      github_url: updatedProfileData.githubPortfolio,
      linkedin_url: updatedProfileData.linkedinId
    };
    await saveProfile(candidateData);
  };

  const handleSaveProfile = async () => {
    // Basic validation
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your first name, last name, and email",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    const candidateData = {
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      zip_code: profileData.zipCode,
      professional_summary: profileData.summary,
      skills: profileData.skills ? profileData.skills.split(',').map(s => s.trim()) : [],
      job_experience: jobExperience,
      education_history: education,
      certification_history: certifications,
      github_url: profileData.githubPortfolio,
      linkedin_url: profileData.linkedinId
    };

    await saveProfile(candidateData);
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Edit Your Profile</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Keep your profile up to date to attract the best job opportunities
        </p>
      </div>

      {/* AI Resume Parser */}
      <ResumeParser 
        onDataParsed={handleResumeDataParsed}
        requirements="Software development position with React, Node.js, and cloud technologies"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            {/* Professional Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="githubPortfolio">GitHub Portfolio</Label>
                <Input
                  id="githubPortfolio"
                  placeholder="https://github.com/username"
                  value={profileData.githubPortfolio}
                  onChange={(e) => handleInputChange('githubPortfolio', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinId">LinkedIn Profile</Label>
                <Input
                  id="linkedinId"
                  placeholder="https://linkedin.com/in/username"
                  value={profileData.linkedinId}
                  onChange={(e) => handleInputChange('linkedinId', e.target.value)}
                />
              </div>
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your street address"
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={profileData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={profileData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="ZIP"
                    value={profileData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Professional Summary and Skills */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Brief description of your professional background and career goals..."
                  value={profileData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Key Skills</Label>
                <Input
                  id="skills"
                  placeholder="e.g., React, Node.js, Python, Project Management"
                  value={profileData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card>
          <CardContent className="pt-6">
            <JobExperienceSection 
              jobExperience={jobExperience}
              onChange={setJobExperience}
            />
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardContent className="pt-6">
            <EducationSection 
              education={education}
              onChange={setEducation}
            />
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardContent className="pt-6">
            <CertificationSection 
              certifications={certifications}
              onChange={setCertifications}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
