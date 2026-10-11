import { appearAnimations } from "../generated/appear";
import {
  appearEffects,
  breakpoints,
  brandGradientText,
  buttonSpring,
  defaultAppear,
  diagramNodes,
  diagramPathMarkup,
  diagramPathTransition,
  diagramSequence,
  diagramTransition,
  diagramVariantClass,
  forkIconMarkup,
  heroScroll,
  navLinkSpring,
  white,
  type DiagramVariant
} from "./config";
import { animateTo, timing, transformString, type Transition } from "./motion";

type Cleanup = () => void;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Appear on scroll ------------------------------------------------------------

export function setupAppear(root: ParentNode): Cleanup {
  const targets = [...root.querySelectorAll<HTMLElement>('[style*="will-change:transform"][style*="opacity:0;"]')];
  const effects = new Map<Element, { effect: typeof defaultAppear; from: { opacity: string; transform: string } }>();
  for (const el of targets) {
    const cls = [...el.classList].find((c) => c in appearEffects);
    effects.set(el, {
      effect: cls ? appearEffects[cls] : defaultAppear,
      from: { opacity: el.style.opacity, transform: el.style.transform || "none" }
    });
  }

  const shown = new Set<Element>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const config = effects.get(el);
        if (!config) continue;
        if (entry.isIntersecting && !shown.has(el)) {
          shown.add(el);
          if (reducedMotion()) Object.assign(el.style, { opacity: "1", transform: "none" });
          else animateTo(el, { opacity: "1", transform: "none" }, config.effect.transition);
          if (!config.effect.exit) observer.unobserve(el);
        } else if (!entry.isIntersecting && shown.has(el) && config.effect.exit) {
          shown.delete(el);
          animateTo(el, { opacity: String(config.effect.exit.opacity), transform: "none" }, config.effect.exit.transition);
        }
      }
    },
    { threshold: 0.5 }
  );
  targets.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

// --- Hero load animation -----------------------------------------------------------

type AppearState = { opacity: number; x: number; y: number; scale: number; rotate: number };
type AppearConfig = { initial: AppearState; animate: AppearState & { transition: { delay: number; duration: number; ease: number[] } } };

export function setupHeroAppear(root: ParentNode): Cleanup {
  const bp = breakpoints.find((b) => window.matchMedia(b.media).matches)?.hash ?? "default";
  const animations: Animation[] = [];
  root.querySelectorAll<HTMLElement>("[data-framer-appear-id]").forEach((el) => {
    const byBreakpoint = (appearAnimations as unknown as Record<string, Record<string, AppearConfig>>)[el.dataset.framerAppearId!];
    const config = byBreakpoint?.[bp] ?? byBreakpoint?.default;
    if (!config) return;
    const { transition, ...target } = config.animate;
    const to = { opacity: String(target.opacity), transform: transformString(target) };
    if (reducedMotion()) {
      Object.assign(el.style, to);
      return;
    }
    const tween: Transition = {
      type: "tween",
      duration: transition.duration,
      delay: transition.delay,
      ease: transition.ease as [number, number, number, number]
    };
    animations.push(animateTo(el, to, tween, { opacity: String(config.initial.opacity), transform: transformString(config.initial) }));
  });
  return () => animations.forEach((a) => a.finish());
}

// --- Hero scroll effect ------------------------------------------------------------

