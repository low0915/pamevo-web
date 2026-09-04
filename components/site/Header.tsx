"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { CaretDown, List } from "@phosphor-icons/react/dist/ssr";
import { siWhatsapp } from "simple-icons";
import {
  NAV,
  NAV_ZH,
  NAV_BM,
  LOCALE_MENU,
  LOGO_ALT,
  WHATSAPP,
} from "@/lib/content";
import {
  counterpart,
  isCurrentPath,
  isNavItemCurrent,
  useLocale,
} from "@/lib/locale";
import { Z } from "@/lib/z";
import { replayHero } from "@/lib/autoplay";
import { Flag } from "@/components/ui/Flag";
import { MobileNav } from "./MobileNav";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Shared by both arms of the nav leaf branch. There is no clsx in this repo,
    so the string is hoisted rather than duplicated.

    `px-2` where it was `px-2.5`. Two items became six, and four of those are
    two words long: the 4px a side that read as generous on `Our Products` and
    `Contact` costs 48px across the row now, which is most of what the island
    has left at the width the nav first appears at. */
const NAV_LINK =
  "relative block rounded-full px-2 py-1.5 text-sm whitespace-nowrap text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] hover:text-ink";

/**
 * How the item for the page being read is marked: WEIGHT, where this was a rule
 * drawn under the label.
 *
 * The constraint that shaped the underline still holds and still rules out the
 * obvious alternative. The way most navs say "not current" is to take the other
 * items down to `text-ink-2`, and on this island that fails outright: the header
 * floats over near-black sections, where ink-2 through the glass sits at about
 * 1.7:1. Every item stays `text-ink`, so the current one is marked by something
 * ADDED rather than by the others being dimmed — a rule before, weight now.
 *
 * BOLDING RE-WRAPS THE ROW, WHICH IS THE PART THAT NEEDS SOLVING. Six items in
 * an island already tight enough that its horizontal padding was cut from 2.5 to
 * 2 to fit them (see NAV_LINK): letting the current one grow by the width of its
 * own bold would shove every item beside it sideways, and it would move again on
 * the next navigation. So the label is laid out at its BOLD width on every item,
 * always, and only the visible weight changes.
 *
 * `grid` with both copies in one cell does that. The hidden copy is bold and
 * sets the width; the visible one sits on top of it and switches weight freely
 * underneath. It costs one wasted text node per item and buys a row that cannot
 * move — no `ch` estimate, no font metrics, nothing to re-tune when the copy is
 * translated, and it is the same trick the panel in WhyChoose uses to stop its
 * parts resizing as they swap.
 *
 * `aria-hidden` on the sizer, so a screen reader is not read every label twice;
 * the visible copy carries the text and the `aria-current` sits on the link.
 */
function NavLabel({ label, current }: { label: string; current: boolean }) {
  return (
    <span className="grid">
      <span
        aria-hidden
        className="col-start-1 row-start-1 font-semibold opacity-0"
      >
        {label}
      </span>
      <span
        className={`col-start-1 row-start-1 ${current ? "font-semibold" : ""}`}
      >
        {label}
      </span>
    </span>
  );
}

/**
 * A dropdown, shared by the products submenu and the language switch.
 *
 * Two elements rather than one, and the reason is the 8px between the island
 * and the panel. Both of these open on hover and close on `mouseleave`, and
 * hovering the panel does not close them because the panel is a DESCENDANT of
 * the element being watched — `mouseleave` does not fire when the pointer moves
 * onto a child. The gap was not a child. It was margin, which belongs to nobody,
 * so a pointer travelling from the trigger down to the panel left the trigger,
 * closed the menu, and arrived at nothing.
 *
 * So the gap is padding on a wrapper instead of margin on the panel, and the
 * wrapper is inside the element that watches for the pointer. The route from
 * trigger to panel is now continuously inside one subtree.
 *
 * The wrapper is also the animated element, because `AnimatePresence` only
 * tracks its direct children — a plain `<div>` around a `motion.div` would
 * animate in and vanish on the way out.
 */
const PANEL_WRAP = "absolute top-full pt-2";

