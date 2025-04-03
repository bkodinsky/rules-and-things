import type { Schema } from "./resource";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

// initialize bedrock runtime client
const client = new BedrockRuntimeClient();

export const handler: Schema["generateHaiku"]["functionHandler"] = async (
  event,
  context
) => {
  // User prompt
  const prompt = event.arguments.prompt;

  // Invoke model
  const input: InvokeModelCommandInput = {
    modelId: process.env.MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      "inferenceConfig": {
        "max_new_tokens": 1000
      },
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "text": prompt
            }
          ]
        }
      ]
    })
  };
  
  const command = new InvokeModelCommand(input);

  const response = await client.send(command);

  // Parse the response and return the generated haiku
  const data = JSON.parse(Buffer.from(response.body).toString());

  return data.content[0].text;
};