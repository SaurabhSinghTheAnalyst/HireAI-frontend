
import { Star, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileData {
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
  job_experience?: any[];
  education_history?: any[];
  certification_history?: any[];
  github_url?: string;
  linkedin_url?: string;
}

interface ProfileCompletenessCardProps {
  profile: ProfileData | null;
  className?: string;
}

const ProfileCompletenessCard = ({ profile, className }: ProfileCompletenessCardProps) => {
  const calculateCompleteness = () => {
    if (!profile) return { score: 0, completedFields: [], missingFields: [] };

    const fields = [
      { key: 'first_name', label: 'First Name', weight: 10 },
      { key: 'last_name', label: 'Last Name', weight: 10 },
      { key: 'email', label: 'Email', weight: 10 },
      { key: 'phone', label: 'Phone Number', weight: 8 },
      { key: 'address', label: 'Address', weight: 5 },
      { key: 'city', label: 'City', weight: 5 },
      { key: 'state', label: 'State', weight: 5 },
      { key: 'professional_summary', label: 'Professional Summary', weight: 15 },
      { key: 'skills', label: 'Skills', weight: 12, checkArray: true },
      { key: 'job_experience', label: 'Work Experience', weight: 15, checkArray: true },
      { key: 'education_history', label: 'Education', weight: 8, checkArray: true },
      { key: 'github_url', label: 'GitHub Profile', weight: 3 },
      { key: 'linkedin_url', label: 'LinkedIn Profile', weight: 4 }
    ];

    let totalScore = 0;
    const completedFields: string[] = [];
    const missingFields: string[] = [];

    fields.forEach(field => {
      const value = profile[field.key as keyof ProfileData];
      let isComplete = false;

      if (field.checkArray) {
        isComplete = Array.isArray(value) && value.length > 0;
      } else {
        isComplete = value !== null && value !== undefined && value !== '';
      }

      if (isComplete) {
        totalScore += field.weight;
        completedFields.push(field.label);
      } else {
        missingFields.push(field.label);
      }
    });

    return { score: totalScore, completedFields, missingFields };
  };

  const { score, missingFields } = calculateCompleteness();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>Profile Completeness</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <Star className={`w-8 h-8 ${getScoreColor(score)}`} />
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
          <p className={`text-lg font-medium ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Missing Fields */}
        {missingFields.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-800 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Missing Fields ({missingFields.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {missingFields.map((field) => (
                <Badge key={field} variant="outline" className="text-xs border-red-300 text-red-700">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Tips to Improve Your Score
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {score < 90 && missingFields.includes('Professional Summary') && (
              <li>• Add a compelling professional summary to showcase your experience</li>
            )}
            {score < 90 && missingFields.includes('Skills') && (
              <li>• List your technical and professional skills</li>
            )}
            {score < 90 && missingFields.includes('Work Experience') && (
              <li>• Add your work experience with detailed descriptions</li>
            )}
            {score < 90 && missingFields.includes('Education') && (
              <li>• Include your educational background</li>
            )}
            {score < 90 && (missingFields.includes('GitHub Profile') || missingFields.includes('LinkedIn Profile')) && (
              <li>• Add your professional social media profiles</li>
            )}
            {score < 90 && missingFields.includes('Phone Number') && (
              <li>• Add your contact information for better reachability</li>
            )}
            {score >= 90 && (
              <li>• Great job! Your profile is comprehensive and professional</li>
            )}
          </ul>
        </div>

        {/* Visibility Impact */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Profile Visibility Impact</h4>
          <p className="text-sm text-gray-700">
            {score >= 80 
              ? "Your complete profile will appear higher in recruiter searches and attract more opportunities."
              : score >= 60
              ? "Adding missing information will significantly improve your visibility to recruiters."
              : "Complete your profile to increase your chances of being discovered by recruiters by up to 5x."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletenessCard;
