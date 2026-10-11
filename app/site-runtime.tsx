"use client";

import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  setupAppear,
  setupDiagram,
  setupForm,
  setupHeroAppear,
  setupHeroScroll,
  setupHover,
  setupSmoothScroll
} from "@/site/runtime/effects";
import PolicyUpdates from "./policy-updates";

/** Brings the static Framer markup to life: animations, interactive widgets and the contact form. */
export default function SiteRuntime() {
  useEffect(() => {
    const site = document.getElementById("site");
    if (!site) return;

    // Replace the server-rendered snapshot of the policy widget with the live React version.
    // A fresh host element per mount keeps Strict Mode's mount/unmount/mount
    // cycle from reusing a root that is still being torn down.
    let policyRoot: Root | undefined;
    const container = site.querySelector<HTMLElement>(".framer-11gkwzc-container");
    if (container) {
      const host = document.createElement("div");
      host.style.display = "contents";
      container.replaceChildren(host);
      policyRoot = createRoot(host);
      policyRoot.render(<PolicyUpdates />);
    }

    const cleanups = [
      setupHeroAppear(site),
      setupHeroScroll(site),
      setupAppear(site),
      setupDiagram(site),
      setupHover(site),
      setupSmoothScroll(site),
      setupForm(site)
    ];
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      // Unmounting synchronously inside React's commit phase is not allowed.
      const root = policyRoot;
      if (root) setTimeout(() => root.unmount());
    };
  }, []);

  return null;
}
