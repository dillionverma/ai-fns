import "dotenv/config";
import openai, { OpenAI } from "openai";
import { z } from "zod";
import { env } from "../env";
import { aifn } from "../src/aifn";

const handleFunctionCall = async ({
  model,
  messages,
  functions,
  completion,
}: {
  model: string;
  messages: OpenAI.Chat.CreateChatCompletionRequestMessage[];
  functions: OpenAI.Chat.CompletionCreateParams.Function[];
  completion: OpenAI.Chat.ChatCompletion;
}) => {
  if (completion.choices[0].finish_reason !== "function_call") {
    return completion;
  }

  console.log(JSON.stringify(completion, null, 2));
  // return;
  const currentMessage = completion.choices[0].message;
  const { name, arguments: args } = currentMessage.function_call!;

  const fn = tools[name];
  if (!fn) throw new Error(`Unknown function ${name}`);
  const res = await fn(JSON.parse(args));

  messages.push(currentMessage);
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

  return functionCompletion;
};

(async () => {
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  const model = "gpt-3.5-turbo-16k";
  const messages: OpenAI.Chat.ChatCompletionMessage[] = [
    { role: "user", content: "What's the weather in San Francisco?" },
  ];

  const name = "weather";
  const description = "Get the current weather in a given location";
  const weatherSchema = z.object({
    longitude: z.number().min(-180).max(180).describe("Longitude"),
    latitude: z.number().min(-90).max(90).describe("Latitude"),
  });
  const weather = async ({ latitude, longitude }: z.infer<typeof schema>) => {
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

  const { schema, fn } = aifn(name, description, weatherSchema, weather);

  // Define schema to be used by the AI
  const functions = [schema];

  // Define functions to be called
  const tools = {
    weather: fn,
  };

  // 1. Ask the AI a question
  const completion = await openai.chat.completions.create({
    model,
    messages,
    functions,
  });

  // 2. Handle function calls
  const functionCompletion = await handleFunctionCall({
    model,
    messages,
    functions,
    completion,
  });
})();
