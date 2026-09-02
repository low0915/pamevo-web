"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CONTACT, CONTACT_ZH, CONTACT_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";

const FIELD =
  "mt-2 w-full rounded-[10px] border border-line bg-bg px-4 py-3 text-base text-ink transition-colors duration-[160ms] ease-[var(--ease-out)] placeholder:text-ink-3 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60 aria-[invalid=true]:border-[rgb(163_52_52/0.55)]";

const LABEL = "block text-sm font-medium text-ink";

const ERROR = "mt-2 text-sm text-[rgb(150_44_44)]";

/** The same bounds the route enforces. Duplicated deliberately: the client
 *  copy is for telling someone what to fix, the server copy is the one that
 *  decides, and neither can stand in for the other. */
const LIMITS = { name: 2, message: 10, phoneDigits: 8 };

type Status = "idle" | "submitting" | "sent" | "error";

type Field = "name" | "contact" | "message";

/**
 * The enquiry form.
 *
 * Three things are asked for: who this is, one way to reply, and what it is
 * about. Either contact field satisfies the second, which is why the error
 * lives on the pair rather than on each of them.
 *
 * Validation runs on blur and on submit, never on keystrokes — nobody wants to
 * be told their email is wrong while they are halfway through typing it. Once a
 * field has been marked wrong it revalidates as it is edited, so the error
 * clears the moment it is fixed rather than waiting for another blur.
 *
 * The only animation is the button's label swapping between states, and the
 * panel giving way to the confirmation. Both are state indication: the form
 * has to say that it heard the press and that the enquiry left. Nothing else
 * moves. A form is filled in, not watched.
 *
 * Two spam traps ride along, both invisible: a field positioned off-screen that
 * only a script would fill, and the time since the form mounted. The server
 * checks both again and answers the same way it answers a validation failure.
 */
