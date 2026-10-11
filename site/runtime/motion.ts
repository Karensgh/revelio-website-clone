// Minimal re-implementation of the Framer Motion transitions the site uses,
// expressed as Web Animations API timings. Springs are simulated once and
// sampled into a CSS `linear()` easing so they can overshoot like the original.

export type Transition =
  | { type: "spring"; duration: number; bounce: number; delay?: number }
  | { type: "spring"; stiffness: number; damping: number; mass?: number; delay?: number }
  | { type: "tween"; duration: number; ease: readonly [number, number, number, number]; delay?: number };

export interface Timing {
  duration: number;
  delay: number;
  easing: string;
}

const cache = new Map<string, Timing>();

export function timing(transition: Transition): Timing {
  const key = JSON.stringify(transition);
  const hit = cache.get(key);
  if (hit) return hit;

  const delay = (transition.delay ?? 0) * 1000;
  let result: Timing;
  if (transition.type === "tween") {
    const [a, b, c, d] = transition.ease;
    result = { duration: transition.duration * 1000, delay, easing: `cubic-bezier(${a}, ${b}, ${c}, ${d})` };
  } else {
    const { stiffness, damping, mass } = springParams(transition);
    result = { ...simulateSpring(stiffness, damping, mass), delay };
  }
  cache.set(key, result);
  return result;
}

// Same derivation as Motion's `findSpring` for duration/bounce springs.
function springParams(transition: Extract<Transition, { type: "spring" }>) {
  if ("stiffness" in transition) {
    return { stiffness: transition.stiffness, damping: transition.damping, mass: transition.mass ?? 1 };
  }
  const dampingRatio = Math.min(Math.max(1 - transition.bounce, 0.05), 1);
  const duration = transition.duration;
  let undampedFreq: number;
  if (dampingRatio < 1) {
    const ratio = (0.001 * Math.sqrt(1 - dampingRatio * dampingRatio)) / dampingRatio;
    undampedFreq = -Math.log(ratio) / (dampingRatio * duration);
  } else {
    undampedFreq = 9.2 / duration;
  }
  const stiffness = undampedFreq * undampedFreq;
  return { stiffness, damping: dampingRatio * 2 * Math.sqrt(stiffness), mass: 1 };
}

function simulateSpring(stiffness: number, damping: number, mass: number) {
  const dt = 1 / 1000;
  let position = 0;
  let velocity = 0;
  const samples: number[] = [0];
  let t = 0;
  // Integrate until the spring is at rest (Motion's restDelta / restSpeed for unit values).
  while (t < 10) {
    const force = -stiffness * (position - 1) - damping * velocity;
    velocity += (force / mass) * dt;
    position += velocity * dt;
    t += dt;
    if (Math.round(t * 1000) % 10 === 0) samples.push(position);
    if (Math.abs(1 - position) < 0.001 && Math.abs(velocity) < 0.01) break;
  }
  samples[samples.length - 1] = 1;
  const step = Math.max(1, Math.floor(samples.length / 60));
  const points: string[] = [];
  for (let i = 0; i < samples.length; i += step) points.push(samples[i].toFixed(4));
  if (points[points.length - 1] !== "1.0000") points.push("1");
  return { duration: t * 1000, easing: `linear(${points.join(", ")})` };
}

/**
 * Animates an element between two style states and then commits the final
 * state inline, so later animations start from the right place.
 */
export function animateTo(
  el: HTMLElement,
  to: Partial<Record<"opacity" | "transform" | "backgroundColor" | "background", string>>,
  transition: Transition,
  from?: Partial<Record<keyof typeof to, string>>
): Animation {
  const computed = getComputedStyle(el);
  const start: Record<string, string> = {};
  for (const prop of Object.keys(to) as (keyof typeof to)[]) {
    // Reading computed values picks up an in-flight animation, so interrupted
    // animations continue from where they are.
    start[prop] = from?.[prop] ?? computed[prop];
  }
  const { duration, delay, easing } = timing(transition);
  el.getAnimations().forEach((a) => a.cancel());
  const animation = el.animate([start, to as Keyframe], { duration, delay, easing, fill: "both" });
  animation.onfinish = () => {
    Object.assign(el.style, to);
    animation.cancel();
  };
  return animation;
}

export function transformString(state: { x?: number; y?: number; scale?: number; rotate?: number }) {
  const parts: string[] = [];
  if (state.x || state.y) parts.push(`translate(${state.x ?? 0}px, ${state.y ?? 0}px)`);
  if (state.scale !== undefined && state.scale !== 1) parts.push(`scale(${state.scale})`);
  if (state.rotate) parts.push(`rotate(${state.rotate}deg)`);
  return parts.length ? parts.join(" ") : "none";
}
