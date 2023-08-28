import OpenAI from "openai";
import { functions, openai, schemas } from "../cli";

/**
 * Ask the AI a question
 * @param messages messages to send to the AI
 * @param model model to use
 * @param props
 * @returns
 * @throws
 * @example
 * const messages = [
 *  {
 *   role: "user",
 *   content: "What is the meaning of life?"
 *  }
 * ]
 *
 * const completion = await askAI(messages)
 * console.log(completion)
 *
 **/
export const askAI = async (
  messages: OpenAI.Chat.ChatCompletionMessage[],
  model: string = "gpt-3.5-turbo-16k",
  props?: OpenAI.Chat.CompletionCreateParamsNonStreaming
) => {
  let completion = await openai.chat.completions.create({
    messages,
    functions: schemas,
    model,
    ...props,
  });

  switch (completion.choices[0].finish_reason) {
    case "stop":
      return completion;
    case "length":
      throw new Error("Message too long");
    case "function_call":
      const { name, arguments: args } =
        completion.choices[0].message.function_call!;
      const fn = functions[name];
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
        // @ts-ignore
        name,
        content: JSON.stringify({ res }),
      });

      console.log(messages);
      return askAI(messages);
    default:
      throw new Error("Unknown finish reason");
  }
};
