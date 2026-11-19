"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { CONTACT, CONTACT_ZH, CONTACT_BM } from "@/lib/content";
import {
  ENQUIRY_OPTIONS,
  ENQUIRY_SELECTS,
  type EnquiryModel,
  type EnquirySelect,
} from "@/lib/enquiry";
import { useCopy, useLocale } from "@/lib/locale";

const FIELD =
  "mt-2 w-full rounded-[10px] border border-line bg-bg px-4 py-3 text-base text-ink transition-colors duration-[160ms] ease-[var(--ease-out)] placeholder:text-ink-3 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60 aria-[invalid=true]:border-[rgb(163_52_52/0.55)]";

const LABEL = "block text-sm font-medium text-ink";

const ERROR = "mt-2 text-sm text-[rgb(150_44_44)]";

/** The required mark after a label. Hidden from screen readers, which hear
 *  `aria-required` on the field instead. */
const REQUIRED = (
  <span aria-hidden className="ml-1 text-[rgb(190_70_70)]">
    *
  </span>
);

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  installIn: "",
  projectStatus: "",
  location: "",
  product: "",
  model: "",
  message: "",
  website_url_2: "",
};

/** The same bounds the route enforces. Duplicated deliberately: the client
 *  copy is for telling someone what to fix, the server copy is the one that
 *  decides, and neither can stand in for the other. */
const LIMITS = { name: 2, message: 10, phoneDigits: 8 };

type Status = "idle" | "submitting" | "sent" | "error";

type Field = "name" | "phone" | "email" | EnquirySelect | "message";

/** Every checked field, in the order they appear, so focus goes to the first
 *  one that needs fixing. */
const ORDER: Field[] = ["name", "phone", "email", ...ENQUIRY_SELECTS, "message"];

const isSelect = (field: string): field is EnquirySelect =>
  (ENQUIRY_SELECTS as string[]).includes(field);

