import { useState, useEffect } from 'react';
import { Search, Users, TrendingUp, Star, MapPin, Mail, Phone, ExternalLink, Copy, Zap, LogOut, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CandidateCard from '@/components/CandidateCard';
import CandidateCarousel from '@/components/CandidateCarousel';
import SearchResults from '@/components/SearchResults';
import DashboardStats from '@/components/DashboardStats';
import JobPostingModal from '@/components/JobPostingModal';
import JobBoard from '@/components/JobBoard';
import JobList from '@/components/JobList';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [firstName, setFirstName] = useState<string | null>(null);

  const formatName = (name: string | null | undefined) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('recruiter_profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      if (data && data.full_name) {
        setFirstName(data.full_name.split(' ')[0]);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a search query",
        description: "Please describe the candidate you're looking for",
        variant: "destructive"
      });
      return;
    }
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
      toast({
        title: "Search complete!",
        description: `Found candidates matching "${searchQuery}"`,
      });
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
  }
  if (role !== 'recruiter') {
    return <div className="min-h-screen flex items-center justify-center text-red-600 text-xl font-bold">Access denied: You are not a recruiter. (Role: {role || 'none'})</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Recruiter Dashboard</h1>
                <p className="text-xs text-gray-500">Manage your job postings and applicants</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                Welcome, {firstName ? formatName(firstName) : user?.email}
              </Badge>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="post">Post a Job</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            {/* Search box and results */}
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Search for candidates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="w-4 h-4 mr-1" />
                Search
              </Button>
            </div>
            {/* Featured Candidates Carousel (only show if not searching) */}
            {!showResults && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <CandidateCarousel />
              </div>
            )}
            {showResults && <SearchResults query={searchQuery} />}
          </TabsContent>

          <TabsContent value="post">
            {/* Your Jobs Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <JobBoard />
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            {/* Dashboard content, e.g., stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <DashboardStats />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
