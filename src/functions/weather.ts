import { z } from "zod";
import { aifn } from "../aifn";

export const name = "weather";
export const description = "Get the current weather in a given location";

export const schema = z.object({
  longitude: z.number().min(-180).max(180).describe("Longitude"),
  latitude: z.number().min(-90).max(90).describe("Latitude"),
});

const fn = async ({ latitude, longitude }: z.infer<typeof schema>) => {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    return res.json();
  } catch (error) {
    return error;
  }
};

export default aifn(name, description, schema, fn);