export function setupHeroScroll(root: ParentNode): Cleanup {
  const el = root.querySelector<HTMLElement>(heroScroll.selector);
  if (!el) return () => {};
  const media = window.matchMedia(heroScroll.media);
  let frame = 0;
  const update = () => {
    frame = 0;
    if (!media.matches || reducedMotion()) {
      el.style.removeProperty("transform");
      el.style.removeProperty("opacity");
      return;
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    const { opacity, scale, y } = heroScroll.to;
    el.style.opacity = String(1 + (opacity - 1) * progress);
    el.style.transform = progress === 0 ? "none" : `translateY(${y * progress}px) scale(${1 + (scale - 1) * progress})`;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  media.addEventListener("change", schedule);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    media.removeEventListener("change", schedule);
  };
}

// --- "48-Hour Framework Setup" diagram ------------------------------------------------

export function setupDiagram(root: ParentNode): Cleanup {
  const diagram = root.querySelector<HTMLElement>(".framer-vZjje");
  if (!diagram) return () => {};

  const icon = diagram.querySelector<HTMLElement>(".framer-m2pek1-container");
  if (icon) icon.innerHTML = forkIconMarkup;

  const variantClasses = Object.values(diagramVariantClass);
  let current: DiagramVariant = "Start";
  let timers: number[] = [];

  const setVariant = (variant: DiagramVariant, animate = true) => {
    if (variant === current) return;
    current = variant;
    const children = [...diagram.children] as HTMLElement[];
    const before = new Map(children.map((c) => [c, c.getBoundingClientRect()]));

    diagram.classList.remove(...variantClasses);
    diagram.classList.add(diagramVariantClass[variant]);
    diagram.dataset.framerName = variant;

    const { duration, easing } = timing(diagramTransition);
    for (const node of diagramNodes) {
      const el = diagram.querySelector<HTMLElement>(`:scope > .${node.cls}`);
      if (!el) continue;
      const hidden = node.hiddenIn.includes(variant);
      const opacity = hidden ? "0" : "1";
      const transform = hidden ? node.hiddenTransform : node.transform;
      if (transform !== undefined) el.style.transform = transform;
      if (el.style.opacity !== opacity) {
        const fromOpacity = getComputedStyle(el).opacity;
        el.style.opacity = opacity;
        if (animate) el.animate({ opacity: [fromOpacity, opacity] }, { duration, easing });
      }
    }

    // Layout animation: slide every node from its old position to the new one.
    if (animate) {
      for (const child of children) {
        const prev = before.get(child)!;
        const next = child.getBoundingClientRect();
        const dx = prev.left - next.left;
        const dy = prev.top - next.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
        const base = child.style.transform || "none";
        const prefix = `translate(${dx}px, ${dy}px)`;
        child.animate(
          { transform: [base === "none" ? prefix : `${prefix} ${base}`, base === "none" ? "translate(0px, 0px)" : `translate(0px, 0px) ${base}`] },
          { duration, easing, composite: "replace" }
        );
      }
    }

    // The connector line exists in every state except Start and draws itself in.
    let path = diagram.querySelector<HTMLElement>(":scope > .framer-wipbva-container");
    if (variant === "Start") {
      path?.remove();
    } else if (!path) {
      diagram.insertAdjacentHTML("beforeend", diagramPathMarkup);
      path = diagram.lastElementChild as HTMLElement;
      const stroke = path.querySelector("path")!;
      if (reducedMotion()) stroke.setAttribute("stroke-dasharray", "1 1");
      else
        stroke
          .animate({ strokeDasharray: ["0 1", "1 1"] }, { ...diagramPathTransition, fill: "forwards" })
          .finished.then(() => stroke.setAttribute("stroke-dasharray", "1 1"))
          .catch(() => {});
    }
  };

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const play = () => {
    clearTimers();
    if (reducedMotion()) {
      setVariant("End", false);
      return;
    }
    let at = 0;
    for (const step of diagramSequence) {
      timers.push(window.setTimeout(() => setVariant(step.variant), at));
      at += step.hold;
    }
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) play();
      else {
        clearTimers();
        setVariant("Start", false);
      }
    },
    { threshold: 0.5 }
  );
  observer.observe(diagram);
  return () => {
    observer.disconnect();
    clearTimers();
  };
}

// --- Hover states -------------------------------------------------------------

function wrapGradientText(textEl: Element | null) {
  if (!textEl || textEl.querySelector(":scope > [data-text-fill]")) return;
  const span = document.createElement("span");
  span.dataset.textFill = "true";
  span.className = "framer-text";
  span.style.backgroundImage = brandGradientText;
  span.append(...textEl.childNodes);
  textEl.append(span);
}

