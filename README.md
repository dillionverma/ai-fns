# ai-fns

> Convert any function into a ChatGPT function.

ai-fns is a tiny library that convert any function into a function that can be called by ChatGPT.

The underlying spec is based on OpenAI's new [function calling feature](https://platform.openai.com/docs/guides/gpt/function-calling).

## Features

- 🛠️ **8+ built-in functions** - comes included with functions for math, rss, requests, clock and more
- 🪄 **100% Type-safe** - uses [zod](https://zod.dev/) to validate the input and output of your functions
- 👶 **Easy to use** - simple API that makes it easy to create your own functions
- 💨 **Lightweight** - is a small library with minimal dependencies

## Install

```sh
pnpm install ai-fns zod
```

## Before

😮‍💨 Create a JSON schema for your function manually and pass it to ChatGPT

```ts
import openai, { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

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
    return await res.json();
  } catch (error) {
    return error;
  }
};

const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo-16k",
  messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
  functions: [
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
  ],
});
```

## After

✨ Use `ai-fns` to automatically generate a schema for your function and pass it to ChatGPT

```ts
import openai, { OpenAI } from "openai";
import { z } from "zod";
import { aifn } from "ai-fns";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const { schema, fn } = aifn(
  "weather",
  "Get the current weather in a given location",
  z.object({
    longitude: z.number().min(-180).max(180).describe("Longitude"),
    latitude: z.number().min(-90).max(90).describe("Latitude"),
  }),
  async ({ latitude, longitude }) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      return await res.json();
    } catch (error) {
      return error;
    }
  }
);

// Ask the AI a question
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo-16k",
  messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
  functions: [schema],
});
```

<!-- ## Usage

```ts
// functions/add.ts

import { z } from "zod";
import { aifn } from "ai-fns";

export const name = "add";
export const description = "add two numbers";

export const schema = z.object({
  a: z.number(),
  b: z.number(),
});

export const fn = async ({ a, b }: z.infer<typeof schema>) => {
  return a + b;
};

export default aifn(name, description, schema, fn);
```

```ts
// index.ts

import { OpenAI } from "openai";
import add from "./functions/add";

const openai = new OpenAI({
  apiKey: "sk-****************************",
});

const model = "gpt-4";
const messages = [{ role: "user", content: "What is 9 + 10?" }];
const functions = [add.schema]; // add your function's schema here

const res = await openai.chat.completions.create({
  model,
  functions,
  messages,
});

console.log(res.data.choices[0].message);
``` -->

## Examples

<details>
<summary>
(CLICK TO EXPAND) (Basic) Calculator Function
</summary>

Here's an example of a function that calculates the output of a given mathematical expression:

```ts
import { Parser } from "expr-eval";
import { z } from "zod";
import { aifn } from "ai-fns";

const parser = new Parser();

export default aifn(
  "calculator",
  "Calculate the output of a given mathematical expression",
  z.object({
    expression: z.string(),
  }),
  ({ expression }) => {
    try {
      const result = parser.parse(expression).evaluate();
      return result;
    } catch (error) {
      return `Failed to execute script: ${error.message}`;
    }
  }
);
```

Now, you can just ask ChatGPT to do some math for you:

```
User: What's 45^(2.12) / 45?
Assistant: The result of 45^(2.12) / 45 is approximately 71.06.
```

</details>

<details>
<summary>
(CLICK TO EXPAND) (Advanced) Reddit Function - Get the latest news from any subreddit
</summary>

Here's an example of a function that fetches the latest news from an rss feed:

```ts
import { z } from "zod";
import { aifn } from "ai-fns";

const name = "reddit";
const description = "Get stories from reddit";
const schema = z.object({
  subreddit: z.string().optional().default("all").describe("Subreddit"),
  limit: z.number().optional().default(5).describe("Limit"),
  category: z
    .enum(["hot", "new", "random", "top", "rising", "controversial"])
    .default("hot")
    .describe("category"),
});

const reddit = async ({
  subreddit,
  category,
  limit,
}: z.infer<typeof schema>) => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    const url = `https://www.reddit.com/r/${subreddit}/${category}.json?${params.toString()}`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default aifn(name, description, schema, reddit);
```

```
User: What's the top story on /r/programming today?
Assistant: The top story on /r/programming is "Crumb: A New Programming Language Where There are No Keywords, and Everything is a Function". You can read more about it [here](https://github.com/liam-ilan/crumb). It has received 201 upvotes and has 25 comments.
```

</details>

## Why?

OpenAI's new [function calling feature](https://platform.openai.com/docs/guides/gpt/function-calling) allows you to call functions from within ChatGPT.

However, it requires you to pass as JSON schema for your function containing the input and output types of your function. This is a bit cumbersome to do manually.

This library automatically handles the conversion for you ✨

## Where can I use this?

- ✅ You are building AI agents which need to call functions
- ✅ You want ChatGPT to output structured data (e.g. JSON)

## Contributing

Do you have an idea for a function? Feel free to open a pull request!

Simply create a new file in the `src/functions` directory and add your function. Make sure to add a description and schema for your function.

```ts
import { z } from "zod";
import { aifn } from "ai-fns";

export const name = "name";
export const description = "description";
export const schema = z.object({
  // schema
});
export const fn = async ({}: /* schema */ z.infer<typeof schema>) => {
  // function body
};

export default aifn(name, description, schema, fn);
```
