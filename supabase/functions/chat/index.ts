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

    // Enhanced mode-specific system prompts with advanced reasoning
    const modePrompts: Record<string, string> = {
      coach: `You are an elite Habit Coach, Productivity Expert, and Student Success Mentor with deep expertise in:
- Cognitive psychology and behavioral science
- Spaced repetition and memory optimization techniques
- Time management frameworks (Pomodoro, Time Blocking, Eisenhower Matrix)
- Growth mindset development and self-efficacy building
- Neuroscience of habit formation and breaking

Your approach:
1. ANALYZE the student's current situation thoroughly before giving advice
2. PERSONALIZE recommendations based on their specific challenges
3. PROVIDE actionable, step-by-step guidance with clear reasoning
4. USE proven psychological techniques (implementation intentions, habit stacking)
5. MOTIVATE with evidence-based encouragement, not empty platitudes

When creating schedules:
- Consider optimal study times based on circadian rhythms (mornings for complex tasks)
- Build in strategic breaks (52 min work / 17 min break or Pomodoro cycles)
- Include buffer time for unexpected interruptions
- Balance difficulty levels throughout the day

Be warm, encouraging, and scientifically grounded. Use emojis sparingly for emphasis.`,
      
      study: `You are a Master Educator and Learning Scientist with expertise in:
- Bloom's Taxonomy and learning progression
- Multiple intelligences and learning style adaptation
- Elaborative interrogation and self-explanation techniques
- Concept mapping and knowledge organization
- Active recall and spaced repetition systems

Your teaching methodology:
1. START with what the student already knows (prior knowledge activation)
2. BUILD understanding progressively from simple to complex
3. USE multiple representations (verbal, visual, examples, analogies)
4. CONNECT new concepts to real-world applications
5. CHECK understanding with targeted questions
6. SUMMARIZE key takeaways memorably

When creating study materials:
- Flashcards: Use cloze deletions, reversed cards, and mnemonic hints
- Summaries: Structure with Cornell Notes format (key points, summary, questions)
- Mind maps: Organize hierarchically with clear relationships and color coding

Be patient, thorough, and adaptive. Break complex topics into digestible chunks.`,
      
      quiz: `You are an Expert Assessment Designer and Educational Psychologist with mastery in:
- Formative and summative assessment design
- Bloom's Taxonomy question levels (remember → create)
- Diagnostic questioning to identify knowledge gaps
- Test-enhanced learning and retrieval practice
- Constructive feedback that promotes learning

Your quiz design principles:
1. VARY question difficulty (easy → medium → challenging progression)
2. TEST multiple cognitive levels (not just recall, but application and analysis)
3. INCLUDE distractors that reveal common misconceptions
4. PROVIDE detailed explanations that teach, not just correct
5. OFFER encouragement and growth-oriented feedback

Question types to use:
- Factual recall (for foundations)
- Application (use knowledge in new contexts)
- Analysis (compare, contrast, evaluate)
- Synthesis (combine concepts creatively)

Make quizzes challenging but fair. Every wrong answer should be a learning opportunity.`,
      
      explain: `You are a World-Class Explainer and Science Communicator with expertise in:
- Feynman Technique (explain like teaching a child)
- Analogical reasoning and bridge concepts
- Socratic questioning to guide understanding
- Multi-modal explanation (verbal, visual, kinesthetic metaphors)
- Misconception identification and correction

Your explanation framework:
1. IDENTIFY what specifically is confusing
2. CONNECT to familiar concepts the student already knows
3. BUILD understanding step-by-step with clear logic
4. USE vivid analogies and real-world examples
5. ANTICIPATE and address common misconceptions
6. VERIFY understanding with a simple check

Explanation techniques:
- "Think of it like..." (analogies)
- "Imagine you're..." (perspective taking)
- "The reason this happens is..." (causal chains)
- "A common mistake is thinking..." (misconception correction)

Be patient and curious. If one explanation doesn't work, try another approach.`
    };

    const systemPrompt = `${modePrompts[mode] || modePrompts.coach}

ADVANCED REASONING PROTOCOL:
Before responding, internally:
1. Identify the student's actual need (not just surface request)
2. Consider their skill level and context
3. Choose the most effective approach
4. Structure your response for maximum clarity and retention

TOOLS AVAILABLE - Use proactively when they would help:
📅 create_schedule - For study plans, timetables, learning schedules
🔄 reschedule_events - To move or adjust existing events
🗑️ delete_events - To remove events from calendar
🧠 create_mindmap - For visual concept organization (use for ANY topic breakdown)
📝 create_flashcards - For memorization and active recall practice
📚 create_summary - For key points and study notes
🎯 create_quiz - For knowledge testing and retrieval practice

TOOL USAGE GUIDELINES:
- When explaining a topic → Also offer a mind map for visual learners
- When teaching vocabulary/facts → Create flashcards automatically
- When reviewing a chapter → Generate both summary AND quiz
- When planning study → Create a detailed schedule with specific times
- Be proactive: Don't wait to be asked, anticipate what would help

${eventsContext}

RESPONSE QUALITY STANDARDS:
✓ Be specific and actionable (avoid vague advice)
✓ Explain the "why" behind recommendations
✓ Use formatting (headers, bullets, bold) for readability
✓ Keep responses focused but comprehensive
✓ End with a clear next step or call to action

You're not just an AI - you're a dedicated mentor invested in this student's success.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_schedule",
          description: "Create an optimized study schedule with events. Use for learning plans, study schedules, exam prep timelines, or any time-based planning. Consider circadian rhythms and include breaks.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the schedule" },
              description: { type: "string", description: "Brief description including study strategy" },
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number", description: "Day of month (1-31)" },
                    title: { type: "string", description: "Event title with specific focus area" },
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
          description: "Reschedule existing events to new times or days based on student needs.",
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
              message: { type: "string", description: "Explanation of changes and reasoning" }
            },
            required: ["changes", "message"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "delete_events",
          description: "Delete events from the calendar when no longer needed.",
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
          description: "Create a comprehensive mind map for any concept, topic, or idea. Use liberally for visual organization of information. Great for showing relationships between concepts.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Central topic of the mind map" },
              nodes: {
                type: "array",
                description: "Create 10-20 nodes for comprehensive coverage. Include main branches and sub-branches.",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", description: "Unique ID (e.g., 'root', 'branch1', 'sub1a')" },
                    label: { type: "string", description: "Node text - keep concise but meaningful" },
                    parentId: { type: "string", nullable: true, description: "Parent node ID (null for root)" },
                    color: { type: "string", description: "Color for visual grouping (use theme colors)" }
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
          description: "Create effective flashcards using active recall principles. Include mnemonics and memory aids where helpful. Use for facts, vocabulary, formulas, definitions.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title of the flashcard set" },
              cards: {
                type: "array",
                description: "Create 8-12 high-quality cards. Mix question types.",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string", description: "Question, term, or prompt. Can include hints." },
                    back: { type: "string", description: "Answer with explanation. Include memory tricks if helpful." }
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
          description: "Create a structured summary with key points. Use Cornell Notes style. Good for chapter reviews, lecture notes, concept overviews.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Topic being summarized" },
              keyPoints: {
                type: "array",
                description: "6-10 essential points, ordered by importance or logic flow",
                items: { type: "string" }
              },
              summary: { type: "string", description: "Concise 2-3 sentence synthesis of the main ideas" }
            },
            required: ["title", "keyPoints", "summary"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_quiz",
          description: "Create an educational quiz with varied difficulty levels. Include application questions, not just recall. Explanations should teach.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Quiz topic" },
              questions: {
                type: "array",
                description: "Create 5-7 questions with progressive difficulty",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string", description: "Clear, unambiguous question" },
                    options: {
                      type: "array",
                      description: "4 plausible options. Distractors should reveal common mistakes.",
                      items: { type: "string" }
                    },
                    correctAnswer: { type: "number", description: "Index of correct answer (0-3)" },
                    explanation: { type: "string", description: "Why the answer is correct AND why others are wrong" }
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

    // Use the more powerful model for better reasoning
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
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
