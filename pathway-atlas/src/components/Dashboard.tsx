"use client";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, Legend, CartesianGrid,
} from "recharts";
import type { Stats } from "@/lib/types";

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
const tipStyle = { background: "#0d1420", border: "1px solid #26304180", borderRadius: 8, fontSize: 12, color: "#e6edf3" };

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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Step distribution — full width, clickable */}
      <div style={{ ...card, gridColumn: "1 / -1" }}>
        <CardTitle sub="Click a bar to jump to that step. Lighter overlay = druggable targets.">
          Molecules per cascade step
        </CardTitle>
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={stepData} margin={{ top: 6, right: 20, bottom: 40, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#26304140" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#8b98a9", fontSize: 11 }} angle={-25} textAnchor="end" interval={0} height={60} />
            <YAxis tick={{ fill: "#8b98a9", fontSize: 11 }} />
            <Tooltip contentStyle={tipStyle} cursor={{ fill: "#ffffff08" }} />
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
      </div>

      {/* Evidence coverage per step */}
      <div style={card}>
        <CardTitle sub="Count of molecules with each evidence type, per cascade step.">
          Evidence coverage by step
        </CardTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evidenceData} margin={{ top: 6, right: 10, bottom: 40, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#26304140" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#8b98a9", fontSize: 10 }} angle={-30} textAnchor="end" interval={0} height={64} />
            <YAxis tick={{ fill: "#8b98a9", fontSize: 11 }} />
            <Tooltip contentStyle={tipStyle} cursor={{ fill: "#ffffff08" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="literature" stackId="a" fill="#4cc9f0" />
            <Bar dataKey="trials" stackId="a" fill="#f2c14e" />
            <Bar dataKey="omics" stackId="a" fill="#b388eb" />
            <Bar dataKey="genetic" stackId="a" fill="#43d17a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Molecule type pie */}
      <div style={card}>
        <CardTitle sub={`${stats.n_molecules.toLocaleString()} molecules by biochemical class.`}>
          Molecule types
        </CardTitle>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={45}
                 label={(e: { name?: string; value?: number }) => `${e.name} ${e.value}`} labelLine={false}
                 style={{ fontSize: 10 }}>
              {typeData.map((d) => <Cell key={d.name} fill={TYPE_COLOR[d.name] ?? "#bab0ac"} />)}
            </Pie>
            <Tooltip contentStyle={tipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence */}
      <div style={{ ...card, gridColumn: "1 / -1" }}>
        <CardTitle sub="Confidence of each molecule's pathway-step assignment (evidence-tagged inference).">
          Pathway-step assignment confidence
        </CardTitle>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={confData} layout="vertical" margin={{ top: 4, right: 30, bottom: 4, left: 60 }}>
            <XAxis type="number" tick={{ fill: "#8b98a9", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#e6edf3", fontSize: 12 }} width={60} />
            <Tooltip contentStyle={tipStyle} cursor={{ fill: "#ffffff08" }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ fill: "#e6edf3", fontSize: 11, position: "right" }}>
              {confData.map((d) => <Cell key={d.name} fill={confColor[d.name]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
