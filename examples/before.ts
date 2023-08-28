import "dotenv/config";
import { OpenAI } from "openai";
import { env } from "../env";

(async () => {
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  const model = "gpt-3.5-turbo-16k";
  const messages: OpenAI.Chat.CreateChatCompletionRequestMessage[] = [
    { role: "user", content: "What's the weather in San Francisco?" },
  ];

  const weather = async ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = await res.json();
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const functions: OpenAI.Chat.CompletionCreateParams.Function[] = [
    {
      name: "weather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          longitude: {
            type: "number",
            minimum: -180,
            maximum: 180,
            description: "Longitude",
          },
          latitude: {
            type: "number",
            minimum: -90,
            maximum: 90,
            description: "Latitude",
          },
        },
        required: ["longitude", "latitude"],
        additionalProperties: false,
      },
    },
  ];

  // Define functions to be called
  const tools = {
    weather,
  };

  // 1. Ask the AI a question
  const completion = await openai.chat.completions.create({
    model,
    messages,
    functions,
  });

  // 2. Check if the AI called a function
  if (completion.choices[0].finish_reason === "function_call") {
    const { name, arguments: args } =
      completion.choices[0].message.function_call!;
    const fn = tools[name];
    if (!fn) throw new Error(`Unknown function ${name}`);
    const res = await fn(JSON.parse(args));

    messages.push({
      role: "assistant",
      content: null,
      function_call: {
        name,
        arguments: args,
      },
    });

    messages.push({
      role: "function",
      name,
      content: JSON.stringify({ res }),
    });

    // 3. Ask the AI again with the response from calling the function
    let functionCompletion = await openai.chat.completions.create({
      model,
      messages,
      functions,
    });

    console.log(messages);
    console.log(functionCompletion.choices[0].message.content);
  }
})();
