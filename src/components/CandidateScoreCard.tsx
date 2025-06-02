
import { Star, Award, TrendingUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ScoreData {
  overall: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
}

interface CandidateScoreCardProps {
  score: ScoreData;
  className?: string;
}

const CandidateScoreCard = ({ score, className }: CandidateScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>Profile Score</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Star className={`w-8 h-8 ${getScoreColor(score.overall)}`} />
            <span className={`text-3xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}%
            </span>
          </div>
          <p className={`text-lg font-medium ${getScoreColor(score.overall)}`}>
            {getScoreLabel(score.overall)}
          </p>
        </div>

        {/* Detailed Scores */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Skill Match</span>
              <span className="text-sm font-semibold">{score.skillMatch}%</span>
            </div>
            <Progress value={score.skillMatch} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Experience Match</span>
              <span className="text-sm font-semibold">{score.experienceMatch}%</span>
            </div>
            <Progress value={score.experienceMatch} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Education Match</span>
              <span className="text-sm font-semibold">{score.educationMatch}%</span>
            </div>
            <Progress value={score.educationMatch} className="h-2" />
          </div>
        </div>

        {/* Score Improvement Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Tips to Improve
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {score.skillMatch < 80 && (
              <li>• Add more relevant technical skills to your profile</li>
            )}
            {score.experienceMatch < 80 && (
              <li>• Provide more detailed work experience descriptions</li>
            )}
            {score.educationMatch < 80 && (
              <li>• Include relevant certifications and education details</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateScoreCard;
