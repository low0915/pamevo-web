export function MetalRule({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`metal-rule block h-px ${className}`} />;
}
