"use client";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, Legend, CartesianGrid,
} from "recharts";
import type { Stats } from "@/lib/types";
import ChartHelp from "@/components/ChartHelp";

const STEP_COLOR: Record<string, string> = {
  s1_lipid: "#e0a92b", s2_inflammation: "#e05a55", s3_rupture: "#c01a30",
  s4_endothelial: "#2fa8d8", s5_platelet: "#9d6fdb", s6_thromboxane: "#e07c3e",
  s7_coagulation: "#d12836", s8_injury: "#e06a86", s0_systemic: "#6b7a90",
};
const TYPE_COLOR: Record<string, string> = {
  protein: "#4c78a8", gene: "#f58518", metabolite: "#54a24b", rna: "#b279a2",
  lipid: "#e45756", peptide: "#72b7b2", lipoprotein: "#eeca3b", complex: "#9d755d", other: "#bab0ac",
};

const card: React.CSSProperties = {
  background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px",
};
const tipStyle = { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text)" };

function CardTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{children}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard({ stats }: { stats: Stats }) {
  const router = useRouter();

  const stepData = stats.steps.map((s) => ({
    step_id: s.step_id, name: s.short, molecules: s.n, druggable: s.evidence.druggable,
  }));
  const evidenceData = stats.steps
    .filter((s) => s.step_id !== "s0_systemic")
    .map((s) => ({ name: s.short, ...s.evidence }));
  const typeData = Object.entries(stats.by_type).map(([name, value]) => ({ name, value }));
  const confData = ["high", "medium", "low"].map((k) => ({ name: k, value: stats.by_confidence[k] ?? 0 }));
  const confColor: Record<string, string> = { high: "#43a047", medium: "#e0a92b", low: "#8b98a9" };

  return (
    <div className="grid-collapse" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Step distribution — full width, clickable */}
      <div style={{ ...card, gridColumn: "1 / -1" }}>
        <CardTitle sub="Click a bar to jump to that step. Lighter overlay = druggable targets.">
          Molecules per cascade step
        </CardTitle>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={stepData} margin={{ top: 6, right: 16, bottom: 96, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#26304140" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#8b98a9", fontSize: 10 }} angle={-40} textAnchor="end" interval={0} height={110} tickMargin={6} />
            <YAxis tick={{ fill: "#8b98a9", fontSize: 11 }} width={34} />
            <Tooltip contentStyle={tipStyle} cursor={{ fill: "var(--track)" }} />
            <Bar dataKey="molecules" radius={[4, 4, 0, 0]} cursor="pointer"
                 onClick={(d: { step_id?: string }) => d.step_id && router.push(`/step/${d.step_id}`)}>
              {stepData.map((d) => <Cell key={d.step_id} fill={STEP_COLOR[d.step_id]} />)}
            </Bar>
            <Bar dataKey="druggable" radius={[4, 4, 0, 0]} cursor="pointer"
                 onClick={(d: { step_id?: string }) => d.step_id && router.push(`/step/${d.step_id}`)}>
              {stepData.map((d) => <Cell key={d.step_id} fill={STEP_COLOR[d.step_id]} fillOpacity={0.4} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ChartHelp
          what={<>The number of catalogued molecules assigned to each of the eight atherothrombotic cascade steps (plus a systemic group). The solid bar is the total; the lighter overlay is the subset that is <b>druggable</b> (has a tractable drug target).</>}
          read={<>Taller bar = more molecules mapped to that step. Compare the lighter overlay to the full bar to gauge what fraction of a step is druggable. Click any bar to open that step&apos;s molecule list.</>}
          takeaway={<>Shows where biomarker discovery has concentrated across the cascade, and which steps are richest in actionable drug targets versus measurement-only markers.</>}
        />
      </div>

      {/* Evidence coverage per step */}
      <div style={card}>
        <CardTitle sub="Count of molecules with each evidence type, per cascade step.">
          Evidence coverage by step
        </CardTitle>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={evidenceData} margin={{ top: 6, right: 10, bottom: 96, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#26304140" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#8b98a9", fontSize: 10 }} angle={-40} textAnchor="end" interval={0} height={110} tickMargin={6} />
            <YAxis tick={{ fill: "#8b98a9", fontSize: 11 }} width={34} />
            <Tooltip contentStyle={tipStyle} cursor={{ fill: "var(--track)" }} />
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
            <Bar dataKey="literature" stackId="a" fill="#4cc9f0" />
            <Bar dataKey="trials" stackId="a" fill="#f2c14e" />
            <Bar dataKey="omics" stackId="a" fill="#b388eb" />
            <Bar dataKey="genetic" stackId="a" fill="#43d17a" />
          </BarChart>
        </ResponsiveContainer>
        <ChartHelp
          what={<>For each cascade step, a stacked bar counting how many of its molecules carry each evidence type — <b>literature</b> (PubMed), <b>trials</b> (ClinicalTrials.gov), <b>omics</b> (GEO/PRIDE/ArrayExpress), and <b>genetic</b> (Open Targets / GWAS).</>}
          read={<>Total bar height = combined evidence entries at that step; each colored segment is one evidence type. A molecule can contribute to several segments, so this counts evidence coverage, not unique molecules.</>}
          takeaway={<>Steps dominated by the literature segment are supported mostly by observational reports; visible trial and genetic segments flag steps with interventional or causal support.</>}
        />
      </div>

      {/* Molecule type pie */}
      <div style={card}>
        <CardTitle sub={`${stats.n_molecules.toLocaleString()} molecules by biochemical class.`}>
          Molecule types
        </CardTitle>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius="72%" innerRadius="38%"
                 stroke="var(--panel)" strokeWidth={1.5}>
              {typeData.map((d) => <Cell key={d.name} fill={TYPE_COLOR[d.name] ?? "#bab0ac"} />)}
            </Pie>
            <Tooltip contentStyle={tipStyle} formatter={(v: number, n: string) => [`${v} molecules`, n]} />
            <Legend
              layout="horizontal" align="center" verticalAlign="bottom"
              wrapperStyle={{ fontSize: 11, lineHeight: "18px", paddingTop: 6 }}
              formatter={(value: string) => {
                const item = typeData.find((t) => t.name === value);
                return `${value} ${item ? item.value : ""}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <ChartHelp
          what={<>The biochemical class of every catalogued molecule — protein, gene, metabolite, RNA, lipid, peptide, lipoprotein, or complex.</>}
          read={<>Each wedge is one class; the number is its molecule count. Larger wedge = more of the catalog is that class.</>}
          takeaway={<>Indicates which assay technologies a full panel would require: protein/peptide markers imply immunoassay, metabolites and lipids imply mass-spec / NMR, and RNA implies nucleic-acid assays.</>}
        />
      </div>

      {/* Confidence */}
      <div style={{ ...card, gridColumn: "1 / -1" }}>
        <CardTitle sub="Confidence of each molecule's pathway-step assignment (evidence-tagged inference).">
          Pathway-step assignment confidence
        </CardTitle>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={confData} layout="vertical" margin={{ top: 4, right: 30, bottom: 4, left: 60 }}>
            <XAxis type="number" tick={{ fill: "#8b98a9", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "var(--text)", fontSize: 12 }} width={60} />
            <Tooltip contentStyle={tipStyle} cursor={{ fill: "var(--track)" }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ fill: "var(--text)", fontSize: 11, position: "right" }}>
              {confData.map((d) => <Cell key={d.name} fill={confColor[d.name]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ChartHelp
          what={<>How many molecules fall into each confidence level — <b>high</b>, <b>medium</b>, or <b>low</b> — for their assigned cascade step. Confidence reflects the strength and consistency of the harvested evidence behind the placement, not the molecule&apos;s clinical importance.</>}
          read={<>Longer bar = more molecules at that confidence. Each molecule&apos;s dot on its evidence page uses the same green / amber / grey coding.</>}
          takeaway={<>Pathway-step placement is an evidence-tagged inference, not curated ground truth. High-confidence assignments are safest to build on; low-confidence ones are candidates to verify before relying on them.</>}
        />
      </div>
    </div>
  );
}
