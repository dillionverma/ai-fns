## ai-fns

ai-fns is a **a library for building 100% type-safe functions which can be called by OpenAI's ChatGPT**

## Features

- **100% Type-safe** - ai-fns uses [zod](https://zod.dev/) to validate the input and output of your functions
- **Easy to use** - ai-fns provides a simple API for creating functions
- **Lightweight** - ai-fns is a small library with minimal dependencies

## Installation

```sh
pnpm install ai-fns
```

## Basic Example

Here's an example of a function that calculates the output of a given mathematical expression:

```ts
import { Parser } from "expr-eval";
import { z } from "zod";
import { aifn } from "../utils";

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
import { aifn } from "../utils";

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

## Make your own!

You can make your own functions by creating a new file in the `tools` directory. Here's a template:

```ts
import { z } from "zod";
import { aifn } from "../utils";

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
