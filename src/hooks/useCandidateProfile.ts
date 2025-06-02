
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CandidateProfile {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  professional_summary?: string;
  skills?: string[];
  education?: string;
  certifications?: string[];
  resume_file_name?: string;
  job_experience?: any[];
  education_history?: any[];
  certification_history?: any[];
  github_url?: string;
  linkedin_url?: string;
}

export const useCandidateProfile = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Safely handle JSON fields
      const profileData = data ? {
        ...data,
        job_experience: Array.isArray(data.job_experience) ? data.job_experience : [],
        education_history: Array.isArray(data.education_history) ? data.education_history : [],
        certification_history: Array.isArray(data.certification_history) ? data.certification_history : []
      } : null;

      setProfile(profileData);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: Partial<CandidateProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your profile",
          variant: "destructive"
        });
        return false;
      }

      // Prepare data for database
      const candidateData = {
        user_id: user.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zip_code,
        professional_summary: profileData.professional_summary,
        skills: profileData.skills,
        education: profileData.education,
        certifications: profileData.certifications,
        resume_file_name: profileData.resume_file_name,
        job_experience: profileData.job_experience || [],
        education_history: profileData.education_history || [],
        certification_history: profileData.certification_history || [],
        github_url: profileData.github_url,
        linkedin_url: profileData.linkedin_url,
        last_updated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('candidates')
        .upsert(candidateData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error saving profile",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      // Safely handle JSON fields in response
      const savedData = {
        ...data,
        job_experience: Array.isArray(data.job_experience) ? data.job_experience : [],
        education_history: Array.isArray(data.education_history) ? data.education_history : [],
        certification_history: Array.isArray(data.certification_history) ? data.certification_history : []
      };

      setProfile(savedData);
      toast({
        title: "Profile saved successfully!",
        description: "Your profile information has been updated",
      });
      return true;
    } catch (error) {
      console.error('Error in saveProfile:', error);
      toast({
        title: "Error saving profile",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    saveProfile,
    refetchProfile: fetchProfile
  };
};
