/**
 * Owner SMS notifications via Twilio's REST API.
 *
 * Fire-and-forget — never throws and never blocks the response to the
 * customer. If Twilio env vars are missing the function logs and returns;
 * if the call fails the failure is logged but the request still succeeds.
 */

interface SmsConfig {
  accountSid: string;
  authToken: string;
  from: string;
  to: string;
}

function getSmsConfig(): SmsConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.OWNER_PHONE;
  if (!accountSid || !authToken || !from || !to) return null;
  return { accountSid, authToken, from, to };
}

export async function sendOwnerSms(body: string): Promise<void> {
  const config = getSmsConfig();
  if (!config) {
    console.warn("[sms] skipped — Twilio env vars not all set");
    return;
  }
  try {
    const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
    const params = new URLSearchParams({
      Body: body,
      From: config.from,
      To: config.to,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[sms] Twilio ${res.status}: ${errBody}`);
      return;
    }
    console.log("[sms] owner notification sent");
  } catch (err) {
    console.error("[sms] failed to send:", err);
  }
}
