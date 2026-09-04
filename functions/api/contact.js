import { readAttribution, ATTRIBUTION_COLUMNS } from "./_shared/attribution.js";
// One Take Wonder — Contact Form Handler (Cloudflare Pages Function)
// Replaces the dead placeholder Formspree action. Emails submissions to the
// business contact via Resend (sender domain getranklabs.com is verified).
export async function onRequestPost(context) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const form = await context.request.formData();
    const d = Object.fromEntries(form.entries());
    const { name, company, email, phone, interest, availability, message } = d;

    if (!name || !email) return json({ error: "Name and email are required" }, 400);

    // Cloudflare Turnstile verification
    const turnstileToken = d['cf-turnstile-response'] || form.get('cf-turnstile-response');
    const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
    if (!turnstileToken) return json({ error: "Security check required. Please enable JavaScript and try again." }, 400);
    if (turnstileSecret) {
      const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
      });
      const result = await verify.json();
      if (!result.success) {
        console.error("Turnstile verification failed:", JSON.stringify(result));
        return json({ error: "Security check failed. Please refresh and try again." }, 400);
      }
    }

    const submittedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    const resendKey = context.env.RESEND_API_KEY;
    if (!resendKey) return json({ error: "Email not configured" }, 503);

    const htmlBody = `<div style="font-family:-apple-system,sans-serif;max-width:560px">
  <h2 style="color:#ec4899;margin:0 0 12px">🎬 New Consultation Request</h2>
  <table style="border-collapse:collapse;font-size:14px">
    <tr><td style="padding:4px 12px 4px 0"><strong>Name</strong></td><td>${name}</td></tr>
    <tr><td style="padding:4px 12px 4px 0"><strong>Company</strong></td><td>${company || "N/A"}</td></tr>
    <tr><td style="padding:4px 12px 4px 0"><strong>Email</strong></td><td>${email}</td></tr>
    <tr><td style="padding:4px 12px 4px 0"><strong>Phone</strong></td><td>${phone || "N/A"}</td></tr>
    <tr><td style="padding:4px 12px 4px 0"><strong>Interest</strong></td><td>${interest || "N/A"}</td></tr>
    <tr><td style="padding:4px 12px 4px 0"><strong>Availability</strong></td><td>${availability || "N/A"}</td></tr>
  </table>
  <p style="font-size:14px"><strong>Goals:</strong><br>${(message || "N/A").replace(/\n/g, "<br>")}</p>
  <p style="color:#888;font-size:12px">Submitted ${submittedAt} ET via onetakewondermarketing.com</p>
</div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "One Take Wonder <hello@getranklabs.com>",
        to: "pearl@onetakewonderproductions.com",
        reply_to: email,
        subject: `🎬 New Consultation Request — ${name}${company ? ` (${company})` : ""}`,
        html: htmlBody,
      }),
    });
    if (!resp.ok) {
      console.error("Contact email rejected by Resend:", resp.status, await resp.text());
      return json({ error: "Could not send right now — please email pearl@onetakewonderproductions.com" }, 502);
    }

    // optional Telegram (skipped silently if not configured)
    const tg = context.env.TELEGRAM_BOT_TOKEN;
    if (tg) {
      const chatId = context.env.TELEGRAM_CHAT_ID || "5016070713";
      // First-touch attribution captured by the page (see Layout.astro). Works
      // for visitors GA4 never sees because a blocker stopped its script.
      const _attr = readAttribution(form);
      context.waitUntil(fetch(`https://api.telegram.org/bot${tg}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, parse_mode: "HTML", disable_web_page_preview: true,
          text: `<b>🎬 New Consultation Request</b>\n<b>Name:</b> ${name}\n<b>Company:</b> ${company || "N/A"}\n<b>Email:</b> ${email}\n<b>Phone:</b> ${phone || "N/A"}\n<b>Interest:</b> ${interest || "N/A"}` }),
      }).catch(() => {}));
    }

    // Server-side performance event (non-PII) — fire-and-forget.
    if (context.env.PERFORMANCE_DB && typeof context.waitUntil === "function") {
      const receivedAt = new Date().toISOString();
      context.waitUntil(context.env.PERFORMANCE_DB.prepare(
        `INSERT INTO performance_events
           (id, customer_id, event_name, occurred_at, received_at, form_id, form_type, page_path, event_version,
            referrer_url, referrer_host, landing_page, utm_source, utm_medium, utm_campaign, gclid,
            ga_client_id, attributed_channel)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID(), "bg_113610_002aea", "generate_lead", receivedAt, receivedAt,
        "contact", "contact", "/contact", 1,
        ...ATTRIBUTION_COLUMNS.map((c) => _attr[c]),
      ).run().catch((error) => { console.error("Performance event logging failed:", error.message); }));
    }

    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
