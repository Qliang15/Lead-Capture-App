import LeadForm from "@/components/LeadForm";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tell us a little about yourself and we'll get back to you shortly.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <LeadForm />
      </div>
    </div>
  );
}
