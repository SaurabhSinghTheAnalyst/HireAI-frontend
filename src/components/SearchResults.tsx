import { useState, useEffect } from 'react';
import { Filter, SortDesc, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CandidateCard from './CandidateCard';

interface SearchResultsProps {
  query: string;
}

interface CandidateMatch {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  professional_summary?: string;
  skills?: string[];
  match_score: number;
  reason: string;
}

const API_BASE_URL = import.meta.env.VITE_API_KEY;

const SearchResults = ({ query }: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState('score');
  const [filterBy, setFilterBy] = useState('all');
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (query) {
      aiCandidateSearch(query);
    }
  }, [query]);

  const aiCandidateSearch = async (prompt: string) => {
    setLoading(true);
    setMatches([]);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-candidate-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('AI search failed');
      const data = await response.json();
      setMatches(data.matches || []);
      toast({
        title: 'AI Search Complete',
        description: `Found ${data.matches?.length || 0} candidates`,
      });
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        title: 'Error',
        description: 'Failed to search candidates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtering and sorting
  const filteredMatches = matches.filter(match => {
    if (filterBy === 'available') return match.professional_summary?.toLowerCase().includes('available');
    if (filterBy === 'remote') return match.professional_summary?.toLowerCase().includes('remote');
    return true;
  });
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'score') return (b.match_score || 0) - (a.match_score || 0);
    if (sortBy === 'name') return (a.first_name || '').localeCompare(b.first_name || '');
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Searching candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">AI Candidate Search Results</h3>
          <p className="text-gray-600">
            Found {sortedMatches.length} candidates matching "{query}"
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Candidates</SelectItem>
              <SelectItem value="available">Available Now</SelectItem>
              <SelectItem value="remote">Remote Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SortDesc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Match Score</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      {/* Candidate Cards */}
      <div className="space-y-4">
        {sortedMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No candidates found matching your criteria.</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          sortedMatches.map((match) => (
            <div key={match.id} className="border rounded-lg p-4 bg-white/90 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-lg">
                  {match.first_name} {match.last_name}
                </div>
                <div className="bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-bold shadow">
                  {match.match_score}%
                </div>
              </div>
              <div className="text-gray-600 text-sm mb-1">{match.email}</div>
              <div className="text-gray-700 mb-2">Skills: {match.skills?.join(', ') || 'N/A'}</div>
              {match.professional_summary && (
                <div className="bg-blue-50 rounded-lg p-3 text-blue-900 text-sm mt-2">
                  <b>Summary:</b> {match.professional_summary}
                </div>
              )}
              <div className="bg-blue-100 rounded p-2 text-blue-800 text-xs mt-2">
                <b>Why this candidate?</b> {match.reason}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;
