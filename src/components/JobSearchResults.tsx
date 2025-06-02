import { useState, useEffect } from 'react';
import { Filter, SortDesc, Bookmark, ExternalLink, MapPin, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface JobSearchResultsProps {
  query: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  isBookmarked: boolean;
}

const JobSearchResults = ({ query }: JobSearchResultsProps) => {
  const [sortBy, setSortBy] = useState('relevance');
  const [filterBy, setFilterBy] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call for job search
    setLoading(true);
    setTimeout(() => {
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior React Developer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          type: 'Full-time',
          salary: '$120,000 - $150,000',
          description: 'We are looking for a Senior React Developer to join our team and help build amazing user experiences.',
          requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'],
          benefits: ['Health Insurance', 'Remote Work', '401k Matching'],
          postedDate: '2 days ago',
          isBookmarked: false
        },
        {
          id: '2',
          title: 'Full Stack Engineer',
          company: 'StartupXYZ',
          location: 'Remote',
          type: 'Remote',
          salary: '$90,000 - $120,000',
          description: 'Join our fast-growing startup and work on cutting-edge technology that impacts millions of users.',
          requirements: ['JavaScript', 'Python', 'AWS', '3+ years experience'],
          benefits: ['Equity Package', 'Unlimited PTO', 'Learning Budget'],
          postedDate: '1 week ago',
          isBookmarked: false
        },
        {
          id: '3',
          title: 'Frontend Developer',
          company: 'Design Agency',
          location: 'New York, NY',
          type: 'Contract',
          salary: '$70 - $90 /hour',
          description: 'Work with a creative team to build beautiful and functional web applications for our clients.',
          requirements: ['React', 'CSS', 'Figma', '2+ years experience'],
          benefits: ['Flexible Hours', 'Creative Environment', 'Portfolio Projects'],
          postedDate: '3 days ago',
          isBookmarked: false
        }
      ];
      setJobs(mockJobs);
      setLoading(false);
    }, 1500);
  }, [query]);

  const filteredJobs = jobs.filter(job => {
    if (filterBy === 'remote') return job.type === 'Remote';
    if (filterBy === 'full-time') return job.type === 'Full-time';
    if (filterBy === 'contract') return job.type === 'Contract';
    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    if (sortBy === 'company') return a.company.localeCompare(b.company);
    return 0; // relevance (default order)
  });

  const toggleBookmark = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, isBookmarked: !job.isBookmarked }
        : job
    ));
    
    const job = jobs.find(j => j.id === jobId);
    toast({
      title: job?.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: job?.isBookmarked ? 
        `Removed ${job.title} from your saved jobs` : 
        `Saved ${job?.title} to your bookmarks`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600">Searching for opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Job Search Results</h3>
          <p className="text-gray-600">
            Found {sortedJobs.length} opportunities matching "{query}"
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="remote">Remote Only</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SortDesc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Date Posted</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {sortedJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No jobs found matching your criteria.</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          sortedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
                    <p className="text-lg font-medium text-gray-700">{job.company}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(job.id)}
                    className={job.isBookmarked ? "text-green-600" : "text-gray-400"}
                  >
                    <Bookmark className={`w-5 h-5 ${job.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {job.salary}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {job.postedDate}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{job.type}</Badge>
                </div>

                <p className="text-gray-700">{job.description}</p>

                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Requirements:</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Benefits:</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.benefits.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Apply Now
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JobSearchResults;