function unwrapGradientText(textEl: Element | null) {
  const span = textEl?.querySelector(":scope > [data-text-fill]");
  if (span) span.replaceWith(...span.childNodes);
}

const hoverHandlers: { selector: string; enter: (el: HTMLElement) => void; leave: (el: HTMLElement) => void }[] = [
  {
    // "Book a Call" style buttons: a white layer slides up and the label turns into gradient text.
    selector: "a.framer-N545D.framer-v-70bpxm",
    enter(el) {
      el.classList.add("hover");
      const bg = el.querySelector<HTMLElement>(".framer-cyvul8");
      if (bg) animateTo(bg, { transform: "none", backgroundColor: white }, buttonSpring);
      wrapGradientText(el.querySelector(".framer-1w6zrc5 p"));
    },
    leave(el) {
      el.classList.remove("hover");
      const bg = el.querySelector<HTMLElement>(".framer-cyvul8");
      if (bg) animateTo(bg, { transform: "translateY(-50%)", backgroundColor: "rgba(246, 239, 249, 0.8)" }, buttonSpring);
      unwrapGradientText(el.querySelector(".framer-1w6zrc5 p"));
    }
  },
  {
    // Nav links get a white pill and gradient text (the "Active" variant already has the pill).
    selector: "a.framer-kcXgq.framer-v-1lz6xds",
    enter(el) {
      el.classList.add("hover");
      animateTo(el, { backgroundColor: white }, navLinkSpring);
      wrapGradientText(el.querySelector(".framer-1jdyzcd p"));
    },
    leave(el) {
      el.classList.remove("hover");
      animateTo(el, { backgroundColor: "rgba(255, 255, 255, 0)" }, navLinkSpring);
      unwrapGradientText(el.querySelector(".framer-1jdyzcd p"));
    }
  },
  {
    // Form submit button: the round background grows to fill the button.
    selector: "button.framer-JSiNX.framer-v-qx3a8",
    enter(el) {
      const bg = el.querySelector<HTMLElement>(".framer-1lcfeng");
      const before = bg?.getBoundingClientRect();
      el.classList.add("hover");
      wrapGradientText(el.querySelector(".framer-y0o14z p"));
      if (bg && before) growFrom(bg, before);
      if (bg) animateTo(bg, { backgroundColor: white }, buttonSpring);
    },
    leave(el) {
      const bg = el.querySelector<HTMLElement>(".framer-1lcfeng");
      const before = bg?.getBoundingClientRect();
      el.classList.remove("hover");
      unwrapGradientText(el.querySelector(".framer-y0o14z p"));
      if (bg && before) growFrom(bg, before);
      if (bg) animateTo(bg, { backgroundColor: "rgba(246, 239, 249, 0.8)" }, buttonSpring);
    }
  }
];

/** Animates an element's box from a previous rect to its current layout using clip-path, keeping the corner radius intact. */
function growFrom(el: HTMLElement, before: DOMRect) {
  const after = el.getBoundingClientRect();
  const top = before.top - after.top;
  const left = before.left - after.left;
  const right = after.right - before.right;
  const bottom = after.bottom - before.bottom;
  const radius = Math.min(before.height, before.width) / 2;
  const { duration, easing } = timing(buttonSpring);
  el.animate(
    {
      clipPath: [`inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`, `inset(0px 0px 0px 0px round ${after.height / 2}px)`]
    },
    { duration, easing }
  );
}

export function setupHover(root: ParentNode): Cleanup {
  if (!window.matchMedia("(hover: hover)").matches) return () => {};
  const cleanups: Cleanup[] = [];
  for (const handler of hoverHandlers) {
    root.querySelectorAll<HTMLElement>(handler.selector).forEach((el) => {
      // Hover only applies while the element is still in the variant the
      // selector describes (e.g. not while the submit button shows "Loading").
      const enter = () => el.matches(handler.selector) && handler.enter(el);
      const leave = () => el.matches(handler.selector) && handler.leave(el);
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      });
    });
  }
  return () => cleanups.forEach((c) => c());
}

