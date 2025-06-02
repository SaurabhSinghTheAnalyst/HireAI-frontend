import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ParsedResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  professionalInfo: {
    summary: string;
    experience: string;
    skills: string[];
    education: string;
    certifications: string[];
  };
  score: {
    overall: number;
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
  };
}

interface ResumeParserProps {
  onDataParsed: (data: ParsedResumeData) => void;
  requirements?: string;
}

const ResumeParser = ({ onDataParsed, requirements }: ResumeParserProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_KEY;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('doc')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOC file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare FormData for backend
      const formData = new FormData();
      formData.append('user_id', user?.id || ''); // Use real UUID from Supabase Auth
      formData.append('resume', file);

      // Call the FastAPI backend
      const response = await fetch(`${API_BASE_URL}/parse-and-store-resume/`, {
        method: 'POST',
        body: formData
      });
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }
      const result = await response.json();
      const parsed = result.data;
      setUploadedFile(file.name);
      console.log('ResumeParser parsed data:', parsed);
      onDataParsed(parsed);

      toast({
        title: "Resume parsed successfully!",
        description: "Your profile has been auto-filled with extracted data",
      });

    } catch (error) {
      console.error('Resume parsing error:', error);
      toast({
        title: "Failed to parse resume",
        description: "Please try again or fill the form manually",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDeleteFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    toast({
      title: "File removed",
      description: "You can now upload a new resume",
    });
  };

  const resetAndUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    // Trigger file input click
    document.getElementById('resume-upload')?.click();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>AI Resume Parser</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload your resume for AI parsing
          </h3>
          <p className="text-gray-600 mb-6">
            Our AI will extract your information, skills, and calculate a profile score
          </p>
          
          {uploadedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{uploadedFile}</span>
              </div>
              
              <div className="flex justify-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeleteFile}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </Button>
                
                <Button 
                  size="sm"
                  onClick={resetAndUpload}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Upload New</span>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
                disabled={isUploading}
              />
              <label htmlFor="resume-upload">
                <Button 
                  asChild 
                  disabled={isUploading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <span className="cursor-pointer flex items-center space-x-2">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing... {uploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Choose Resume</span>
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                PDF, DOC, or DOCX up to 10MB
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeParser;






