
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobData } = await req.json();

    console.log('Generating LinkedIn post for job:', jobData.title);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a social media expert specializing in LinkedIn content for recruitment. Create an engaging LinkedIn post to announce a job opening.

The post should:
- Be professional yet engaging
- Include relevant hashtags
- Encourage applications and shares
- Highlight key selling points of the role and company
- Be optimized for LinkedIn's algorithm
- Include a clear call-to-action

Return only the LinkedIn post content as plain text, no JSON formatting.`;

    const userPrompt = `Create a LinkedIn post for this job opening:

Job Title: ${jobData.title}
Company: ${jobData.company}
Location: ${jobData.location}
Job Type: ${jobData.type}

Job Description: ${jobData.description}

Requirements: ${jobData.requirements}`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      throw new Error(error.error?.message || 'Failed to generate LinkedIn post');
    }

    const data = await response.json();
    const linkedinPost = data.choices[0].message.content.trim();

    console.log('LinkedIn post generated successfully');

    return new Response(JSON.stringify({ linkedinPost }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-linkedin-post function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
