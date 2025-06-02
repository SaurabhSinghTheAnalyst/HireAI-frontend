import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { MapPin, Star, Users } from 'lucide-react';
interface CarouselCandidate {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  location: string;
  skills: string[];
  score: number;
  availability: string;
  workPreference: 'Remote' | 'Hybrid' | 'On-site';
}
const sampleCandidates: CarouselCandidate[] = [{
  id: '1',
  first_name: 'Sarah',
  last_name: 'Chen',
  title: 'Senior React Developer',
  location: 'London, UK',
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
  score: 95,
  availability: 'Available',
  workPreference: 'Remote'
}, {
  id: '2',
  first_name: 'Marcus',
  last_name: 'Rodriguez',
  title: 'AI/ML Engineer',
  location: 'Berlin, Germany',
  skills: ['Python', 'TensorFlow', 'LangChain', 'RAG'],
  score: 92,
  availability: 'Available',
  workPreference: 'Hybrid'
}, {
  id: '3',
  first_name: 'Emily',
  last_name: 'Watson',
  title: 'Full Stack Developer',
  location: 'Toronto, Canada',
  skills: ['Vue.js', 'Python', 'PostgreSQL', 'AWS'],
  score: 88,
  availability: 'Open to opportunities',
  workPreference: 'Remote'
}, {
  id: '4',
  first_name: 'David',
  last_name: 'Kim',
  title: 'DevOps Engineer',
  location: 'San Francisco, USA',
  skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS'],
  score: 91,
  availability: 'Available',
  workPreference: 'On-site'
}, {
  id: '5',
  first_name: 'Anna',
  last_name: 'Kowalski',
  title: 'UX/UI Designer',
  location: 'Amsterdam, Netherlands',
  skills: ['Figma', 'React', 'Design Systems', 'User Research'],
  score: 89,
  availability: 'Available',
  workPreference: 'Hybrid'
}, {
  id: '6',
  first_name: 'James',
  last_name: 'Thompson',
  title: 'Backend Engineer',
  location: 'Sydney, Australia',
  skills: ['Go', 'Microservices', 'MongoDB', 'Redis'],
  score: 87,
  availability: 'Available',
  workPreference: 'Remote'
}];
const CandidateCarousel = () => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 85) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };
  const getAvailabilityColor = (availability: string) => {
    if (availability === 'Available') return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  };
  return <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Featured Candidates
          </h3>
          <p className="text-sm text-gray-600">Discover top talent ready for your next opportunity</p>
        </div>
        
      </div>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {sampleCandidates.map(candidate => <CarouselItem key={candidate.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{candidate.first_name} {candidate.last_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{candidate.title}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapPin className="w-3 h-3 mr-1" />
                        {candidate.location}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full border text-xs font-medium ${getScoreColor(candidate.score)}`}>
                      <Star className="w-3 h-3 inline mr-1" />
                      {candidate.score}%
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map(skill => <Badge key={skill} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                            {skill}
                          </Badge>)}
                        {candidate.skills.length > 3 && <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 3}
                          </Badge>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={`text-xs ${getAvailabilityColor(candidate.availability)}`}>
                        {candidate.availability}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {candidate.workPreference}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>)}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>;
};
export default CandidateCarousel;