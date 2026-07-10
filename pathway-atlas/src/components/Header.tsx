"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { href: string; label: string }[] = [
  { href: "/", label: "Pathway" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/discrimination", label: "T1 vs T2" },
  { href: "/diagnostic", label: "Diagnostic" },
  { href: "/table", label: "Table" },
  { href: "/molecules", label: "Molecules" },
  { href: "/about", label: "Methods" },
];

export default function Header({ subtitle }: { subtitle?: string }) {
  const pathname = usePathname() || "/";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.72)",
        position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="container-x" style={{ padding: "13px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="CoronaryAtlas logo"
            width={36}
            height={36}
            style={{ borderRadius: 11, display: "block", boxShadow: "0 6px 16px -6px rgba(99,102,241,0.7)" }}
          />
          <div>
            <div style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: 16.5, lineHeight: 1.05, letterSpacing: "-0.4px", color: "var(--text)" }}>
              CoronaryAtlas
            </div>
            <div className="mono-kicker" style={{ fontSize: 9.5, letterSpacing: 1.6, marginTop: 1 }}>
              {subtitle ?? "Type 1 MI · De Novo"}
            </div>
          </div>
        </Link>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 4, fontSize: 13, alignItems: "center" }}>
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                style={{
                  padding: "6px 11px", borderRadius: 100, transition: "all .2s",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--accent)" : "var(--muted)",
                  background: active ? "rgba(99,102,241,0.10)" : "transparent",
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
