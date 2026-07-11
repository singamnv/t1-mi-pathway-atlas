"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV: { href: string; label: string }[] = [
  { href: "/", label: "Pathway" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/discrimination", label: "T1 vs T2" },
  { href: "/diagnostic", label: "Diagnostic" },
  { href: "/table", label: "Table" },
  { href: "/molecules", label: "Molecules" },
  { href: "/about", label: "Methods" },
];

// Secondary/site links surfaced in the mobile menu (also live in the footer on all viewports).
const SITE_NAV: { href: string; label: string }[] = [
  { href: "/about-me", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ subtitle }: { subtitle?: string }) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  // Close the mobile menu on route change.
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.82)",
        position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="container-x app-bar" style={{ padding: "11px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }} onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="CoronaryAtlas logo"
            width={34}
            height={34}
            style={{ borderRadius: 10, display: "block", flex: "0 0 auto", boxShadow: "0 6px 16px -6px rgba(99,102,241,0.7)" }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: 16, lineHeight: 1.05, letterSpacing: "-0.4px", color: "var(--text)", whiteSpace: "nowrap" }}>
              CoronaryAtlas
            </div>
            <div className="mono-kicker app-bar-kicker" style={{ fontSize: 9.5, letterSpacing: 1.6, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {subtitle ?? "Type 1 MI · De Novo"}
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-desktop" style={{ marginLeft: "auto", display: "flex", gap: 2, fontSize: 13, alignItems: "center" }}>
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                style={{
                  padding: "6px 10px", borderRadius: 100, transition: "all .2s",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--accent)" : "var(--muted)",
                  background: active ? "rgba(99,102,241,0.10)" : "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{
            marginLeft: "auto", display: "none", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, borderRadius: 10, border: "1px solid var(--border)",
            background: "var(--panel)", color: "var(--text)", cursor: "pointer", flex: "0 0 auto",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>
                  : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <nav className="nav-mobile" style={{ borderTop: "1px solid var(--border)", background: "var(--panel)", padding: "8px 12px 14px" }}>
          <div className="container-x" style={{ padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            {[...NAV, ...SITE_NAV].map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  style={{
                    padding: "11px 14px", borderRadius: 12, fontSize: 15,
                    fontWeight: active ? 600 : 500,
                    color: active ? "var(--accent)" : "var(--text-2)",
                    background: active ? "rgba(99,102,241,0.10)" : "transparent",
                  }}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
