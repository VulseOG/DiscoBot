// Using ES Module syntax
import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import OpenAI from 'openai';
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GENERAL_CHANNEL_ID = "1204246354973560872";
const IMAGINE_CHANNEL_ID = "1204246374619549798";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

client.once("ready", () => {
  console.log("Bot is online!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.channel.id === GENERAL_CHANNEL_ID) {
    const response = await generateTextWithGPT4(message.content);
    message.channel.send(response);
  } else if (message.content.startsWith("!Imagine") && message.channel.id === IMAGINE_CHANNEL_ID) {
    const query = message.content.replace("!Imagine", "").trim();
    if (query) {
      try {
        const imageUrl = await generateImageWithDALLE(query);
        message.channel.send(imageUrl);
      } catch (error) {
        console.error("Error generating image:", error);
        message.channel.send("Sorry, I couldn't generate the image.");
      }
    } else {
      message.channel.send("Please provide a description for the image.");
    }
  }
});

async function generateTextWithGPT4(prompt) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [{
          role: "system",
          content: "You are a helpful assistant."
        }, {
          role: "user",
          content: prompt,
        }],
        max_tokens: 4096,
        temperature: 0.7,
        seed: 42,
      });
  
      if (response.choices && response.choices.length > 0 && response.choices[0].message) {
        return response.choices[0].message.content.trim();
      } else {
        console.error('No data found in the response');
        return 'Sorry, I could not generate a response.';
      }
    } catch (error) {
      console.error('Error generating text with GPT-4:', error);
      return 'There was an error processing your request.';
    }
  }

// Helper function to analyze the prompt and adjust parameters
function analyzePromptAndAdjustParameters(prompt) {
  const contextAdjustments = {
    n: 1,
    quality: "hd", // Default quality
    size: "1024x1024",
    style: "vivid", // Default style
    response_format: "url", // Default response format
  };

  // Adjust parameters based on keywords in the prompt
  if (prompt.toLowerCase().includes("detailed") || prompt.toLowerCase().includes("high quality")) {
    contextAdjustments.quality = "hd";
  } else if (prompt.toLowerCase().includes("standard") || prompt.toLowerCase().includes("simple")) {
    contextAdjustments.quality = "standard";
  }

  if (prompt.toLowerCase().includes("vivid") || prompt.toLowerCase().includes("colorful")) {
    contextAdjustments.style = "vivid";
  } else if (prompt.toLowerCase().includes("natural") || prompt.toLowerCase().includes("realistic")) {
    contextAdjustments.style = "natural";
  }

  return contextAdjustments;
}

async function generateImageWithDALLE(prompt, userOptions = {}) {
  // Analyze the prompt to adjust parameters dynamically
  const contextAdjustments = analyzePromptAndAdjustParameters(prompt);
  
  // Ensure userOptions doesn't contain invalid keys or override necessary defaults
  const validOptions = {
    ...contextAdjustments,
    ...validateUserOptions(userOptions),
  };

  const { n, quality, response_format, size, style } = validOptions;

  const endpoint = "https://api.openai.com/v1/images/generations";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };
  const body = JSON.stringify({
    model: "dall-e-3",
    prompt,
    n,
    quality,
    response_format,
    size,
    style,
  });

  for (let attempt = 0; attempt < contextAdjustments.retries || 3; attempt++) {
    try {
      const response = await fetch(endpoint, { method: "POST", headers, body });
      if (!response.ok) {
        // Attempt to read and log the response body for more detail
        const responseBody = await response.json().catch(() => "Unable to parse response body");
        throw new Error(`API request failed with status: ${response.statusText}, body: ${JSON.stringify(responseBody)}`);
      }
      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error('All attempts to generate image have failed.');
}

// Function to validate and sanitize user options
function validateUserOptions(options) {
  const sanitizedOptions = {};
  const validKeys = ['n', 'quality', 'response_format', 'size', 'style'];
  Object.keys(options).forEach(key => {
    if (validKeys.includes(key) && ['hd', 'standard'].includes(options.quality) && ['vivid', 'natural'].includes(options.style)) {
      sanitizedOptions[key] = options[key];
    }
  });
  return sanitizedOptions;
}






client.login(process.env.DISCORD_BOT_TOKEN);