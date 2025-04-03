import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data, MODEL_ID, generateHaikuFunction } from "./data/resource";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export const backend = defineBackend({
  auth,
  data,
  generateHaikuFunction,
});


backend.generateHaikuFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      // More specific ARN format
      `arn:aws:bedrock:us-east-1:Amazon:foundation-model/${MODEL_ID}`,
      // Alternative format that sometimes works better
      `arn:aws:bedrock:us-east-1::foundation-model/${MODEL_ID}`,
    ],
  })
);