import { input } from "@inquirer/prompts";
import chalk from "chalk";
import "dotenv/config";
import OpenAI from "openai";
import { env } from "../env.mjs";
import * as tools from "../src/functions";
import { askAI } from "../src/utils";

export const functions = Object.entries(tools).reduce((acc, [name, tool]) => {
  acc[name] = tool.fn;
  return acc;
}, {} as Record<string, (args: any) => any>);
export const schemas = Object.values(tools).map((tool) => tool.schema);

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

async function main(messages: OpenAI.Chat.ChatCompletionMessage[] = []) {
  console.log(chalk.green("Welcome to the ai-fns cli tool!"));
  console.log(chalk.green("Start by typing a query, or type 'exit' to exit."));

  const questions = {
    message: chalk.cyan("User:"),
  };

  let answer = await input(questions);

  // Check if user wants to exit
  if (answer.toLowerCase() === "exit") {
    console.log(chalk.magenta("Goodbye!"));
    return; // Exit the function, stopping the loop
  }

  if (answer) {
    messages.push({ role: "user", content: answer }); // Append the user message
    let completion = await askAI(messages);
    messages.push({
      role: "assistant",
      content: completion.choices[0].message.content,
    });
    console.log(
      chalk.magenta(`Assistant:`, completion.choices[0].message.content)
    );
  } else {
    console.log(chalk.red("You did not provide a query!"));
  }

  main(messages); // Loop
}

// Run the main function
main();