/**
 * The enquiry form.
 *
 * Asked for: who this is, a phone number (required) and optionally an email,
 * four dropdowns (where it is to be installed, the project's stage, the
 * customer's state, the product range) and what it is about.
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
export function ContactForm({ models }: { models: EnquiryModel[] }) {
  /* Reads the locale from context rather than the module, so the same form
     renders Chinese under /zh without a second component. CONTACT_ZH supplies
     every nested object in full — `useCopy` merges one level deep, so a partial
     `form` would replace the English one and lose its siblings. */
  const contact = useCopy(CONTACT, { ZH: CONTACT_ZH, BM: CONTACT_BM });
  const { locale } = useLocale();
  const lang = locale === "ZH" ? "zh" : locale === "BM" ? "bm" : "en";
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [values, setValues] = useState(EMPTY);

  /** When the form became fillable. The gap to submit is one of the traps.
   *  Stamped in an effect rather than during render: the clock is not a pure
   *  value, and a re-render must not move the start line. */
  const mountedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  /** The products in the chosen range, for the optional dropdown under it.
   *  Empty until a range is chosen, and for "Not sure yet". */
  const rangeModels = models.filter((model) => model.range === values.product);

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
      // A product from the old range does not belong to the new one.
      ...(key === "product" ? { model: "" } : {}),
    }));
    // Only revalidate what is already marked wrong, so nobody is corrected
    // mid-word on a field they have not finished.
    if (key === "name" && errors.name) validate("name", { ...values, [key]: value });
    if (key === "phone" && errors.phone)
      validate("phone", { ...values, [key]: value });
    if (key === "email" && errors.email)
      validate("email", { ...values, [key]: value });
    if (key === "message" && errors.message)
      validate("message", { ...values, [key]: value });
    // A dropdown's change is a finished choice, not a half-typed word, so it
    // can clear its error straight away.
    if (isSelect(key) && errors[key]) validate(key, { ...values, [key]: value });
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

    if (isSelect(field)) {
      return source[field] ? undefined : copy.select;
    }

    if (field === "phone") {
      const phone = source.phone.trim();
      if (!phone) return copy.contact;
      return phone.replace(/\D/g, "").length < LIMITS.phoneDigits
        ? copy.phone
        : undefined;
    }

    // Email is optional: only a filled-in one that does not look right fails.
    const email = source.email.trim();
    return email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? copy.email
      : undefined;
  };

  const validate = (field: Field, source = values) => {
    const problem = check(field, source);
    setErrors((previous) => ({ ...previous, [field]: problem }));
    return !problem;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const found: Partial<Record<Field, string>> = Object.fromEntries(
      ORDER.map((field) => [field, check(field, values)]),
    );
    setErrors(found);

    const firstBad = ORDER.find((field) => found[field]);
    if (firstBad) {
      // Send focus to the field that needs attention rather than leaving the
      // reader to hunt for the red text.
      formRef.current
        ?.querySelector<HTMLElement>(`#contact-${firstBad}`)
        ?.focus();
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
    setValues(EMPTY);
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
          {REQUIRED}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          disabled={busy}
          aria-required
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

      {/* Phone is required, email optional: phone first, and the only one of
          the pair with the required mark. */}
      <div className="mt-6 grid gap-x-4 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className={LABEL}>
            {contact.form.labels.phone}
            {REQUIRED}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            disabled={busy}
            aria-required
            onChange={(event) => set("phone")(event.target.value)}
            onBlur={() => validate("phone")}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
            className={FIELD}
          />
          {errors.phone && (
            <p id="contact-phone-error" className={ERROR}>
              {errors.phone}
            </p>
          )}
        </div>

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
            onBlur={() => validate("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={FIELD}
          />
          {errors.email && (
            <p id="contact-email-error" className={ERROR}>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* The four required dropdowns, two to a row. The options live in
          lib/enquiry.ts, shared with the route that checks them. */}
      <div className="mt-6 grid gap-x-4 gap-y-6 sm:grid-cols-2">
        {ENQUIRY_SELECTS.map((field) => {
          const id = `contact-${field}`;
          const errorId = `${id}-error`;
          return (
            <div key={field}>
              <label htmlFor={id} className={LABEL}>
                {contact.form.labels[field]}
                {REQUIRED}
              </label>
              <div className="relative">
                <select
                  id={id}
                  name={field}
                  value={values[field]}
                  disabled={busy}
                  aria-required
                  onChange={(event) => set(field)(event.target.value)}
                  onBlur={() => validate(field)}
                  aria-invalid={!!errors[field]}
                  aria-describedby={errors[field] ? errorId : undefined}
                  className={`${FIELD} appearance-none pr-10 ${values[field] ? "" : "text-ink-3"}`}
                >
                  {/* The prompt: shown until a choice is made, never
                      choosable back. */}
                  <option value="" disabled>
                    {contact.form.placeholders.select}
                  </option>
                  {ENQUIRY_OPTIONS[field].map((option) => (
                    <option key={option.id} value={option.id} className="text-ink">
                      {option[lang]}
                    </option>
                  ))}
                </select>
                <CaretDown
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-4 mt-1 size-4 -translate-y-1/2 text-ink-3"
                />
              </div>
              {errors[field] && (
                <p id={errorId} className={ERROR}>
                  {errors[field]}
                </p>
              )}
            </div>
          );
        })}

        {/* Optional, full width, and only once a range is chosen: the
            products in it, so the enquiry can name one. "Any product in this
            range" is a real choice, not a prompt, so it stays selectable. */}
        {rangeModels.length > 0 && (
          <div className="sm:col-span-2">
            <label htmlFor="contact-model" className={LABEL}>
              {contact.form.labels.model}
            </label>
            <div className="relative">
              <select
                id="contact-model"
                name="model"
                value={values.model}
                disabled={busy}
                onChange={(event) => set("model")(event.target.value)}
                className={`${FIELD} appearance-none pr-10 ${values.model ? "" : "text-ink-3"}`}
              >
                <option value="">{contact.form.placeholders.model}</option>
                {rangeModels.map((model) => (
                  <option key={model.slug} value={model.slug} className="text-ink">
                    {model[lang]}
                  </option>
                ))}
              </select>
              <CaretDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-4 mt-1 size-4 -translate-y-1/2 text-ink-3"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label htmlFor="contact-message" className={LABEL}>
          {contact.form.labels.message}
          {REQUIRED}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={values.message}
          disabled={busy}
          aria-required
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
          simple bots this catches skip fields that are hidden outright. Named
          to look like a real field to a bot but to match nothing a browser
          autofills: it used to be `company`, which Chrome fills from a saved
          address whatever `autoComplete` says — silently turning away a real
          person whose profile had an organisation in it. Out of the tab order
          and out of the accessibility tree, so nobody using the form by
          keyboard or screen reader ever meets it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website_url_2"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website_url_2}
          onChange={(event) => set("website_url_2")(event.target.value)}
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
