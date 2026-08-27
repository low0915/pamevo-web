/**
 * Structured data.
 *
 * `type="application/ld+json"` is a data block, not a script. The HTML spec's
 * "prepare the script element" algorithm classifies the type first — classic,
 * module, importmap, or else return — and that return happens BEFORE the step
 * that asks whether inline behaviour is blocked by Content-Security-Policy. The
 * contents are never parsed as JavaScript and never reach the CSP check.
 *
 * So this renders unmodified under the strict policy in next.config.ts, and it
 * would keep rendering if `'unsafe-inline'` were ever traded for nonces — which
 * is the reason to prefer this over any JS-injected alternative.
 *
 * `<` is escaped, which JSON.stringify does not do. A `</script>` appearing
 * inside any string value would close this element early and spill the rest of
 * the graph into the document as visible text. Every value here is ours today;
 * the escape costs one replace and removes the class of bug rather than the
 * instance.
 *
 * A server component, and unconditionally rendered: the graph has to be in the
 * initial HTML, not appended by a client effect after hydration.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
