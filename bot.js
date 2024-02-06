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

  async function generateImageWithDALLE(prompt) {
    const response = await fetch("https://api.openai.com/v1/images/generations", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3", // DALL-E 3 for higher detail and larger prompt capacity
        prompt: prompt,
        n: 1, // Only 1 image is supported for DALL-E 3
        quality: "hd", // For higher detail images
        response_format: "url", // Assuming you want the URL of the generated image
        size: "1024x1024", // Specify other sizes if needed
        style: "natural" // Choose "natural" for less hyper-real images
      }),
    });
  
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.data[0].url; // Assuming 'data.data[0].url' matches the response structure
}



client.login(process.env.DISCORD_BOT_TOKEN);