/**
 * What `top-full` is measured from, and why it has to be said out loud.
 *
 * `top-full` is 100% of the PANEL'S CONTAINING BLOCK, which is the nearest
 * positioned ancestor — the `<li>`, not the island. The island is `h-16` with
 * `items-center`, so a shrink-to-fit `li` is about 30px tall and centred in it:
 * `top-full` then landed roughly 47px down a 64px island, and the panel's glass
 * opened 17px ABOVE the island's own bottom edge, overlapping the header it
 * belongs to and hanging over the page from the middle of it rather than from
 * under it.
 *
 * The fix is not a magic offset — the trigger's height changes with the
 * breakpoint and any offset would be wrong at one of them. It is to make the
 * containing block the full height of the island, so `top-full` IS the island's
 * bottom edge and `pt-2` is the whole of the gap under it. That is what
 * `self-stretch` on the nav and the locale switch, `items-stretch` on the list,
 * and `flex items-center` on each row are doing below: every one of them exists
 * to keep this one measurement honest, and removing any of them puts the panel
 * back inside the glass.
 *
 * It also widens the hover target to the island's full height, which makes the
 * bridge the comment above describes shorter still: the pointer is inside the
 * watched subtree from the label all the way to the island's edge.
 */
const PANEL_ANCHOR = "self-stretch";
const PANEL = "glass glass-rim relative overflow-hidden rounded-[14px] p-1.5";

/**
 * Floating island header with a liquid-glass texture.
 *
 * The glass is a web glassmorphism approximation, not Apple Liquid Glass.
 * The morph is scroll-driven through motion values only: no scroll listener,
 * no component state, so nothing re-renders as the page moves. The element is
 * `position: fixed`, so interpolating its width reflows only its own subtree.
 */
