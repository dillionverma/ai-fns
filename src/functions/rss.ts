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
