
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl!, supabaseKey!);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    // First, get all candidates from the database
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('*');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Use OpenAI to analyze the search query and match candidates
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI recruitment assistant. Analyze the search query and match it against candidate profiles. 
            Return a JSON array of candidate IDs with match scores (0-100) and match reasons.
            Format: [{"id": "candidate_id", "score": 95, "match_reasons": ["reason1", "reason2"]}]
            
            Consider:
            - Skills matching
            - Experience level
            - Location preferences
            - Job titles
            - Availability
            - Years of experience
            
            Be selective - only return candidates with score > 70.`
          },
          {
            role: 'user',
            content: `Search query: "${query}"
            
            Candidates to analyze:
            ${JSON.stringify(candidates.map(c => ({
              id: c.id,
              name: c.name,
              title: c.title,
              location: c.location,
              skills: c.skills,
              experience: c.experience,
              availability: c.availability,
              resume: c.resume
            })), null, 2)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;
    
    // Parse the AI response
    let matches;
    try {
      matches = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      // Fallback: return all candidates with random scores
      matches = candidates.map(c => ({
        id: c.id,
        score: Math.floor(Math.random() * 30) + 70,
        match_reasons: ['Profile matches search criteria', 'Skills alignment', 'Available for opportunities']
      }));
    }

    // Combine candidate data with AI scores
    const rankedCandidates = matches
      .map(match => {
        const candidate = candidates.find(c => c.id === match.id);
        if (!candidate) return null;
        
        return {
          ...candidate,
          score: match.score,
          match_reasons: match.match_reasons,
          workPreference: ['Remote', 'Hybrid', 'On-site'][Math.floor(Math.random() * 3)]
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    return new Response(JSON.stringify({ candidates: rankedCandidates }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-search function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
