import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/anim';
import { getStoreData } from '@/data/catalog';

export default function AboutPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const data = getStoreData(slug);
  const PERKS = data?.perks ?? [];
  const about = data?.about;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand)]">Our story</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold leading-[1.06] sm:text-6xl">
          {about?.headline ?? ''}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
{about?.intro ?? ''}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius)]">
            <div className="relative aspect-[4/3] w-full">
              <Image src={about?.image ?? ""} alt={about?.imageAlt ?? ""} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex h-full flex-col justify-center gap-5">
{(about?.milestones ?? []).map((m) => (
              <div key={m.value} className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
                <p className="font-display text-3xl font-bold">{m.value}</p>
                <p className="mt-1 text-[var(--ink-soft)]">{m.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-4xl font-bold">How we work</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
{(about?.values ?? []).map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="h-full rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
                <p className="font-display text-2xl font-bold">{v.title}</p>
                <p className="mt-2 leading-relaxed text-[var(--ink-soft)]">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-4xl font-bold">The promises we keep</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk, i) => (
            <Reveal key={perk.title} delay={i * 0.06}>
              <div className="h-full rounded-[var(--radius)] border border-[var(--line)] p-6">
                <p className="font-display text-xl font-bold">{perk.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{perk.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link href={`/shop/${slug}/products`} className="btn-shine inline-block rounded-full bg-[var(--brand)] px-8 py-3.5 font-semibold text-[var(--brand-ink)]">
            Shop the collection
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