export function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  /* Which top-level item has its submenu open, by label, rather than the single
     boolean this was. One item has children today and the state was named for
     it; keying by label means a second one cannot silently open the first. */
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [openLocale, setOpenLocale] = useState(false);
  const reduce = useReducedMotion();
  /* Also read by the locale toggle below: English and Chinese are separate
     URLs under separate root layouts, so switching language is a navigation
     rather than a state change, and `counterpart` maps this path to its
     opposite. */
  const pathname = usePathname();
  const { locale: active } = useLocale();
  /* A straight swap, not `useCopy`: NAV is a bare array, so there is no object
     for a partial overlay to merge onto. */
  const nav = active === "ZH" ? NAV_ZH : active === "BM" ? NAV_BM : NAV;
  const { scrollY } = useScroll();

  const range = [0, 120];
  /* Widened from 1344/1000. The island holds three times the nav it was built
     for — six items where there were two, one of them with a caret — and at the
     old scrolled width the row simply did not fit: roughly 1150px of content in
     1000px of island, which `overflow-hidden` would have cropped rather than
     wrapped. The unscrolled end moves with it so the morph keeps its shape.

     These are ceilings, not widths: the island is `w-full` under them, so below
     about 1700px it is the viewport less the header's own gutters that decides,
     and these only bind on a large display. */
  const maxWidth = useTransform(scrollY, range, [1600, 1360], { clamp: true });
  const radius = useTransform(scrollY, range, [22, 999], { clamp: true });
  /* The island's tint, unscrolled to scrolled.
     Was 0.28/0.62, then 0.55/0.85, now this. The first raise was necessary and
     the size of it was not. 0.28 was set when every page opened on pale
     photography; two pages now open on a solid #033392 band, and over that it
     put the nav at about 3.6:1 - under AA for text this size, on the two pages
     a reader is most likely to arrive at from the nav. So it had to go up.

     It went up further than the reading needed, and past the point where the
     island reads as glass: 0.85 is paint with a blur behind it, and the
     scrolled state is where the header spends nearly all of its life, since
     120px of scroll is nothing on a page this long.

     These are the floor plus a margin rather than a guess. The worst ground on
     the site for near-black type on white glass is the darkest thing the island
     can float over - the service panels, and now the product band's panes - at
     around luminance 16. `text-ink` over this glass on that ground:

       0.40 -> 3.83:1   under AA
       0.44 -> 4.38:1   under AA, and closer than it looks
       0.48 -> 4.99:1   the unscrolled end
       0.62 -> 7.60:1   the scrolled end

     And on the #033392 band, which is what forced the first raise, 0.48 holds
     6.23:1 - comfortably past the 4.5 that 0.28 was failing at 3.63:1. The
     morph keeps its direction, and the island is glass at both ends of it
     again. */
  const background = useTransform(
    scrollY,
    range,
    ["rgba(255,255,255,0.48)", "rgba(255,255,255,0.62)"],
    { clamp: true },
  );
  const blur = useTransform(scrollY, range, [12, 28], { clamp: true });

  /**
   * BRIGHTNESS, AND WHY IT IS NOT MORE TINT.
   *
   * The island was legible everywhere - `text-ink` never fell below 8.8:1 - but
   * over the dark bands it measured rgb(171,178,188) against rgb(248) on the
   * page's own ground, and read as a grey slab rather than as glass. That is a
   * tone problem, and the tints above are not the lever for it: they are a
   * measured floor for the reading, and raising them is how this island got to
   * 0.85 once before and stopped being glass at all.
   *
   * `brightness()` raises what is BEHIND the sheet instead of covering it, and
   * it is self-limiting in exactly the way this needs. Over the near-white page
   * ground the backdrop is already at the ceiling, so the multiplier does
   * nothing and the unscrolled island is unchanged; over the dark bands it does
   * all of the work. The tints are untouched, so every contrast figure in the
   * note above still holds - brightening the backdrop can only lighten the
   * result, so `text-ink` can only improve on it.
   *
   * Saturation comes DOWN as brightness goes up, and that is not a separate
   * opinion. A multiplier scales colour as well as level, so at 1.8 the old
   * 180% pushed a visible cyan cast over the dark sections and a heavy
   * periwinkle over the enquiry band - the island took the colour of whatever
   * it crossed. 140% is where it stops staining.
   *
   * Measured at 1440x900, scrolled, sampling a clean patch of the island:
   *
   *   ground                  before              after
   *   dark section    rgb(171,178,188)    rgb(200,216,221)
   *   enquiry band    rgb(158,180,243)    rgb(158,197,254)
   *   page ground     rgb(247,248,248)    unchanged
   *
   * 1.8 rather than 2.1, which was brighter still: past about 1.9 a green cast
   * comes up off the dark sections, and the point of the change was to stop the
   * island taking on colour.
   */
  const backdropFilter = useTransform(
    blur,
    (b) => `blur(${b}px) saturate(140%) brightness(1.8)`,
  );
  const shadow = useTransform(
    scrollY,
    range,
    [
      "0 2px 10px rgba(16,18,21,0.04)",
      "0 10px 34px rgba(16,18,21,0.12)",
    ],
    { clamp: true },
  );
  const logoScale = useTransform(scrollY, range, [1, 0.85], { clamp: true });
  const logoTransform = useTransform(logoScale, (s) => `scale(${s})`);

  /* Reduced motion gets the island at rest rather than the morph, so it needs
     the same ceiling the unscrolled end above carries - it was left at the old
     1344 when that moved, which is 250px short of the six-item row. */
  const staticStyle = reduce
    ? {
        maxWidth: 1600,
        borderRadius: 22,
        /* The material as well as the shape. Without these the reduced-motion
           island falls back to `.glass`, which is the shared light-glass
           material and knows nothing about the grounds this thing floats over -
           so the one reader who cannot have the morph got the dark island the
           brightness above exists to fix. The unscrolled end, since that is
           what "at rest" means here. */
        background: "rgba(255,255,255,0.48)",
        backdropFilter: "blur(12px) saturate(140%) brightness(1.8)",
        WebkitBackdropFilter: "blur(12px) saturate(140%) brightness(1.8)",
      }
    : {
        maxWidth,
        borderRadius: radius,
        background,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        boxShadow: shadow,
      };

  return (
    <>
      <header
        className="fixed inset-x-0 top-4 flex justify-center px-4 md:px-8 lg:px-12"
        style={{ zIndex: Z.header }}
      >
        <motion.div
          style={staticStyle}
          /* No `overflow-hidden`, which this carried until the header grew
             things that hang out of it. Both dropdowns are positioned at
             `top-full` — below the island's own box — so a clip on the island
             cut them off entirely: the panel opened, and every pixel of it was
             outside the box that was allowed to paint. Nothing inside the row
             needs clipping; the rim is a masked pseudo-element that takes the
             radius on its own, and the logo is sized rather than cropped.

             What the clip was quietly insuring against was the row outgrowing
             the island, which it now hides less well than it used to: if that
             ever happens the nav spills past the glass instead of being cropped
             at it. That is the better failure. A cropped nav looks deliberate
             and loses items silently; a spilling one is obviously wrong. */
          className="glass glass-rim relative flex h-16 w-full items-center gap-4 px-4 sm:px-5"
        >
          {/* Home is where the hero plays, so the mark is also the way back to
              the top of it — including from the home page itself, where the
              link alone would not move anything. */}
          {/* The current language's home, not always the English one: from /zh
              this has to stay in Chinese. */}
          <Link
            href={active === "ZH" ? "/zh" : "/"}
            aria-label="MEVO Malaysia, home"
            onClick={replayHero}
          >
            <motion.span
              className="block origin-left"
              style={reduce ? undefined : { transform: logoTransform }}
            >
              <Image
                src="/logo.png"
                alt={LOGO_ALT}
                width={2220}
                height={174}
                /* Was `priority`, deprecated as of Next 16. Eager rather than
                   preload: above the fold on every page, but small, and a
                   preload would compete in <head> with each page's real LCP. */
                loading="eager"
                /* 16px was the mark reading as a footnote in a 64px island.
                   It grows with the room there is for it rather than in one
                   step: the island is the viewport less its gutters, and below
                   `sm` the wordmark, its gap and the menu button have about
                   296px between them on a 360px phone - which 20px of logo
                   (255px wide) overruns and 16px does not. From `sm` up there
                   is width to spare and it takes it.

                   It stops growing at `xl` and starts again at `2xl`, which is
                   where the six-item nav appears and then stops being the
                   binding thing. The wordmark is 12.8:1, so every step of
                   height costs thirteen of width: at `xl` the row is the logo,
                   six items, the switch and two buttons inside about 1200px,
                   and 28px of logo (357px) is the difference between that
                   fitting and being cropped. */
                className="h-4 w-auto sm:h-5 md:h-6 2xl:h-7"
              />
            </motion.span>
          </Link>

          <nav className={`ml-auto hidden xl:block ${PANEL_ANCHOR}`}>
            {/* `items-stretch`, not `items-center`: the rows have to be as tall
                as the island for the panel to hang off the bottom of it. The
                centring moves onto each row instead. See PANEL_ANCHOR. */}
            <ul className="flex h-full items-stretch">
              {nav.map((item) =>
                item.children ? (
                  <li
                    key={item.href ?? item.label}
                    className="relative flex items-center"
                    onMouseEnter={() => setOpenNav(item.label)}
                    onMouseLeave={() => setOpenNav(null)}
                  >
                    {/* A link where it used to be a button, because this one
                        now has somewhere to go. The submenu names two halves of
                        the catalogue and neither has a route yet, so a reader
                        who opens it and finds both inert has to be able to
                        reach the catalogue itself from the thing they opened.
                        Hover and focus still open the panel; the click goes to
                        /our-products. `aria-haspopup` rather than
                        `aria-expanded`, which belongs on a control that toggles
                        rather than on a link that navigates. */}
                    {item.href ? (
                      <Link
                        href={item.href}
                        /* `isCurrentPath`, not an equality check: this is the
                           item with twenty pages under it, and on every one of
                           them an exact match would mark nothing. */
                        /* The item, not the href: this parent lights on its own
                           page AND on any page its children lead to — Our
                           Profile stays marked while a reader is on
                           /directors-profile. See isNavItemCurrent. */
                        aria-current={
                          isNavItemCurrent(pathname, item) ? "page" : undefined
                        }
                        aria-haspopup="true"
                        onFocus={() => setOpenNav(item.label)}
                        className={`${NAV_LINK} flex items-center gap-1`}
                      >
                        <NavLabel
                          label={item.label}
                          current={isNavItemCurrent(pathname, item)}
                        />
                        {/* `text-ink`, where this was `text-ink-3`. The caret is
                            part of the control it sits in and now reads at the
                            same weight as the label beside it. */}
                        <CaretDown size={11} weight="bold" className="text-ink" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        aria-expanded={openNav === item.label}
                        onFocus={() => setOpenNav(item.label)}
                        className="flex items-center gap-1 rounded-full px-2 py-1.5 text-sm text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]"
                      >
                        <NavLabel label={item.label} current={false} />
                        <CaretDown size={11} weight="bold" className="text-ink" />
                      </button>
                    )}

                    <AnimatePresence>
                      {openNav === item.label && (
                        <motion.div
                          className={`${PANEL_WRAP} left-0 origin-top-left`}
                          initial={
                            reduce
                              ? { opacity: 0 }
                              : { opacity: 0, transform: "scale(0.97)" }
                          }
                          animate={{ opacity: 1, transform: "scale(1)" }}
                          exit={
                            reduce
                              ? { opacity: 0 }
                              : { opacity: 0, transform: "scale(0.97)" }
                          }
                          transition={{ duration: 0.18, ease: EASE_OUT }}
                        >
                          <div className={`${PANEL} w-52`}>
                            {item.children.map((child) => (
                              /* A PLAIN ANCHOR, not next/link, and that is
                                 load-bearing rather than an oversight.

                                 These two point at a fragment on one page:
                                 /our-products#window and #door, which the
                                 catalogue reads to set its filter. Next's Link
                                 would navigate on the client through
                                 `pushState`, and `pushState` fires no event —
                                 not `hashchange`, not `popstate`. So a reader
                                 already standing on /our-products who opened
                                 this menu and chose the other system would get
                                 a changed URL and an unchanged list. A real
                                 anchor makes the browser do it, and the browser
                                 fires `hashchange`.

                                 The cost is a document navigation from the
                                 other pages instead of a client one. On a
                                 statically rendered catalogue that is cheap,
                                 and it is the same trade the language switch
                                 already makes for a different reason.

                                 `text-ink`, not `text-ink-2`: the panel is the
                                 same glass as the island and floats over the
                                 same near-black sections, where ink-2 measures
                                 2.7:1 against a 4.5 bar. Measured over the
                                 /our-profile showroom photograph, not assumed. */
                              <a
                                key={child.label}
                                href={child.href}
                                aria-disabled={child.href ? undefined : "true"}
                                className="block rounded-[9px] px-3 py-2 text-sm text-ink transition-colors duration-200 hover:bg-[rgb(255_255_255/0.6)] hover:text-ink"
                              >
                                {child.label}
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ) : (
                  <li
                    key={item.href ?? item.label}
                    className="flex items-center"
                  >
                    {item.href ? (
                      <Link
                        href={item.href}
                        aria-current={
                          isCurrentPath(pathname, item.href) ? "page" : undefined
                        }
                        className={NAV_LINK}
                      >
                        <NavLabel
                          label={item.label}
                          current={isCurrentPath(pathname, item.href)}
                        />
                      </Link>
                    ) : (
                      <a href="#" aria-disabled="true" className={NAV_LINK}>
                        <NavLabel label={item.label} current={false} />
                      </a>
                    )}
                  </li>
                ),
              )}
            </ul>
          </nav>

          {/* The language switch, as a dropdown.

              It was a segmented control of two pills, which works for two and
              stops working at three: a third pill is a third of the row's width
              spent on a control that is used once, and the site is about to
              carry a language that is named but not yet built. A dropdown shows
              one code and opens the list, so adding Bahasa Melayu costs the row
              nothing.

              Three states in it, and they are the three the data already
              distinguishes. The language being read is not a link — it was one,
              pointing at the page it was already on, and because the languages
              are separate root layouts that is a full reload rather than a
              client navigation: the hero re-pins and the scrubbed sections
              start over for no change of any kind. A language with a route is a
              plain `<a>`, deliberately, since crossing root layouts is a
              document navigation. A language without one is inert, the same way
              an unbuilt nav item is. See LOCALE_MENU in lib/content.ts. */}
          <div
            className={`relative ml-auto hidden ${PANEL_ANCHOR} xl:ml-4 xl:flex xl:items-center`}
            onMouseEnter={() => setOpenLocale(true)}
            onMouseLeave={() => setOpenLocale(false)}
          >
            <button
              type="button"
              aria-expanded={openLocale}
              aria-label="Language"
              onFocus={() => setOpenLocale(true)}
              className="flex items-center gap-1.5 rounded-full border border-[rgb(255_255_255/0.7)] bg-[rgb(255_255_255/0.35)] px-2 py-1.5 text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]"
            >
              {/* The flag alone, with no code beside it. `aria-label` on the
                  button is what names this control; the flag is decoration over
                  the top of it and is hidden from anything reading the page. */}
              <Flag code={active} />
              {/* `text-ink` like the nav's two carets: all three dropdown
                  arrows on the island are one control affordance and reading
                  one of them lighter than the others said nothing. */}
              <CaretDown size={10} weight="bold" className="text-ink" />
            </button>

            <AnimatePresence>
              {openLocale && (
                <motion.div
                  className={`${PANEL_WRAP} right-0 origin-top-right`}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, transform: "scale(0.97)" }
                  }
                  animate={{ opacity: 1, transform: "scale(1)" }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, transform: "scale(0.97)" }
                  }
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                >
                  <div className={`${PANEL} w-44`}>
                    {LOCALE_MENU.map((entry) => {
                      /* The flag picks the row out and the name is what says
                         which language it is. The name is not decoration here:
                         a flag is a country rather than a language, and two of
                         these three are countries nobody reading this site is
                         necessarily in. */
                      const row =
                        "flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-sm";
                      const body = (
                        <>
                          <Flag code={entry.code} />
                          <span lang={entry.lang}>{entry.name}</span>
                        </>
                      );

                      if (entry.locale === active) {
                        return (
                          <span
                            key={entry.code}
                            aria-current="true"
                            className={`${row} bg-[rgb(16_18_21/0.06)] text-ink`}
                          >
                            {body}
                          </span>
                        );
                      }

                      if (!entry.locale) {
                        return (
                          <a
                            key={entry.code}
                            href="#"
                            aria-disabled="true"
                            className={`${row} text-ink-3`}
                          >
                            {body}
                          </a>
                        );
                      }

                      return (
                        <a
                          key={entry.code}
                          href={counterpart(pathname, entry.locale)}
                          hrefLang={entry.lang}
                          /* Also `text-ink`. This one is not a placeholder —
                             it is the link that changes the site's language,
                             and it was the least legible thing in the header
                             over a dark section. */
                          className={`${row} text-ink transition-colors duration-200 hover:bg-[rgb(255_255_255/0.6)] hover:text-ink`}
                        >
                          {body}
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ml-auto below xl, where the nav and the locale switch are hidden:
              without it this would sit beside the logo instead of beside the
              menu button. Simple Icons for the brand mark, as the footer does.

              WhatsApp green, and taken from `siWhatsapp.hex` rather than typed
              in: the mark and the colour then come from the same place and
              cannot drift apart. It is an inline style because Tailwind only
              compiles class names it can SEE in the source, and a class built
              from a value at runtime produces no CSS at all.

              White mark on the green, which is 1.98:1 and is the ratio the
              brand itself ships. It is defensible HERE and would not be on the
              button in the enquiry band: this control is icon-only and carries
              an `aria-label`, so the glyph is a recognisable mark rather than
              information anyone has to read off it. The keyline is what holds
              the circle's edge against a pale section, where the green alone is
              only about 1.45:1 against the glass. */}
          <a
            href={WHATSAPP.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={WHATSAPP.label}
            style={{ backgroundColor: `#${siWhatsapp.hex}` }}
            className="ml-auto grid size-9 place-items-center rounded-full border border-[rgb(255_255_255/0.55)] text-white transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] xl:ml-2"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
              <path d={siWhatsapp.path} />
            </svg>
          </a>

          <button
            type="button"
            onClick={() => setOpenMenu(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-full border border-[rgb(255_255_255/0.7)] bg-[rgb(255_255_255/0.4)] text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] xl:hidden"
          >
            <List size={17} weight="regular" />
          </button>
        </motion.div>
      </header>

      <MobileNav open={openMenu} onClose={() => setOpenMenu(false)} />
    </>
  );
}
