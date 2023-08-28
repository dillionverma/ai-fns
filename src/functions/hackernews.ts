import { z } from "zod";
import { aifn } from "../aifn";

const name = "hackernews";
const description = "Get the latest news from hackernews";
const schema = z.object({
  type: z.enum(["top", "best", "new", "ask", "show", "job"]),
  query: z.string().optional(),
});

const hackernews = async ({ type }: z.infer<typeof schema>) => {
  try {
    const res = await fetch(
      `https://hacker-news.firebaseio.com/v0/${type}stories.json`
    );
    const data = await res.json();

    const stories = await Promise.all(
      data.slice(0, 10).map(async (id: number) => {
        const res = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        return await res.json();
      })
    );

    return stories;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default aifn(name, description, schema, hackernews);
