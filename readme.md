DiscoBot: Text and Image Generation Bot for Discord

DiscoBot leverages OpenAI's GPT-4 and DALL-E models to provide an interactive experience on Discord servers, offering both text and image generation capabilities.
Features

    Text Generation: Responds to user messages with contextually relevant, AI-generated text.
    Image Generation: Generates images based on textual prompts using the "!Imagine" command.
    Customizable Responses: Analyzes prompts to adjust image generation parameters dynamically.

Setup

    Install dependencies: npm install
    Set your OpenAI API key in a .env file: OPENAI_API_KEY=your_api_key_here
    Start the bot: node bot.js

Ensure you have Discord.js and other necessary libraries installed.
Usage

    For text responses, simply type your query in the designated text channel.
    For image generation, use the !Imagine [prompt] command in the designated image channel.

Commands

    !Imagine [prompt]: Generates an image based on the provided prompt.

Configuration

You can adjust the bot's behavior by modifying the generateTextWithGPT4 and generateImageWithDALLE functions, such as changing the model or adjusting the generation parameters.