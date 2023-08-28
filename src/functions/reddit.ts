import { z } from "zod";
import { aifn } from "../utils";

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
