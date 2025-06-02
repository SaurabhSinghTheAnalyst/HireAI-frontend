import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin, Mail, Phone, Star, ExternalLink, Copy, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CandidateCardProps {
  candidate: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    title: string | null;
    location: string | null;
    email: string;
    phone: string | null;
    score: number;
    skills: string[];
    experience: string | null;
    availability: string | null;
    workPreference: 'Remote' | 'Hybrid' | 'On-site';
    summary: string;
    match_reasons: string[];
  };
}

const CandidateCard = ({ candidate }: CandidateCardProps) => {
  const { toast } = useToast();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getAvailabilityColor = (availability: string | null) => {
    if (availability === 'Available') return 'bg-green-100 text-green-700';
    if (availability === 'Open to opportunities') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleCopyContact = (type: 'email' | 'phone', value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: `${type} copied!`,
      description: `${value} has been copied to your clipboard`,
    });
  };

  const handleGenerateTemplate = () => {
    toast({
      title: "Template generated!",
      description: "Personalized outreach message created for this candidate",
    });
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{`${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown'}</h3>
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(candidate.score)}`}>
                <Star className="w-4 h-4 inline mr-1" />
                {candidate.score}% Match
              </div>
            </div>
            <p className="text-gray-600 font-medium mb-2">{candidate.title || 'No title'}</p>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {candidate.location || 'No location'}
              </div>
              <Badge variant="secondary" className={getAvailabilityColor(candidate.availability)}>
                {candidate.availability || 'Not specified'}
              </Badge>
              <Badge variant="outline">
                {candidate.workPreference}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skills */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Skills</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.skills && candidate.skills.length > 0 ? (
              <>
                {candidate.skills.slice(0, 6).map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700">
                    {skill}
                  </Badge>
                ))}
                {candidate.skills.length > 6 && (
                  <Badge variant="outline">+{candidate.skills.length - 6} more</Badge>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">No skills listed</p>
            )}
          </div>
        </div>

        {/* Match Reasons */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Why this candidate matches</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {candidate.match_reasons.map((reason, index) => (
              <li key={index} className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Experience Summary</h4>
          <p className="text-sm text-gray-600">{candidate.summary}</p>
        </div>

        {/* Contact Actions */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{candidate.email}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyContact('email', candidate.email)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              {candidate.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{candidate.phone}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyContact('phone', candidate.phone!)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button size="sm" onClick={handleGenerateTemplate} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Generate Template
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
