import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobData, publishingOptions, linkedinPost } = await req.json();

    console.log('Publishing job post:', jobData.title);
    console.log('Publishing options:', publishingOptions);

    // Simulate job posting to various platforms
    const publishingResults = {
      hiringCopilot: false,
      linkedin: false,
      seek: false,
      indeed: false,
      linkedinPost: false
    };

    // Simulate posting to Hiring Copilot (always successful if selected)
    if (publishingOptions.hiringCopilot) {
      console.log('Publishing to Hiring Copilot...');
      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          ...jobData,
          posted_at: new Date().toISOString()
        }]);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      publishingResults.hiringCopilot = true;
    }

    // Simulate posting to LinkedIn Jobs
    if (publishingOptions.linkedin) {
      console.log('Publishing to LinkedIn Jobs...');
      // In a real implementation, you would call LinkedIn's API here
      publishingResults.linkedin = true;
    }

    // Simulate posting to Seek
    if (publishingOptions.seek) {
      console.log('Publishing to Seek...');
      // In a real implementation, you would call Seek's API here
      publishingResults.seek = true;
    }

    // Simulate posting to Indeed
    if (publishingOptions.indeed) {
      console.log('Publishing to Indeed...');
      // In a real implementation, you would call Indeed's API here
      publishingResults.indeed = true;
    }

    // Simulate creating LinkedIn post
    if (publishingOptions.createLinkedinPost && linkedinPost) {
      console.log('Creating LinkedIn post...');
      // In a real implementation, you would post to LinkedIn's API here
      publishingResults.linkedinPost = true;
    }

    // Log the job posting for demonstration
    console.log('Job posting data:', {
      ...jobData,
      publishedAt: new Date().toISOString(),
      platforms: Object.keys(publishingResults).filter(key => publishingResults[key as keyof typeof publishingResults])
    });

    if (linkedinPost) {
      console.log('LinkedIn post content:', linkedinPost);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      publishingResults,
      message: 'Job published successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in publish-job-post function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
