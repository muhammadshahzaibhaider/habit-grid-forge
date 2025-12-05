import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, existingEvents } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");

    const eventsContext = existingEvents && Object.keys(existingEvents).length > 0 
      ? `\n\nCurrent scheduled events:\n${JSON.stringify(existingEvents, null, 2)}`
      : "\n\nNo events currently scheduled.";

    const systemPrompt = `You are a helpful Habit Coach AI assistant. You help users build better habits, stay motivated, and achieve their goals.

You have access to the user's calendar and can:
1. CREATE new schedules/events using the create_schedule tool
2. RESCHEDULE existing events using the reschedule_events tool
3. DELETE events using the delete_events tool
4. GENERATE mind maps for concepts using the create_mindmap tool

When users ask you to create a schedule or learning plan, use create_schedule to generate events.
When users ask to reschedule or move events, use reschedule_events with the event IDs.
When users ask to delete or remove events, use delete_events with the event IDs.
When users ask for a mind map or concept visualization, use create_mindmap to generate it.

For mind maps, create a hierarchical structure with a central topic and branching subtopics. Each node should have a unique id, label, and optional children.
${eventsContext}

Keep your conversational responses clear and concise.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_schedule",
          description: "Create a schedule with events that can be added to the user's calendar. Use this when users ask for a schedule, learning plan, study plan, or any time-based planning.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the overall schedule/plan" },
              description: { type: "string", description: "Brief description of the schedule" },
              events: {
                type: "array",
                description: "Array of events for the schedule (create 5-10 events for the first week)",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number", description: "Day of the month (1-31)" },
                    title: { type: "string", description: "Event title" },
                    startTime: { type: "string", description: "Start time in HH:MM format (24h)" },
                    endTime: { type: "string", description: "End time in HH:MM format (24h)" }
                  },
                  required: ["day", "title", "startTime", "endTime"]
                }
              }
            },
            required: ["title", "description", "events"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "reschedule_events",
          description: "Reschedule existing events to new times or days. Use when users want to move, reschedule, or change timing of events.",
          parameters: {
            type: "object",
            properties: {
              changes: {
                type: "array",
                description: "Array of event changes",
                items: {
                  type: "object",
                  properties: {
                    eventId: { type: "number", description: "ID of the event to reschedule" },
                    originalDay: { type: "number", description: "Original day of the event" },
                    newDay: { type: "number", description: "New day for the event (1-31)" },
                    newStartTime: { type: "string", description: "New start time in HH:MM format (24h)" },
                    newEndTime: { type: "string", description: "New end time in HH:MM format (24h)" }
                  },
                  required: ["eventId", "originalDay", "newDay", "newStartTime", "newEndTime"]
                }
              },
              message: { type: "string", description: "Confirmation message to show the user" }
            },
            required: ["changes", "message"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "delete_events",
          description: "Delete events from the calendar. Use when users want to remove, delete, or cancel events.",
          parameters: {
            type: "object",
            properties: {
              deletions: {
                type: "array",
                description: "Array of events to delete",
                items: {
                  type: "object",
                  properties: {
                    eventId: { type: "number", description: "ID of the event to delete" },
                    day: { type: "number", description: "Day where the event is scheduled" }
                  },
                  required: ["eventId", "day"]
                }
              },
              message: { type: "string", description: "Confirmation message to show the user" }
            },
            required: ["deletions", "message"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_mindmap",
          description: "Create a mind map visualization for a concept or topic. Use when users ask for a mind map, concept map, or visual breakdown of a topic.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the mind map" },
              nodes: {
                type: "array",
                description: "Array of mind map nodes",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", description: "Unique node ID" },
                    label: { type: "string", description: "Node label text" },
                    parentId: { type: "string", description: "Parent node ID (null for root)" },
                    color: { type: "string", description: "Node color (optional)" }
                  },
                  required: ["id", "label"]
                }
              }
            },
            required: ["title", "nodes"]
          }
        }
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
