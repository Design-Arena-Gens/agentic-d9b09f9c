import Image from "next/image";
import { ChatAgent } from "@/components/ChatAgent";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 md:px-12 lg:px-20">
        <header className="grid gap-10 rounded-3xl border border-stone-200 bg-white/80 p-10 shadow-xl backdrop-blur md:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-900">
              Family-run since 1987
            </span>
            <h1 className="text-4xl font-semibold text-stone-900 sm:text-5xl">
              Trusted auto body repair, spray-painting, and insurance support in
              Cape Town.
            </h1>
            <p className="max-w-xl text-lg text-stone-600">
              De Jongh&apos;s Panelbeating Centre blends craftsmanship with care.
              From collision repairs and dent removal to chassis straightening
              and full resprays, our team restores vehicles and reassures
              families every day.
            </p>
            <dl className="grid gap-4 text-sm text-stone-700 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white/70 p-4 shadow-sm">
                <dt className="font-semibold text-stone-900">
                  Workshop Hours
                </dt>
                <dd>Mon-Fri 07:30-17:00 | Sat by appointment</dd>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white/70 p-4 shadow-sm">
                <dt className="font-semibold text-stone-900">
                  Contact &amp; Location
                </dt>
                <dd>
                  12 Metal Road, Bellville South |{" "}
                  <a
                    href="tel:+27219321567"
                    className="font-medium text-amber-700 hover:underline"
                  >
                    +27 21 932 1567
                  </a>
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Insurance-approved
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                OEM-grade paint systems
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-stone-900" />
                English &amp; Afrikaans support
              </span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-amber-50 shadow-lg">
            <Image
              src="/workshop.svg"
              alt="Illustration of De Jongh's Panelbeating Centre workshop"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 36rem"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/80 to-transparent p-6 text-white">
              <p className="text-lg font-semibold">
                &ldquo;We treat every repair as if it&apos;s our family&apos;s car.&rdquo;
              </p>
              <p className="text-sm text-stone-200">- The De Jongh family</p>
            </div>
          </div>
        </header>

        <main className="grid flex-1 gap-10 pb-10 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-stone-900">
              How we restore your vehicle
            </h2>
            <p className="text-stone-600">
              Our workshop combines certified panel beaters, precision chassis
              alignment equipment, and a downdraft spray booth to deliver
              factory-grade finishes. We&apos;re proud to guide clients through
              claims, offer honest timelines, and keep you informed at every
              step.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Collision Repair",
                  detail:
                    "Impact assessment, panel replacement, and structural straightening with digital measuring.",
                },
                {
                  title: "Spray Painting",
                  detail:
                    "Colour matching, full-body resprays, and spot repairs baked to perfection.",
                },
                {
                  title: "Dent & Rust Care",
                  detail:
                    "Paintless dent removal, rust cut-outs, and protective treatments to extend lifespan.",
                },
                {
                  title: "Detailing & Aftercare",
                  detail:
                    "Machine polishing, ceramic coatings, and post-repair care plans.",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-stone-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-600">{item.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <aside className="flex flex-col">
            <ChatAgent />
          </aside>
        </main>
      </div>
    </div>
  );
}
