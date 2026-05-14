import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getLeads(): Promise<{ leads: Lead[]; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[leads page] fetch failed", error);
      return { leads: [], error: "Failed to load leads." };
    }
    return { leads: (data ?? []) as Lead[] };
  } catch (err) {
    console.error("[leads page] unexpected error", err);
    return { leads: [], error: "Failed to load leads." };
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function LeadsPage() {
  const { leads, error } = await getLeads();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads</h1>
        <p className="mt-1 text-sm text-slate-600">
          {leads.length} {leads.length === 1 ? "submission" : "submissions"}, sorted by most recent.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {leads.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-600">No leads yet.</p>
        </div>
      ) : (
        <>
          {/* table on tablet+ */}
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Company</Th>
                  <Th>Source</Th>
                  <Th>Submitted</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <Td className="font-medium text-slate-900">{lead.full_name}</Td>
                    <Td>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-slate-700 hover:text-slate-900 hover:underline"
                      >
                        {lead.email}
                      </a>
                    </Td>
                    <Td>{lead.company || "—"}</Td>
                    <Td>{lead.source}</Td>
                    <Td className="whitespace-nowrap text-slate-600">
                      {formatDate(lead.created_at)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* cards on mobile */}
          <ul className="space-y-3 sm:hidden">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-900">{lead.full_name}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {lead.source}
                  </span>
                </div>
                <a
                  href={`mailto:${lead.email}`}
                  className="mt-1 block text-sm text-slate-700 hover:underline"
                >
                  {lead.email}
                </a>
                {lead.company && (
                  <p className="mt-1 text-sm text-slate-600">{lead.company}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">{formatDate(lead.created_at)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-slate-700 ${className}`}>{children}</td>;
}
