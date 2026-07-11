import Header from "@/components/Header";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <Header subtitle="Contact" />
      <main className="container-x" style={{ padding: "26px 24px 70px", maxWidth: 720 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Contact &amp; suggestions</h1>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--muted)", margin: "0 0 26px", maxWidth: 620 }}>
          Spotted a molecule the atlas is missing, or have feedback on how it works? Send it along. Molecule
          suggestions with a mechanism and a reference or two are especially welcome and may be incorporated into a
          future build.
        </p>

        <div
          style={{
            background: "var(--panel)", border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)", padding: "26px 24px", boxShadow: "var(--shadow-card)",
          }}
        >
          <ContactForm />
        </div>

        <p style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 16, lineHeight: 1.5 }}>
          Please don&apos;t submit confidential or patient-identifiable information. Submissions are governed by our{" "}
          <a href="/terms" style={{ color: "var(--accent)", fontWeight: 600 }}>Terms of Service</a>.
        </p>
      </main>
    </>
  );
}
