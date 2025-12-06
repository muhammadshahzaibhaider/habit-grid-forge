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
    const { messages, existingEvents, mode = "coach" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages in mode:", mode);

    const eventsContext = existingEvents && Object.keys(existingEvents).length > 0 
      ? `\n\nCurrent scheduled events:\n${JSON.stringify(existingEvents, null, 2)}`
      : "\n\nNo events currently scheduled.";

    // Mode-specific system prompts
    const modePrompts: Record<string, string> = {
      coach: `You are an expert Habit Coach and Productivity Mentor for students. Your role is to:
- Help students build better study habits and routines
- Provide motivation and accountability strategies
- Create personalized study schedules and learning plans
- Offer practical tips for time management and focus
- Help break bad habits like procrastination

Be encouraging, practical, and specific. Use emojis occasionally to be engaging.`,
      
      study: `You are an expert Study Assistant and Learning Companion. Your role is to:
- Help students understand complex topics
- Create comprehensive summaries and study notes
- Generate flashcards for memorization
- Create mind maps for visual learning
- Break down difficult concepts into simple steps
- Provide study strategies and memory techniques

Be clear, educational, and supportive. Use examples and analogies.`,
      
      quiz: `You are an expert Quiz Master and Knowledge Tester. Your role is to:
- Create challenging but fair quiz questions
- Test students on various subjects and topics
- Provide detailed explanations for correct answers
- Generate practice problems for math and science
- Create vocabulary tests and language exercises
- Assess understanding and identify knowledge gaps

Make quizzes engaging and educational. Always explain why answers are correct.`,
      
      explain: `You are an expert Explainer and Teacher. Your role is to:
- Explain complex topics in simple, understandable ways
- Use analogies and real-world examples
- Break down processes step by step
- Compare and contrast concepts
- Answer "why" and "how" questions thoroughly
- Adapt explanations to different learning levels

Be patient, thorough, and use multiple approaches to explain concepts.`
    };

    const systemPrompt = `${modePrompts[mode] || modePrompts.coach}

You have powerful tools to help students:
1. CREATE study schedules using create_schedule
2. RESCHEDULE events using reschedule_events
3. DELETE events using delete_events
4. GENERATE mind maps using create_mindmap
5. CREATE flashcards using create_flashcards (for memorization)
6. GENERATE summaries using create_summary (for study notes)
7. CREATE quizzes using create_quiz (for testing knowledge)

Use the appropriate tool when students ask for:
- Study schedules, learning plans, or timetables → create_schedule
- Moving or rescheduling events → reschedule_events
- Removing or canceling events → delete_events
- Mind maps, concept maps, or visual breakdowns → create_mindmap
- Flashcards, study cards, or memorization help → create_flashcards
- Summaries, key points, or study notes → create_summary
- Quizzes, tests, or knowledge checks → create_quiz

${eventsContext}

Remember: You're helping students succeed. Be supportive, practical, and encouraging!`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_schedule",
          description: "Create a study schedule with events. Use for learning plans, study schedules, or any time-based planning.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the schedule" },
              description: { type: "string", description: "Brief description" },
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number", description: "Day of month (1-31)" },
                    title: { type: "string", description: "Event title" },
                    startTime: { type: "string", description: "Start time HH:MM" },
                    endTime: { type: "string", description: "End time HH:MM" }
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
          description: "Reschedule existing events to new times or days.",
          parameters: {
            type: "object",
            properties: {
              changes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    eventId: { type: "number" },
                    originalDay: { type: "number" },
                    newDay: { type: "number" },
                    newStartTime: { type: "string" },
                    newEndTime: { type: "string" }
                  },
                  required: ["eventId", "originalDay", "newDay", "newStartTime", "newEndTime"]
                }
              },
              message: { type: "string" }
            },
            required: ["changes", "message"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "delete_events",
          description: "Delete events from the calendar.",
          parameters: {
            type: "object",
            properties: {
              deletions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    eventId: { type: "number" },
                    day: { type: "number" }
                  },
                  required: ["eventId", "day"]
                }
              },
              message: { type: "string" }
            },
            required: ["deletions", "message"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_mindmap",
          description: "Create a mind map for a concept or topic.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              nodes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    parentId: { type: "string", nullable: true },
                    color: { type: "string" }
                  },
                  required: ["id", "label"]
                }
              }
            },
            required: ["title", "nodes"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_flashcards",
          description: "Create flashcards for studying and memorization. Use when students ask for flashcards, study cards, or memorization help.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the flashcard set" },
              cards: {
                type: "array",
                description: "Array of flashcards (create 5-10 cards)",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string", description: "Question or term on front" },
                    back: { type: "string", description: "Answer or definition on back" }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["title", "cards"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_summary",
          description: "Create a summary with key points. Use when students ask for summaries, key points, or study notes.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the summary" },
              keyPoints: {
                type: "array",
                description: "List of 5-8 key points",
                items: { type: "string" }
              },
              summary: { type: "string", description: "Brief overall summary paragraph" }
            },
            required: ["title", "keyPoints", "summary"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_quiz",
          description: "Create a quiz with multiple choice questions. Use when students want to test their knowledge.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the quiz" },
              questions: {
                type: "array",
                description: "Array of quiz questions (create 3-5 questions)",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string", description: "The question" },
                    options: {
                      type: "array",
                      description: "4 answer options",
                      items: { type: "string" }
                    },
                    correctAnswer: { type: "number", description: "Index of correct answer (0-3)" },
                    explanation: { type: "string", description: "Explanation of why the answer is correct" }
                  },
                  required: ["question", "options", "correctAnswer", "explanation"]
                }
              }
            },
            required: ["title", "questions"]
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits needed. Please add credits to continue using AI features." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }), {
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
