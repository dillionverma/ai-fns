import { z } from "zod";
import { aifn } from "../utils";

export default aifn(
  "clock",
  "Get the current time given a timezone",
  z.object({
    timeZone: z.string(),
  }),
  ({ timeZone }) => {
    return new Date().toLocaleTimeString("en-US", {
      timeZone,
    });
  }
);
