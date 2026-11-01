import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/anim';
import { PERKS } from '@/data/aurelle';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand)]">Our story</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold leading-[1.06] sm:text-6xl">
          Slow fashion for fast lives.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
          Aurelle began in a two-room atelier with one belief: the clothes you live in should be made with the same
          care as the clothes you save for special days. No seasons of throwaway fashion — just considered pieces in
          honest materials, designed to be worn, washed, repaired and loved for years.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius)]">
            <div className="relative aspect-[4/3] w-full">
              <Image src="/images/aurelle/lookbook-2.jpg" alt="Aurelle lookbook — knitwear and tailoring on the street" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex h-full flex-col justify-center gap-5">
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
              <p className="font-display text-3xl font-bold">2019</p>
              <p className="mt-1 text-[var(--ink-soft)]">Founded in a two-room atelier. First collection: six pieces, one fabric mill.</p>
            </div>
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
              <p className="font-display text-3xl font-bold">38 mills</p>
              <p className="mt-1 text-[var(--ink-soft)]">Partner mills and workshops across Italy, Portugal and Japan — all visited in person.</p>
            </div>
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
              <p className="font-display text-3xl font-bold">0 plastic</p>
              <p className="mt-1 text-[var(--ink-soft)]">No virgin plastic in any product or package since day one.</p>
            </div>
          </div>
        </Reveal>
      </div>

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-4xl font-bold">How we work</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { title: 'Design slowly', text: 'Each piece is sketched, sampled and worn by our own team for a full month before it earns a place in the collection.' },
            { title: 'Make honestly', text: 'We name every mill and workshop. If we would not be proud to show you how it is made, we do not make it.' },
            { title: 'Stand behind it', text: 'A two-year craftsmanship warranty and free repairs for life. Good clothes should be fixable, not disposable.' },
          ].map((v, i) => (
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
          <Link href="/shop/aurelle/products" className="btn-shine inline-block rounded-full bg-[var(--brand)] px-8 py-3.5 font-semibold text-[var(--brand-ink)]">
            Shop the collection
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
