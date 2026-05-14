export type LeadSource = "Google" | "Referral" | "Social" | "Other";

export const LEAD_SOURCES: LeadSource[] = [
  "Google",
  "Referral",
  "Social",
  "Other",
];

export interface LeadInput {
  full_name: string;
  email: string;
  company?: string | null;
  source: LeadSource;
  message?: string | null;
}

export interface Lead extends LeadInput {
  id: string;
  created_at: string;
}
