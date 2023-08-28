# ai-fns

> Convert any function into a ChatGPT function.

ai-fns is a small library that makes it easy to convert any function into a ChatGPT function.

## Features

- **100% Type-safe** - uses [zod](https://zod.dev/) to validate the input and output of your functions
- **Easy to use** - simple API that makes it easy to create your own functions
- **Lightweight** - is a small library with minimal dependencies

## Install

```sh
pnpm install ai-fns
```

## Usage

```ts
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
import { OpenAI } from "openai";
import add from "./tools/add";

const openai = new OpenAI({
  apiKey: "sk-****************************",
});

const messages = [{ role: "user", content: "What is 9 + 10?" }];

const res = await openai.chat.completions.create({
  model: "gpt-4",
  functions: [add.schema], // add your function's schema here
  messages,
});

console.log(res.data.choices[0].text);
```

## Basic Example

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

## Advanced Example

Here's an example of a function that fetches the latest news from an rss feed:

```ts
import Parser from "rss-parser";
import { z } from "zod";
import { aifn } from "ai-fns";

const parser = new Parser();

export const name = "rss";
export const description = "Get the latest news from an rss feed";
export const schema = z.object({
  url: z.string(),
});

export const rss = async ({ url }: z.infer<typeof schema>) => {
  try {
    const feed = await parser.parseURL(url);
    return feed;
  } catch (error) {
    return `Failed to execute script: ${error.message}`;
  }
};
export default aifn(name, description, schema, rss);
```

Let's ask ChatGPT to fetch the latest news from the [Hacker News RSS feed](https://news.ycombinator.com/rss)

```
User: What's the top story on Hacker News today?
Assistant: The top story on Hacker News today is "A new method to reprogram human cells to better mimic embryonic stem cells". It has a score of 294 and 72 comments. You can read more about it [here](https://www.uwa.edu.au/news/Article/2023/August/Scientists-find-way-to-wipe-a-cells-memory-to-reprogram-it-as-a-stem-cell).
```

## Contributing

Do you have an idea for a function? Feel free to open a pull request!

Simply create a new file in the `functions` directory and add your function. Make sure to add a description and schema for your function.

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
