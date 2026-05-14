"use client";

import { useState } from "react";
import { LEAD_SOURCES, LeadInput, LeadSource } from "@/lib/types";
import { validateLead, ValidationErrors, hasErrors } from "@/lib/validation";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const initialForm = {
  full_name: "",
  email: "",
  company: "",
  source: "" as LeadSource | "",
  message: "",
};

export default function LeadForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    // clear the error for this field once the user starts fixing it
    if (errors[key as keyof ValidationErrors]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as keyof ValidationErrors];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const partial: Partial<LeadInput> = {
      full_name: form.full_name,
      email: form.email,
      company: form.company || null,
      source: form.source as LeadSource,
      message: form.message || null,
    };

    const validation = validateLead(partial);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }

    setErrors({});
    setStatus({ kind: "submitting" });

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 409) {
          setStatus({
            kind: "error",
            message: data.error || "We already have a submission with that email.",
          });
        } else if (res.status === 400 && data.fieldErrors) {
          setErrors(data.fieldErrors);
          setStatus({ kind: "idle" });
        } else {
          setStatus({
            kind: "error",
            message: data.error || "Something went wrong. Please try again.",
          });
        }
        return;
      }

      setStatus({ kind: "success" });
      setForm(initialForm);
    } catch {
      setStatus({
        kind: "error",
        message: "Couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-xl font-semibold text-green-900">
          Thanks, we'll be in touch!
        </h2>
        <p className="mt-2 text-sm text-green-800">
          Your submission has been received.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-4 text-sm font-medium text-green-900 underline hover:no-underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  const submitting = status.kind === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {status.kind === "error" && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {status.message}
        </div>
      )}

      <Field label="Full name" required error={errors.full_name} htmlFor="full_name">
        <input
          id="full_name"
          type="text"
          autoComplete="name"
          value={form.full_name}
          onChange={(e) => updateField("full_name", e.target.value)}
          disabled={submitting}
          className={inputClass(!!errors.full_name)}
        />
      </Field>

      <Field label="Email" required error={errors.email} htmlFor="email">
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          disabled={submitting}
          className={inputClass(!!errors.email)}
        />
      </Field>

      <Field label="Company" htmlFor="company">
        <input
          id="company"
          type="text"
          autoComplete="organization"
          value={form.company}
          onChange={(e) => updateField("company", e.target.value)}
          disabled={submitting}
          className={inputClass(false)}
        />
      </Field>

      <Field
        label="How did you hear about us?"
        required
        error={errors.source}
        htmlFor="source"
      >
        <select
          id="source"
          value={form.source}
          onChange={(e) => updateField("source", e.target.value as LeadSource)}
          disabled={submitting}
          className={inputClass(!!errors.source)}
        >
          <option value="" disabled>
            Select an option...
          </option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message" htmlFor="message">
        <textarea
          id="message"
          rows={4}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          disabled={submitting}
          className={inputClass(false)}
        />
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

function inputClass(hasError: boolean) {
  const base =
    "w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-500";
  const state = hasError
    ? "border-red-400 focus:border-red-500 focus:ring-red-300"
    : "border-slate-300 focus:border-slate-500 focus:ring-slate-300";
  return `${base} ${state}`;
}

function Field({
  label,
  required,
  error,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-800">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
