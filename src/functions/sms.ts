import { Twilio } from "twilio";
import { z } from "zod";
import { env } from "../../env.mjs";
import { aifn } from "../utils";

const client = new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
const FROM = env.TWILIO_PHONE_NUMBER;

const name = "sms";
const description = "Send a text message to a phone number";
const schema = z.object({
  from: z.string().optional(),
  to: z.string().regex(/^\+[1-9]\d{1,14}$/),
  body: z.string(),
});
const sms = async ({ from = FROM, to, body }: z.infer<typeof schema>) => {
  try {
    const sms = await client.messages.create({
      from,
      to,
      body,
    });

    return sms;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default aifn(name, description, schema, sms);
