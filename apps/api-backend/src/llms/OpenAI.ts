import { Messages } from "../types";
import { BaseLlm, LlmResponse } from "./Base";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAi extends BaseLlm {
  static async chat(model: string, messages: Messages): Promise<LlmResponse> {
    const response = await client.chat.completions.create({
      model: model,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    return {
      inputTokensConsumed: response.usage?.prompt_tokens ?? 0,
      outputTokensConsumed: response.usage?.completion_tokens ?? 0,
      completions: {
        choices: response.choices.map((choice) => ({
          message: {
            content: choice.message.content ?? "",
          },
        })),
      },
    };
  }
}
