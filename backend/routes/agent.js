import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { agentTools } from '../services/agentTools.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(env.geminiApiKey);

// Define Gemini tool declarations (with userId removed from required parameters to allow auto-injection)
const agentToolsSchema = [
  {
    functionDeclarations: [
      {
        name: 'get_maternal_profile',
        description: 'Retrieves the maternal profile of the user, including pregnancy stage (weeks) and due date.',
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: 'The Supabase user ID of the patient (optional, backend will auto-inject).' }
          }
        }
      },
      {
        name: 'book_appointment',
        description: 'Automatically schedules a new telemedicine video consultation for the user.',
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: 'The Supabase user ID of the patient (optional, backend will auto-inject).' },
            doctorId: { type: 'STRING', description: 'The UUID of the doctor/provider (optional).' },
            date: { type: 'STRING', description: 'The date of the appointment, e.g., "June 15, 2026".' },
            slot: { type: 'STRING', description: 'The time slot of the appointment, e.g., "09:00 AM".' }
          },
          required: ['date', 'slot']
        }
      },
      {
        name: 'initialize_payment',
        description: 'Initializes a Flutterwave checkout payment link for a pending appointment or MamaFund contribution.',
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: 'The Supabase user ID (optional, backend will auto-inject).' },
            appointmentId: { type: 'STRING', description: 'The UUID of the appointment (optional).' },
            amount: { type: 'NUMBER', description: 'The payment amount in KES.' },
            purpose: { type: 'STRING', description: 'The purpose, either "appointment" or "savings".' }
          },
          required: ['amount', 'purpose']
        }
      },
      {
        name: 'trigger_sos',
        description: 'Dispatches critical emergency SOS alerts to all registered emergency contacts via SMS, WhatsApp, and Email concurrently.',
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: 'The Supabase user ID (optional, backend will auto-inject).' },
            latitude: { type: 'NUMBER', description: 'Current GPS latitude coordinates (optional).' },
            longitude: { type: 'NUMBER', description: 'Current GPS longitude coordinates (optional).' },
            symptoms: { type: 'STRING', description: 'Emergency distress symptoms.' }
          },
          required: ['symptoms']
        }
      },
      {
        name: 'send_sms',
        description: 'Sends a standard SMS notification to a specific phone number.',
        parameters: {
          type: 'OBJECT',
          properties: {
            to: { type: 'STRING', description: 'Destination phone number (e.g. +254712345678).' },
            body: { type: 'STRING', description: 'SMS message body text.' }
          },
          required: ['to', 'body']
        }
      },
      {
        name: 'send_whatsapp',
        description: 'Sends a WhatsApp notification to a specific phone number.',
        parameters: {
          type: 'OBJECT',
          properties: {
            to: { type: 'STRING', description: 'Destination phone number.' },
            body: { type: 'STRING', description: 'WhatsApp message body text.' }
          },
          required: ['to', 'body']
        }
      }
    ]
  }
];

const baseSystemInstruction = `You are Dr. Nneka, a warm, culturally-sensitive maternal health AI assistant and agent for MamaCare (Nneka Health). 
You are equipped with real-time tools to help mothers automatically.
You can retrieve their profiles, book appointments, initialize payments, trigger SOS emergency alerts, and send SMS/WhatsApp updates.
When a user asks you to perform an action (like booking, paying, alerting, or querying data), you MUST use the corresponding tool to execute the action automatically.
If the user requests a booking for "any time", "anytime", "as soon as possible", or flexible hours/days, do NOT ask for clarification; immediately call the book_appointment tool passing "any time" or the corresponding relative time as the slot/date.
Once you run a tool, summarize the result warmly (using culturally welcoming language like "my dear").
If a user triggers SOS, prioritize running the trigger_sos tool immediately and assure them help is on the way.`;

/**
 * @route POST /api/ai/agent/chat
 * @desc Converse with Dr. Nneka AI Agent and execute actions automatically (supports model candidates fallback)
 */
router.post('/chat', async (req, res) => {
  const { messages, userId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Validation Error', message: 'Parameter "messages" must be an array.' });
  }

  const candidates = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-flash-latest',
    'gemini-2.0-flash-lite'
  ];
  
  const actionsExecuted = [];
  let lastError = null;
  let success = false;

  // Inject dynamic Date Context into system instructions
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dynamicSystemInstruction = `${baseSystemInstruction}\n\n[TIME CONTEXT] Today is: ${currentDate}. Use this to parse relative times like "tomorrow", "next week", "today at 10 AM", etc.`;

  for (const name of candidates) {
    try {
      console.log(`[AI Agent] Attempting chat session with model: ${name}`);
      
      const model = genAI.getGenerativeModel({
        model: name,
        tools: agentToolsSchema,
        systemInstruction: dynamicSystemInstruction
      });

      // Map conversation history
      const history = messages.slice(0, -1).map(m => ({
        role: (m.role === 'assistant' || m.role === 'bot' || m.role === 'model') ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }]
      }));

      const chat = model.startChat({ history });
      const userMessage = messages[messages.length - 1].content || messages[messages.length - 1].text || '';

      console.log(`[AI Agent] User query: "${userMessage}"`);
      let result = await chat.sendMessage(userMessage);
      
      // Process function calls recursively if requested by Gemini
      let functionCalls = result.response.functionCalls();
      
      while (functionCalls && functionCalls.length > 0) {
        const toolResponses = [];

        for (const call of functionCalls) {
          const { name: toolName, args } = call;
          console.log(`[AI Agent] Model requested tool call: ${toolName} with args:`, args);
          
          // Inject userId automatically from request context
          const toolParams = { ...args };
          if (userId) {
            toolParams.userId = userId;
          }

          // Execute local tool logic
          const toolFunc = agentTools[toolName];
          let toolOutput;
          
          if (toolFunc) {
            try {
              toolOutput = await toolFunc(toolParams);
              actionsExecuted.push({ tool: toolName, params: toolParams, result: toolOutput });
            } catch (funcErr) {
              console.error(`[AI Agent] Tool ${toolName} execution failed:`, funcErr.message);
              toolOutput = { error: 'Execution failed', details: funcErr.message };
            }
          } else {
            toolOutput = { error: 'Not Found', details: `Tool ${toolName} not registered.` };
          }

          toolResponses.push({
            functionResponse: { name: toolName, response: toolOutput }
          });
        }

        // Submit tool results back to the model
        console.log(`[AI Agent] Submitting tool outputs back to Gemini model.`);
        result = await chat.sendMessage(toolResponses);
        functionCalls = result.response.functionCalls();
      }

      const responseText = result.response.text();

      res.json({
        message: responseText,
        actionsExecuted
      });

      success = true;
      break; // successfully handled, break candidates loop
      
    } catch (err) {
      console.warn(`[AI Agent] Model ${name} failed during session:`, err.message);
      lastError = err;
      continue; // try next candidate model
    }
  }

  if (!success) {
    console.error('[AI Agent] All candidate models failed to handle request.');
    res.status(500).json({
      error: 'AI Agent Failure',
      message: 'I am so sorry, my dear, but I experienced an error processing your request. Please try again or consult a doctor if you are having serious symptoms.',
      details: lastError?.message
    });
  }
});

export default router;
