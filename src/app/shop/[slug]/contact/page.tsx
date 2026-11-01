'use client';

import { useState, type FormEvent } from 'react';
import { getStoreData } from '@/data/catalog';
import { Reveal } from '@/components/anim';

const inputCls =
  'w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]';

export default function ContactPage({ params }: { params: { slug: string } }) {
  const contact = getStoreData(params.slug)?.contact;
  const topics = contact?.topics ?? ['Order question'];
  const [form, setForm] = useState({ name: '', email: '', topic: topics[0], message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.message.trim().length < 10) {
      setError('Please tell us a little more (at least 10 characters).');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand)]">Contact</p>
        <h1 className="mt-3 font-display text-5xl font-bold sm:text-6xl">Talk to a human.</h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--ink-soft)]">
          Questions about sizing, shipping or an order? Our small team answers every message — usually within one
          business day.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-5">
{[
            { t: 'Email us', d: contact?.email ?? '', s: contact?.emailNote ?? '' },
            { t: 'Visit us', d: contact?.address ?? '', s: contact?.addressHours ?? '' },
            { t: 'Call us', d: contact?.phone ?? '', s: contact?.phoneHours ?? '' },
          ].map((c) => (
            <div key={c.t} className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--ink-soft)]">{c.t}</p>
              <p className="mt-1 font-display text-xl font-bold">{c.d}</p>
              <p className="text-sm text-[var(--ink-soft)]">{c.s}</p>
            </div>
          ))}
          <div className="rounded-[var(--radius)] bg-[var(--ink)] p-6 text-white">
<p className="font-display text-xl font-bold">{contact?.helpTitle ?? ''}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/75">{contact?.helpText ?? ''}</p>
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6 sm:p-8">
          {sent ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-3xl">✓</div>
              <h2 className="mt-5 font-display text-3xl font-bold">Message received, {form.name.split(' ')[0]}.</h2>
              <p className="mt-2 max-w-sm text-[var(--ink-soft)]">
                Thank you for writing. We will reply to {form.email} within one business day. (Demo form — nothing was
                actually sent.)
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setForm({ name: '', email: '', topic: topics[0], message: '' });
                }}
                className="mt-6 rounded-full border-2 border-[var(--ink)] px-6 py-2.5 font-semibold"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="text-sm font-semibold">
                  Your name
                </label>
                <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Appleseed" className={inputCls} />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-semibold">
                  Email address
                </label>
                <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label htmlFor="topic" className="text-sm font-semibold">
                  Topic
                </label>
                <select id="topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={inputCls}>
{topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-semibold">
                  Message
                </label>
                <textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" className={inputCls} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="btn-shine rounded-full bg-[var(--brand)] py-3.5 font-semibold text-[var(--brand-ink)] transition hover:brightness-110">
                Send message
              </button>
              <p className="text-center text-xs text-[var(--ink-soft)]">Demo form — messages are not actually sent anywhere.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
