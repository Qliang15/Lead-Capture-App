import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { validateLead, hasErrors } from "@/lib/validation";
import { LeadInput } from "@/lib/types";

const WEBHOOK_URL = "https://webhook-receiver-flax.vercel.app/api/lead-webhook";

async function forwardToWebhook(lead: LeadInput & { id: string }) {
  const candidateName = process.env.CANDIDATE_NAME || "Unknown Candidate";

  if (!process.env.CANDIDATE_NAME) {
    console.error("[webhook] CANDIDATE_NAME not set, using fallback");
  }

  // don't let a slow webhook hang the request
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Candidate-Name": candidateName,
      },
      body: JSON.stringify(lead),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error("[webhook] failed", {
        leadId: lead.id,
        status: res.status,
      });
    }
  } catch (err) {
    console.error("[webhook] error", {
      leadId: lead.id,
      message: err instanceof Error ? err.message : String(err),
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  let body: Partial<LeadInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors = validateLead(body);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: errors },
      { status: 400 }
    );
  }

  const lead: LeadInput = {
    full_name: body.full_name!.trim(),
    email: body.email!.trim().toLowerCase(),
    company: body.company?.trim() || null,
    source: body.source!,
    message: body.message?.trim() || null,
  };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .insert(lead)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A lead with this email already exists." },
        { status: 409 }
      );
    }
    console.error("[leads] insert failed", error);
    return NextResponse.json(
      { error: "Failed to save lead. Please try again." },
      { status: 500 }
    );
  }

  // fire webhook after save, failures are logged but don't fail the request
  await forwardToWebhook(data);

  return NextResponse.json({ ok: true, lead: data }, { status: 201 });
}
