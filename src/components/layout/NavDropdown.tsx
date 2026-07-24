"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { isNavHrefActive, isNavItemTreeActive } from "@/config/navigation";
import type { SiteNavItem } from "@/lib/view-models/site-navigation";
import { cn } from "@/lib/utils";

type NavDropdownProps = {
  item: SiteNavItem;
  pathname: string;
  overlayTone?: boolean;
};

export function NavDropdown({
  item,
  pathname,
  overlayTone = false
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const parentActive = isNavItemTreeActive(item, pathname);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn("shell-nav-dropdown", overlayTone && "is-overlay-tone")}
    >
      <button
        type="button"
        className={cn(
          "shell-nav-dropdown__trigger",
          parentActive && "is-active"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{item.label}</span>
        <ChevronDown
          size={14}
          aria-hidden
          className={cn("shell-nav-dropdown__chevron", open && "is-open")}
        />
      </button>
      {open ? (
        <ul id={menuId} className="shell-nav-dropdown__menu" role="menu">
          {item.children.map((child) => {
            const active = isNavHrefActive(child.href, pathname);
            return (
              <li key={child.id} role="none">
                <Link
                  href={child.href}
                  role="menuitem"
                  className={active ? "is-active" : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
