// Animation settings transcribed from the Framer page so the runtime can
// reproduce them without Framer's JavaScript.
import type { Transition } from "./motion";

const spring = (duration: number, bounce: number, delay = 0): Transition => ({ type: "spring", duration, bounce, delay });

const cardSpring = spring(0.6, 0.2);
const featureSpring: Transition = { type: "spring", stiffness: 500, damping: 80, mass: 1 };

export interface AppearEffect {
  transition: Transition;
  /** Animate back out when the element leaves the viewport. */
  exit?: { opacity: number; transition: Transition };
}

/**
 * "Appear on scroll" effects, keyed by the element's Framer class. Each one
 * starts from the inline style in the server-rendered markup and animates to
 * opacity 1 / no transform once half of the element is visible.
 */
export const appearEffects: Record<string, AppearEffect> = {
  // Problem section subheading
  "framer-1r1esyp": { transition: { type: "spring", stiffness: 210, damping: 70, mass: 1, delay: 0.4 } },
  // "For Startup" / "For Enterprise" labels fade in and out with the viewport
  "framer-1rgfa21": { transition: spring(0.4, 0.2), exit: { opacity: 0, transition: spring(0.4, 0.2) } },
  "framer-1ft9pzs": { transition: spring(0.4, 0.2), exit: { opacity: 0, transition: spring(0.4, 0.2) } },
  // Feature visuals
  "framer-18tdpp3-container": { transition: featureSpring },
  "framer-m0fqwg": { transition: featureSpring },
  "framer-jaf33i": { transition: featureSpring },
  "framer-1o7avrr": { transition: featureSpring },
  // Industry cards are staggered by column
  "framer-1yca9or": { transition: spring(0.6, 0.2, 0.4) },
  "framer-1r4pc75": { transition: spring(0.6, 0.2, 0.8) },
  "framer-1j8taey": { transition: spring(0.6, 0.2, 0.8) },
  "framer-91tpgy": { transition: spring(0.6, 0.2, 0.8) }
};

/** Problem cards and the remaining industry cards. */
export const defaultAppear: AppearEffect = { transition: cardSpring };

/** The hero eyebrow/heading block shrinks and fades across the whole page scroll (not on phones). */
export const heroScroll = {
  selector: ".framer-1vc1ntn",
  media: "(min-width: 810px)",
  to: { opacity: 0, scale: 0, y: 3000 }
};

export const breakpoints = [
  { hash: "default", media: "(min-width: 1200px)" },
  { hash: "1wgxlpv", media: "(min-width: 810px) and (max-width: 1199.98px)" },
  { hash: "qtf3g8", media: "(max-width: 809.98px)" }
];

// --- "48-Hour Framework Setup" diagram --------------------------------------

export type DiagramVariant = "Start" | "Variant 6" | "Variant 5" | "Variant 4" | "Variant 3" | "Variant 2" | "End";

export const diagramVariantClass: Record<DiagramVariant, string> = {
  Start: "framer-v-1gyiigl",
  "Variant 6": "framer-v-8mbonm",
  "Variant 5": "framer-v-t9qura",
  "Variant 4": "framer-v-1c5uf1j",
  "Variant 3": "framer-v-9h55c3",
  "Variant 2": "framer-v-1xwjvan",
  End: "framer-v-1dkyo15"
};

/** Shown when the diagram scrolls into view; each step waits before advancing. */
export const diagramSequence: { variant: DiagramVariant; hold: number }[] = [
  { variant: "Variant 6", hold: 450 },
  { variant: "Variant 5", hold: 600 },
  { variant: "Variant 4", hold: 600 },
  { variant: "Variant 3", hold: 600 },
  { variant: "Variant 2", hold: 600 },
  { variant: "End", hold: 0 }
];

export const diagramTransition: Transition = { type: "tween", duration: 0.5, ease: [0.44, 0, 0.56, 1] };

const centered = "translate(-50%, -50%)";
const centeredX = "translateX(-50%)";

