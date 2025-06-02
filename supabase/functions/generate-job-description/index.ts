
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
    const { prompt } = await req.json();

    console.log('Generating job description for prompt:', prompt);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert HR professional and job posting creator. Generate a comprehensive job posting based on the user's description.

Return a JSON object with this exact structure:
{
  "title": "Job Title",
  "company": "Company Name (extract from description or use placeholder)",
  "location": "Location (extract from description or use placeholder)",
  "type": "Full-time/Part-time/Contract/Temporary/Internship",
  "description": "Detailed job description with responsibilities, team info, company culture, etc.",
  "requirements": "Detailed requirements including skills, experience, education, certifications, etc."
}

Make the job posting professional, engaging, and comprehensive. Include specific technical skills, soft skills, and experience requirements based on the role described.`;

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
            content: `Create a job posting based on this description: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      throw new Error(error.error?.message || 'Failed to generate job description');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let jobData;
    try {
      jobData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse job description data');
    }

    console.log('Job description generated successfully');

    return new Response(JSON.stringify({ jobData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-job-description function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
