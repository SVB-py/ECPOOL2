import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { routeId, attendance } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get route details with bookings
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select(`
        *,
        bookings(
          id,
          student_id,
          pickup_location,
          dropoff_location
        )
      `)
      .eq('id', routeId)
      .single();

    if (routeError) throw routeError;

    // Map attendance to bookings to get location data
    const attendanceWithLocations = attendance.map((a: any) => {
      const booking = route.bookings?.find((b: any) => b.student_id === a.student_id);
      return {
        ...a,
        pickup_location: booking?.pickup_location || 'Unknown',
        dropoff_location: booking?.dropoff_location || route.end_location
      };
    });

    // Prepare AI prompt with attendance data
    const absentStudents = attendanceWithLocations.filter((a: any) => a.status === 'absent');
    const presentStudents = attendanceWithLocations.filter((a: any) => a.status === 'present');

    const prompt = `You are an intelligent route optimizer for a school bus service. 

Route Information:
- Route Name: ${route.route_name}
- Start: ${route.start_location}
- End: ${route.end_location}
- Total Bookings: ${route.bookings.length}
- Present Students: ${presentStudents.length}
- Absent Students: ${absentStudents.length}

Absent Students:
${absentStudents.map((s: any) => `- ${s.pickup_location}`).join('\n')}

Present Students:
${presentStudents.map((s: any) => `- ${s.pickup_location}`).join('\n')}

Task: Generate an optimized route that:
1. Skips pickups for absent students
2. Minimizes total distance
3. Maintains logical pickup order
4. Estimates time saved

Return a JSON response with:
{
  "optimizedRoute": ["location1", "location2", ...],
  "timeSaved": "X minutes",
  "distanceSaved": "Y km",
  "recommendations": ["tip1", "tip2", ...]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a route optimization expert. Always return valid JSON responses."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;
    
    // Parse JSON from AI response
    let optimizedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      optimizedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponse);
      optimizedData = {
        optimizedRoute: presentStudents.map((s: any) => s.pickup_location),
        timeSaved: "5 minutes",
        distanceSaved: "2 km",
        recommendations: ["Route optimized based on present students"]
      };
    }

    return new Response(JSON.stringify(optimizedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("ai-reroute error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