export function ContactForm() {
  /* Reads the locale from context rather than the module, so the same form
     renders Chinese under /zh without a second component. CONTACT_ZH supplies
     every nested object in full — `useCopy` merges one level deep, so a partial
     `form` would replace the English one and lose its siblings. */
  const contact = useCopy(CONTACT, { ZH: CONTACT_ZH, BM: CONTACT_BM });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    company: "",
  });

  /** When the form became fillable. The gap to submit is one of the traps.
   *  Stamped in an effect rather than during render: the clock is not a pure
   *  value, and a re-render must not move the start line. */
  const mountedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    // Only revalidate what is already marked wrong, so nobody is corrected
    // mid-word on a field they have not finished.
    if (key === "name" && errors.name) validate("name", { ...values, [key]: value });
    if ((key === "email" || key === "phone") && errors.contact)
      validate("contact", { ...values, [key]: value });
    if (key === "message" && errors.message)
      validate("message", { ...values, [key]: value });
  };

  const check = (field: Field, source: typeof values) => {
    const { errors: copy } = contact.form;

    if (field === "name") {
      return source.name.trim().length < LIMITS.name ? copy.name : undefined;
    }

    if (field === "message") {
      return source.message.trim().length < LIMITS.message
        ? copy.message
        : undefined;
    }

    const email = source.email.trim();
    const phone = source.phone.trim();
    if (!email && !phone) return copy.contact;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return copy.email;
    if (phone && phone.replace(/\D/g, "").length < LIMITS.phoneDigits)
      return copy.phone;
    return undefined;
  };

  const validate = (field: Field, source = values) => {
    const problem = check(field, source);
    setErrors((previous) => ({ ...previous, [field]: problem }));
    return !problem;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const found: Partial<Record<Field, string>> = {
      name: check("name", values),
      contact: check("contact", values),
      message: check("message", values),
    };
    setErrors(found);

    const firstBad = (["name", "contact", "message"] as const).find(
      (field) => found[field],
    );
    if (firstBad) {
      // Send focus to the field that needs attention rather than leaving the
      // reader to hunt for the red text.
      const selector =
        firstBad === "contact" ? "#contact-email" : `#contact-${firstBad}`;
      formRef.current?.querySelector<HTMLElement>(selector)?.focus();
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          elapsed: Date.now() - mountedAt.current,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setErrors({
          message:
            response.status === 429
              ? contact.form.errors.rateLimited
              : contact.form.errors.failed,
        });
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("error");
      setErrors({ message: contact.form.errors.failed });
    }
  };

  const reset = () => {
    setValues({ name: "", email: "", phone: "", message: "", company: "" });
    setErrors({});
    setStatus("idle");
    mountedAt.current = Date.now();
  };

  const busy = status === "submitting";

  if (status === "sent") {
    return (
      <div
        // Enters from 0.98 rather than from nothing: the panel it replaces was
        // already there, and a card that grows from zero reads as a different
        // object arriving instead of the same one changing.
        className="contact-panel rounded-[16px] border border-line bg-surface p-6 md:p-8"
        data-entering
      >
        <h2 className="text-xl font-medium tracking-tight text-ink md:text-2xl">
          {contact.form.sent.heading}
        </h2>
        <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-2">
          {contact.form.sent.body}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center rounded-full bg-ink px-7 py-3.5 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-0.5 active:translate-y-0"
        >
          {contact.form.sent.again}
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="rounded-[16px] border border-line bg-surface p-6 md:p-8"
    >
      <h2 className="text-xl font-medium tracking-tight text-ink md:text-2xl">
        {contact.form.heading}
      </h2>

      <div className="mt-6">
        <label htmlFor="contact-name" className={LABEL}>
          {contact.form.labels.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          disabled={busy}
          onChange={(event) => set("name")(event.target.value)}
          onBlur={() => validate("name")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={FIELD}
        />
        {errors.name && (
          <p id="contact-name-error" className={ERROR}>
            {errors.name}
          </p>
        )}
      </div>

      <fieldset className="mt-6 border-0 p-0">
        <legend className="text-sm text-ink-3">{contact.form.hint}</legend>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-email" className={LABEL}>
              {contact.form.labels.email}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              disabled={busy}
              onChange={(event) => set("email")(event.target.value)}
              onBlur={() => validate("contact")}
              aria-invalid={!!errors.contact}
              aria-describedby={
                errors.contact ? "contact-reach-error" : undefined
              }
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="contact-phone" className={LABEL}>
              {contact.form.labels.phone}
            </label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              disabled={busy}
              onChange={(event) => set("phone")(event.target.value)}
              onBlur={() => validate("contact")}
              aria-invalid={!!errors.contact}
              aria-describedby={
                errors.contact ? "contact-reach-error" : undefined
              }
              className={FIELD}
            />
          </div>
        </div>

        {errors.contact && (
          <p id="contact-reach-error" className={ERROR}>
            {errors.contact}
          </p>
        )}
      </fieldset>

      <div className="mt-6">
        <label htmlFor="contact-message" className={LABEL}>
          {contact.form.labels.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={values.message}
          disabled={busy}
          placeholder={contact.form.placeholders.message}
          onChange={(event) => set("message")(event.target.value)}
          onBlur={() => validate("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${FIELD} resize-y`}
        />
        {errors.message && (
          <p id="contact-message-error" className={ERROR}>
            {errors.message}
          </p>
        )}
      </div>

      {/* The first trap. Off-screen rather than display:none, because the
          simple bots this catches skip fields that are hidden outright, and
          named `company` because that is a field they expect to find. Out of
          the tab order and out of the accessibility tree, so nobody using the
          form by keyboard or screen reader ever meets it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(event) => set("company")(event.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className="mt-8 inline-flex items-center rounded-full bg-ink px-7 py-3.5 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-70"
      >
        {/* The label crossfades through a slight blur. Without it the two words
            are legible at once mid-transition and read as two labels stacked,
            rather than one becoming the other. */}
        <span className="contact-label" data-busy={busy}>
          {busy
            ? contact.form.submitting
            : status === "error"
              ? contact.form.retry
              : contact.form.submit}
        </span>
      </button>

      <p className="mt-4 text-sm text-ink-3">
        {contact.form.consent}{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
          {contact.form.consentLink}
        </Link>
        .
      </p>

      {/* One live region for the whole form, so a state change is announced
          once rather than field by field. */}
      <p role="status" aria-live="polite" className="sr-only">
        {status === "submitting"
          ? contact.form.status.submitting
          : status === "error"
            ? contact.form.status.error
            : ""}
      </p>
    </form>
  );
}
