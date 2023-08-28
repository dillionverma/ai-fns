# ai-fns

> Convert any function into a ChatGPT function.

ai-fns is a tiny library that makes it easy to convert any function into a ChatGPT function.

## Features

- 🪄 **100% Type-safe** - uses [zod](https://zod.dev/) to validate the input and output of your functions
- 👶 **Easy to use** - simple API that makes it easy to create your own functions
- 💨 **Lightweight** - is a small library with minimal dependencies

## Install

```sh
pnpm install ai-fns zod
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

## Examples

<details>
<summary>
### Basic Calculator Function
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
### (Advanced) Fetching the Latest stories from reddit
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
