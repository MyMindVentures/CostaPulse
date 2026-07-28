"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrategyCardViewModel } from "./strategy-view-model";
import {
  getStrategyRoleFromAnchor,
  STRATEGY_ROLE_DISPLAY_MAP,
  type StrategyRoleKey
} from "./role-display-map";

export type RoleAccordionItem = {
  role: StrategyRoleKey;
  label: string;
  strategy: StrategyCardViewModel;
};

type RoleAccordionGroupProps = {
  items: RoleAccordionItem[];
  labels: {
    gain: string;
    matters: string;
  };
};

function currentHashRole() {
  return getStrategyRoleFromAnchor(window.location.hash);
}

export function RoleAccordionGroup({ items, labels }: RoleAccordionGroupProps) {
  const [openRole, setOpenRole] = useState<StrategyRoleKey | null>(null);

  const applyHash = useCallback((scroll: boolean) => {
    const role = currentHashRole();
    setOpenRole(role);
    if (role && scroll) {
      window.requestAnimationFrame(() => {
        const reduceMotion = window.matchMedia?.(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        document
          .getElementById(STRATEGY_ROLE_DISPLAY_MAP[role].anchor)
          ?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
          });
      });
    }
  }, []);

  useEffect(() => {
    const initialFrame = window.requestAnimationFrame(() => applyHash(true));
    const handleNavigation = () => applyHash(true);
    window.addEventListener("hashchange", handleNavigation);
    window.addEventListener("popstate", handleNavigation);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("hashchange", handleNavigation);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [applyHash]);

  function toggle(role: StrategyRoleKey) {
    const nextRole = openRole === role ? null : role;
    setOpenRole(nextRole);

    const nextUrl = nextRole
      ? `#${STRATEGY_ROLE_DISPLAY_MAP[nextRole].anchor}`
      : `${window.location.pathname}${window.location.search}`;
    window.history.pushState(null, "", nextUrl);
  }

  return (
    <div className="mt-10 space-y-5 sm:space-y-6">
      {items.map((item) => (
        <RoleAccordionCard
          key={item.strategy.id}
          item={item}
          labels={labels}
          open={openRole === item.role}
          onToggle={() => toggle(item.role)}
        />
      ))}
    </div>
  );
}

function RoleAccordionCard({
  item,
  labels,
  open,
  onToggle
}: {
  item: RoleAccordionItem;
  labels: RoleAccordionGroupProps["labels"];
  open: boolean;
  onToggle: () => void;
}) {
  const reactId = useId();
  const contentId = `role-accordion-${reactId.replace(/:/g, "")}`;
  const { strategy, role, label } = item;
  const anchor = STRATEGY_ROLE_DISPLAY_MAP[role].anchor;

  return (
    <article
      id={anchor}
      className={cn(
        "scroll-mt-[calc(var(--shell-nav-height)+1.5rem)] overflow-hidden rounded-2xl border transition-colors duration-200 motion-reduce:transition-none",
        open
          ? "border-gold bg-navy text-white"
          : "border-gold/60 bg-card text-navy hover:border-turquoise"
      )}
    >
      <h3 className="font-sans tracking-normal">
        <button
          type="button"
          className={cn(
            "focus-visible:ring-turquoise flex min-h-11 w-full items-center gap-4 p-5 text-left focus-visible:ring-3 focus-visible:outline-none focus-visible:ring-inset sm:p-6",
            open ? "hover:bg-navy-soft" : "hover:bg-sand"
          )}
          aria-expanded={open}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-2xl leading-tight sm:text-3xl">
              {label}
            </span>
            <span
              className={cn(
                "mt-2 block text-base leading-relaxed sm:text-lg",
                open ? "text-white" : "text-ink"
              )}
            >
              {strategy.summary}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-6 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
      </h3>

      <div id={contentId} hidden={!open}>
        <div className="border-gold/50 grid gap-8 border-t px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-2 lg:gap-12">
          <section aria-labelledby={`${contentId}-gain`}>
            <h4
              id={`${contentId}-gain`}
              className="text-gold font-sans text-sm font-bold tracking-widest uppercase"
            >
              {labels.gain}
            </h4>
            <p className="mt-4 text-lg leading-relaxed text-white">
              {strategy.objective}
            </p>
            {strategy.win_win.map((entry) => (
              <p
                key={`${entry.beneficiary_role}-${entry.benefit}`}
                className="mt-4 text-lg leading-relaxed text-white"
              >
                {entry.benefit}
              </p>
            ))}
          </section>

          <section aria-labelledby={`${contentId}-matters`}>
            <h4
              id={`${contentId}-matters`}
              className="text-gold font-sans text-sm font-bold tracking-widest uppercase"
            >
              {labels.matters}
            </h4>
            {strategy.description ? (
              <p className="mt-4 text-lg leading-relaxed text-white">
                {strategy.description}
              </p>
            ) : null}
            {strategy.win_win.map((entry) => (
              <p
                key={`${entry.beneficiary_role}-${entry.motivation}`}
                className="mt-4 text-lg leading-relaxed text-white"
              >
                {entry.motivation}
              </p>
            ))}
          </section>
        </div>
      </div>
    </article>
  );
}
