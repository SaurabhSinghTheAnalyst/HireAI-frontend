import { useState, useEffect } from 'react';
import { Search, Briefcase, Users, MapPin, Mail, Phone, FileText, Zap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import JobSearchResults from '@/components/JobSearchResults';
import UploadArea from '@/components/UploadArea';
import JobList from '@/components/JobList';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

const Candidate = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string | null>(null);

  // Helper to capitalize first letter and lowercase the rest
  const formatName = (name: string | null | undefined) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('candidates')
        .select('first_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data && data.first_name) {
        setFirstName(data.first_name);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a search query",
        description: "Please describe the job or recruiter you're looking for",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
      toast({
        title: "Search complete!",
        description: `Found opportunities matching "${searchQuery}"`,
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

  // Debug UI and fallback
  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
  }
  if (role !== 'candidate') {
    return <div className="min-h-screen flex items-center justify-center text-red-600 text-xl font-bold">Access denied: You are not a candidate. (Role: {role || 'none'})</div>;
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
                <h1 className="text-xl font-bold text-gray-900">Career Portal</h1>
                <p className="text-xs text-gray-500">Find Your Dream Job</p>
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
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-blue-50">
            <TabsTrigger value="search" className="flex items-center space-x-2 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-700">
              <Search className="w-4 h-4" />
              <span>Find Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 hover:bg-blue-100 hover:text-blue-700 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-700">
              <Users className="w-4 h-4" />
              <span>My Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8">
            {/* Search Section */}
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Find Your Next Opportunity
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Search for jobs, companies, or recruiters that match your skills and career goals
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="e.g., Software Engineer at tech startups in San Francisco, Remote React developer positions"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 pr-32 py-6 text-lg border-2 border-gray-200 focus:border-green-500 rounded-2xl shadow-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isSearching ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Searching...</span>
                      </div>
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Search Examples */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  'Remote software jobs',
                  'Marketing roles in NYC',
                  'Startup opportunities',
                  'Senior developer positions'
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(example)}
                    className="text-sm hover:bg-blue-50 hover:border-blue-300"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            {/* Show JobList for candidates instead of featured jobs */}
            {!showResults && (
              <div className="mt-12">
                <JobList />
              </div>
            )}

            {/* Search Results */}
            {showResults && <JobSearchResults query={searchQuery} />}
          </TabsContent>

          <TabsContent value="dashboard">
            <UploadArea />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Candidate;
