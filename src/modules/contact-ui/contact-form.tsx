"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const input = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error("Could not send your message");
      setSubmitted(true);
    } catch {
      setError("Your message could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="flex min-h-[420px] flex-col items-start justify-center rounded-2xl bg-[#f6f6f6] p-8 md:p-12"
      >
        <CheckCircle2 size={42} strokeWidth={1.4} />
        <h2 className="mt-6 text-3xl font-light tracking-[-0.04em]">
          Thanks for reaching out.
        </h2>
        <p className="mt-4 max-w-md leading-7 text-[#666]">
          Your message has been received and saved. We will add delivery and
          support workflows when the store is ready for them.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 text-sm font-semibold underline underline-offset-4"
        >
          Write another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-2xl bg-[#f6f6f6] p-6 md:grid-cols-2 md:p-10"
    >
      <label className="grid gap-2 text-sm font-medium">
        First name
        <input
          name="firstName"
          required
          autoComplete="given-name"
          placeholder="Your first name"
          className="h-14 rounded-md border border-[#ddd] bg-white px-4 outline-none focus:border-black"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Last name
        <input
          name="lastName"
          required
          autoComplete="family-name"
          placeholder="Your last name"
          className="h-14 rounded-md border border-[#ddd] bg-white px-4 outline-none focus:border-black"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium md:col-span-2">
        Email address
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="h-14 rounded-md border border-[#ddd] bg-white px-4 outline-none focus:border-black"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium md:col-span-2">
        Message
        <textarea
          name="message"
          required
          minLength={10}
          rows={6}
          placeholder="How can we help?"
          className="resize-y rounded-md border border-[#ddd] bg-white p-4 outline-none focus:border-black"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700 md:col-span-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="flex h-14 items-center justify-center gap-2 rounded-md bg-black px-8 text-sm text-white transition-transform hover:-translate-y-0.5 md:col-span-2 md:justify-self-start"
      >
        {submitting ? "Sending…" : "Send message"}
        <ArrowRight size={17} />
      </button>
    </form>
  );
}
