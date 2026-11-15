import { useEffect, useRef, type ReactNode } from "react";

export function HorizontalSections({ children }: { children: ReactNode }) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const stage = scene.querySelector<HTMLElement>(".horizontal-stage");
    const track = scene.querySelector<HTMLElement>(".horizontal-track");
    if (!stage || !track) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (motion.matches) {
        scene.style.setProperty("--section-x", "0px");
        return;
      }
      const distance = scene.offsetHeight - stage.offsetHeight;
      const progress = Math.max(0, Math.min(1, -scene.getBoundingClientRect().top / Math.max(1, distance)));
      // Give the first and last frames a little reading time before entering/leaving.
      const travel = Math.max(0, Math.min(1, (progress - 0.1) / 0.8));
      scene.style.setProperty("--section-x", `${-travel * (track.scrollWidth - stage.offsetWidth)}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onFocus = (event: FocusEvent) => {
      if (motion.matches || !(event.target instanceof HTMLElement)) return;
      const panel = event.target.closest(".horizontal-panel");
      const panels = Array.from(track.children);
      const index = panel ? panels.indexOf(panel) : -1;
      if (index < 0) return;
      const bounds = panel?.getBoundingClientRect();
      if (bounds && bounds.left >= -1 && bounds.right <= stage.offsetWidth + 1) return;
      const top = window.scrollY + scene.getBoundingClientRect().top;
      const progress = 0.1 + (index / Math.max(1, panels.length - 1)) * 0.8;
      window.scrollTo({ top: top + progress * (scene.offsetHeight - stage.offsetHeight), behavior: "instant" });
      schedule();
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    track.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      track.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <div ref={sceneRef} className="horizontal-scene">
      <div className="horizontal-stage">
        <div className="horizontal-track">{children}</div>
      </div>
    </div>
  );
}