// --- In-page anchors ----------------------------------------------------------------

export function setupSmoothScroll(root: HTMLElement): Cleanup {
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
    history.pushState(null, "", link.hash);
  };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}

// --- Contact form -------------------------------------------------------------------

const submitStates = {
  Default: "framer-v-qx3a8",
  Loading: "framer-v-wu580k",
  Success: "framer-v-16wfpmb",
  Error: "framer-v-1o6r7ch"
} as const;

const submitBackgrounds: Partial<Record<keyof typeof submitStates, string>> = {
  Success: "linear-gradient(140deg, rgb(42, 184, 146) 0%, rgb(24, 143, 84) 100%)",
  Error: "linear-gradient(140deg, rgba(255, 34, 68, 0.5) 0%, rgb(143, 24, 42) 100%)"
};

const submitLabels: Partial<Record<keyof typeof submitStates, string>> = {
  Success: "We'll be in touch soon",
  Error: "Something went wrong"
};

export function setupForm(root: ParentNode): Cleanup {
  const form = root.querySelector<HTMLFormElement>("form.framer-lxwa7d");
  if (!form) return () => {};
  const button = form.querySelector<HTMLButtonElement>("button.framer-JSiNX");
  const content = button?.querySelector<HTMLElement>(".framer-c18xzi");
  const label = button?.querySelector<HTMLElement>(".framer-y0o14z p");
  const originalBackground = button?.style.background ?? "";
  const originalLabel = label?.textContent ?? "";
  let spinner: HTMLElement | null = null;

  const setState = (state: keyof typeof submitStates) => {
    if (!button) return;
    button.classList.remove(...Object.values(submitStates), "hover");
    button.classList.add(submitStates[state]);
    button.dataset.framerName = state;
    button.style.background = submitBackgrounds[state] ?? originalBackground;
    unwrapGradientText(label ?? null);
    if (label) label.textContent = submitLabels[state] ?? originalLabel;
    if (content) content.style.display = state === "Loading" ? "none" : "";
    content?.querySelector<HTMLElement>(".framer-1lcfeng")?.style.setProperty("display", state === "Default" ? "" : "none");
    if (state === "Loading" && !spinner) {
      spinner = document.createElement("div");
      spinner.className = "framer-10umrtb";
      spinner.dataset.framerName = "Spinner";
      const mask = "url('/assets/media/pGiXYozQ3mE4cilNOItfe2L2fUA.svg') alpha no-repeat center / cover add";
      spinner.style.cssText = `mask:${mask};-webkit-mask:${mask}`;
      spinner.innerHTML =
        '<div class="framer-bsrbiz" style="background:conic-gradient(from 0deg at 50% 50%, rgba(255, 255, 255, 0) 0deg, var(--token-c5d13160-4767-4825-b37f-5cd1213332b9, rgb(255, 255, 255)) 360deg);animation:revelio-loop-rotate 1s linear infinite"><div class="framer-6p7pq8" style="background-color:rgb(255, 255, 255);border-radius:1px;transform:translateX(-50%)"></div></div>';
      button.prepend(spinner);
    } else if (state !== "Loading") {
      spinner?.remove();
      spinner = null;
    }
  };

  // Framer styles empty inputs differently (placeholder colour).
  const syncEmpty = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.classList.contains("framer-form-input")) input.classList.toggle("framer-form-input-empty", !input.value);
  };

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setState("Loading");
    try {
      const response = await fetch("/api/contact", { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error(`Contact request failed: ${response.status}`);
      setState("Success");
      form.reset();
      form.querySelectorAll(".framer-form-input").forEach((input) => input.classList.add("framer-form-input-empty"));
    } catch (error) {
      console.error(error);
      setState("Error");
    }
  };

  form.addEventListener("input", syncEmpty);
  form.addEventListener("submit", onSubmit);
  return () => {
    form.removeEventListener("input", syncEmpty);
    form.removeEventListener("submit", onSubmit);
  };
}
