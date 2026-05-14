import { LEAD_SOURCES, LeadInput, LeadSource } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationErrors {
  full_name?: string;
  email?: string;
  source?: string;
}

export function validateLead(input: Partial<LeadInput>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.full_name || !input.full_name.trim()) {
    errors.full_name = "Full name is required.";
  } else if (input.full_name.trim().length > 200) {
    errors.full_name = "Full name is too long.";
  }

  if (!input.email || !input.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(input.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!input.source || !LEAD_SOURCES.includes(input.source as LeadSource)) {
    errors.source = "Please select how you heard about us.";
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
