import { Auth0AI, setAIContext } from "@auth0/ai-vercel";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { tool } from "ai";
import { z } from "zod";
import crypto from "node:crypto";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const auth0AI = new Auth0AI({
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  },
});

// CIBA-protected trade tool
// Wraps the trade action with Auth0 async authorization
export function createTradeAuthorizer(userId: string) {
  const useAsyncAuthz = auth0AI.withAsyncAuthorization({
    userID: () => userId,
    bindingMessage: async ({ ticker, action, pct }: { ticker: string; action: string; pct: number }) =>
      `911Stock wants to ${action} your ${ticker} position by ${pct}%`,
    scopes: ["openid", "stock:trade"],
    audience: process.env.AUTH0_AUDIENCE || "911stock-api",
  });

  return useAsyncAuthz(
    tool({
      description: "Reduce stock position after user approval",
      inputSchema: z.object({
        ticker: z.string(),
        action: z.string(),
        pct: z.number(),
      }),
      execute: async ({ ticker, action, pct }) => {
        // Simulated trade execution (WoZ — no real brokerage)
        return {
          success: true,
          message: `${action} ${ticker} by ${pct}% — authorized via Auth0 CIBA`,
          estimatedSavings: 2550,
        };
      },
    })
  );
}

// Initiate the CIBA authorization flow for a trade
export async function requestTradeApproval(params: {
  userId: string;
  ticker: string;
  action: string;
  pct: number;
}) {
  const threadID = crypto.randomUUID();

  // Set AI context for this thread
  setAIContext({ threadID });

  const tradeTool = createTradeAuthorizer(params.userId);

  const result = await generateText({
    model: google("gemini-2.0-flash-exp"),
    messages: [
      {
        role: "user",
        content: `Execute trade: ${params.action} ${params.ticker} by ${params.pct}%`,
      },
    ],
    tools: {
      executeTrade: tradeTool,
    },
    // @ts-expect-error — maxSteps exists at runtime but type defs differ across versions
    maxSteps: 2,
  });

  return { threadID, result: result.text };
}
