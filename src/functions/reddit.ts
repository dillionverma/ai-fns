import { z } from "zod";
import { aifn } from "../utils";

const name = "reddit";
const description = "Get stories from reddit";
const schema = z.object({
  subreddit: z.string().optional(),
  limit: z.number().optional(),
  type: z.enum(["hot", "new", "random", "top", "rising", "controversial"]),
});

const reddit = async ({ subreddit, type, limit }: z.infer<typeof schema>) => {
  try {
    const params = new URLSearchParams({
      limit: limit ? limit.toString() : "10",
    });

    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/${type}.json?${params.toString()}}`
    );

    return await res.json();
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default aifn(name, description, schema, reddit);