/** Nodes hidden in a variant, and the transform template they use while hidden. */
export const diagramNodes: { cls: string; hiddenIn: DiagramVariant[]; hiddenTransform?: string; transform?: string }[] = [
  { cls: "framer-1d4cpvp", hiddenIn: ["Start", "Variant 6"], hiddenTransform: centeredX, transform: centered },
  { cls: "framer-19qmthq", hiddenIn: ["Start", "Variant 6", "Variant 5"], hiddenTransform: "none", transform: centered },
  { cls: "framer-1ds568", hiddenIn: ["Start", "Variant 6", "Variant 5", "Variant 4"], hiddenTransform: centeredX, transform: centered },
  {
    cls: "framer-b37iu2",
    hiddenIn: ["Start", "Variant 6", "Variant 5", "Variant 4", "Variant 3", "Variant 2"],
    hiddenTransform: centeredX,
    transform: centered
  },
  {
    cls: "framer-1k6sgs9",
    hiddenIn: ["Start", "Variant 6", "Variant 5", "Variant 4", "Variant 3"],
    hiddenTransform: centeredX,
    transform: centered
  },
  { cls: "framer-1i0x9la", hiddenIn: ["Start", "Variant 6"] }
];

/** Connector line that draws itself whenever the diagram is past its start state. */
export const diagramPathMarkup =
  '<div class="framer-wipbva-container"><div style="width:100%;height:100%;display:flex;place-content:center;place-items:center;background-color:transparent;overflow:hidden"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 242 364"><path d="M 48 1.5 L 48 84 C 48 92.837 55.163 100 64 100 L 225 100 C 233.837 100 241 107.163 241 116 L 241 161 C 241 169.837 233.837 177 225 177 L 214.5 177 L 214.5 208 L 214.5 177 L 17 177 C 8.163 177 1 184.163 1 193 L 1 363" stroke="rgb(177, 161, 192)" stroke-width="2" stroke-linejoin="round" fill="transparent" pathLength="1" stroke-dashoffset="0" stroke-dasharray="0 1"></path></svg></div></div>';

export const diagramPathTransition = { duration: 4000, easing: "cubic-bezier(0.44, 0, 0.56, 1)" };

/** Phosphor "GitFork" icon (duotone) that Framer renders client-side in the diagram. */
export const forkIconMarkup =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" focusable="false" style="user-select:none;width:100%;height:100%;display:inline-block;fill:rgba(87, 62, 105, 0.9);color:rgba(87, 62, 105, 0.9);flex-shrink:0"><g><path d="M224,64a24,24,0,1,1-24-24A24,24,0,0,1,224,64Z" opacity="0.2"></path><path d="M232,64a32,32,0,1,0-40,31v17a8,8,0,0,1-8,8H96a23.84,23.84,0,0,0-8,1.38V95a32,32,0,1,0-16,0v66a32,32,0,1,0,16,0V144a8,8,0,0,1,8-8h88a24,24,0,0,0,24-24V95A32.06,32.06,0,0,0,232,64ZM64,64A16,16,0,1,1,80,80,16,16,0,0,1,64,64ZM96,192a16,16,0,1,1-16-16A16,16,0,0,1,96,192ZM200,80a16,16,0,1,1,16-16A16,16,0,0,1,200,80Z"></path></g></svg>';

// --- Hover states -------------------------------------------------------------

export const white = "var(--token-c5d13160-4767-4825-b37f-5cd1213332b9, rgb(255, 255, 255))";
export const brandGradientText =
  "linear-gradient(136deg, var(--token-3c3f2c41-5371-49ec-89de-eaa23ee60b80, rgb(153, 155, 255)) 0%, var(--token-f3ca6c2e-538a-4278-9835-6dac59b2aeb1, rgb(135, 101, 215)) 49.85747466216216%, var(--token-a2029794-5824-467b-8f03-f1131c85af2a, rgb(218, 158, 240)) 100%)";

export const buttonSpring: Transition = { type: "spring", stiffness: 500, damping: 100, mass: 4 };
export const navLinkSpring: Transition = { type: "spring", stiffness: 500, damping: 100, mass: 3 };
