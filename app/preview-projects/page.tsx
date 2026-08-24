import { Projects } from "@/components/sections/Projects";

/** Preview only: the reveal is forced on, since a headless capture never
 *  triggers whileInView reliably. */
export default function Preview() {
  return (
    <main className="flex-1 bg-bg [&_*]:opacity-100!">
      <div className="md:mt-[calc(110dvh+4em)]">
        <Projects />
      </div>
    </main>
  );
}
