/**
 * Auth0 CIBA (Client-Initiated Backchannel Authentication)
 *
 * Flow:
 * 1. initiateCIBA()    → sends push notification to user's Auth0 Guardian app
 *                        returns auth_req_id
 * 2. pollCIBA()        → polls Auth0 until user approves/denies
 *                        returns { approved: boolean, accessToken? }
 */

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID!;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET!;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || "911stock-api";

export type CIBAInitResult = {
  authReqId: string;
  expiresIn: number;
  interval: number; // polling interval in seconds
};

export type CIBAStatus =
  | { status: "pending" }
  | { status: "approved"; accessToken: string }
  | { status: "denied" }
  | { status: "expired" };

/**
 * Initiates a CIBA request. Sends a push notification via Auth0 Guardian
 * to the user's enrolled device.
 *
 * @param userId - Auth0 subject ID (e.g. "auth0|abc123")
 * @param bindingMessage - Short message shown on the Guardian push notification
 */
export async function initiateCIBA(
  userId: string,
  bindingMessage: string
): Promise<CIBAInitResult> {
  const res = await fetch(`https://${AUTH0_DOMAIN}/bc-authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      login_hint: JSON.stringify({
        format: "iss_sub",
        iss: `https://${AUTH0_DOMAIN}/`,
        sub: userId,
      }),
      binding_message: bindingMessage,
      scope: "openid stock:trade",
      audience: AUTH0_AUDIENCE,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`CIBA initiation failed: ${err.error_description || err.error}`);
  }

  const data = await res.json();
  return {
    authReqId: data.auth_req_id,
    expiresIn: data.expires_in,
    interval: data.interval ?? 5,
  };
}

/**
 * Polls Auth0 once for CIBA approval status.
 * Call this repeatedly (every `interval` seconds) until status is not "pending".
 */
export async function pollCIBA(authReqId: string): Promise<CIBAStatus> {
  const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "urn:openid:params:grant-type:ciba",
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      auth_req_id: authReqId,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    return { status: "approved", accessToken: data.access_token };
  }

  switch (data.error) {
    case "authorization_pending":
      return { status: "pending" };
    case "access_denied":
      return { status: "denied" };
    case "expired_token":
      return { status: "expired" };
    default:
      throw new Error(`CIBA poll error: ${data.error_description || data.error}`);
  }
}
