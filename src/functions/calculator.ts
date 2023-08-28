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
