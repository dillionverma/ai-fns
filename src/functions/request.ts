import { z } from "zod";
import { aifn } from "../utils";

export default aifn(
  "request",
  "Useful for sending http request. Use this when you need to get specific content from a url. Input is a url, method, body, output is the result of the request.",
  z.object({
    url: z.string(),
    method: z.string().optional(),
    body: z.unknown().optional(),
  }),
  async ({ url, method, body }) => {
    console.log(url, method, body);
    try {
      const res = await fetch(url, { method, body: JSON.stringify(body) });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.log(error);
      return `Failed to execute script: ${error.message}`;
    }
  }
);
