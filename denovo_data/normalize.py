"""Canonical molecule normalization for the de novo Type 1 MI harvest.
Merges molecule mentions from heterogeneous sources into one canonical key.
"""
import re, unicodedata

# Curated alias -> canonical (display_name, gene_symbol|None, molecule_type)
# Keeps the biology honest: abbreviations, receptor/ligand names, assay-name variants.
CANON = {}
def _add(canonical, gene, mtype, *aliases):
    for a in (canonical,)+aliases:
        CANON[_slug(a)] = {"name": canonical, "gene": gene, "type": mtype}

def _slug(s):
    if s is None: return ""
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii","ignore").decode()
    s = s.lower().strip()
    s = re.sub(r"[\(\)\[\]\{\}]", " ", s)
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")

# --- curated canon table (high-value, ambiguous, or multi-alias molecules) ---
_add("Cardiac troponin", "TNNI3", "protein", "troponin","ctni","ctnt","cardiac troponin i","cardiac troponin t","hs-troponin","high-sensitivity troponin","hs-cTnI","hs-cTnT","tnni","tnnt","cardiac troponin (cTnI/cTnT)")
_add("CK-MB", "CKM", "protein", "creatine kinase-mb","ck mb","creatine kinase mb")
_add("Myoglobin", "MB", "protein", "myoglobin")
_add("H-FABP", "FABP3", "protein", "heart-type fatty acid binding protein","fabp3","hfabp","h fabp")
_add("Copeptin", "AVP", "peptide", "copeptin","ct-proavp","c-terminal provasopressin")
_add("hs-CRP", "CRP", "protein", "crp","c-reactive protein","high-sensitivity crp","hscrp","hs crp","hs-crp / crp")
_add("Interleukin-6", "IL6", "protein", "il-6","il6","interleukin 6")
_add("Myeloperoxidase", "MPO", "protein", "mpo","myeloperoxidase (mpo)")
_add("Lp-PLA2", "PLA2G7", "protein", "lipoprotein-associated phospholipase a2","lp pla2","pla2g7","lppla2","lipoprotein associated phospholipase a2")
_add("Pentraxin-3", "PTX3", "protein", "ptx3","pentraxin 3","pentraxin-3 (ptx3)")
_add("Neopterin", None, "metabolite", "neopterin")
_add("Placental growth factor", "PGF", "protein", "plgf","pgf","placental growth factor (plgf)")
_add("Oxidized LDL", None, "lipoprotein", "oxldl","ox-ldl","oxidized low-density lipoprotein","oxidised ldl","oxidized ldl (oxldl)")
_add("Lipoprotein(a)", "LPA", "lipoprotein", "lp(a)","lipoprotein a","lpa","lipoprotein_a")
_add("LDL cholesterol", None, "lipoprotein", "ldl","ldl-c","low-density lipoprotein","ldl cholesterol")
_add("Apolipoprotein B", "APOB", "protein", "apob","apo b","apolipoprotein b")
_add("MMP-9", "MMP9", "protein", "matrix metalloproteinase-9","mmp9","mmp 9","matrix metalloproteinase 9")
_add("MMP-2", "MMP2", "protein", "matrix metalloproteinase-2","mmp2","mmp 2")
_add("TIMP-1", "TIMP1", "protein", "timp1","tissue inhibitor of metalloproteinase-1","timp 1")
_add("PAPP-A", "PAPPA", "protein", "pregnancy-associated plasma protein a","pappa","papp a","papp-a")
_add("von Willebrand factor", "VWF", "protein", "vwf","von willebrand factor (vwf)","von willebrand factor")
_add("ADAMTS13", "ADAMTS13", "protein", "adamts13","adamts-13")
_add("sICAM-1", "ICAM1", "protein", "icam-1","icam1","intercellular adhesion molecule-1","soluble icam-1","sicam-1","sicam1")
_add("sVCAM-1", "VCAM1", "protein", "vcam-1","vcam1","vascular cell adhesion molecule-1","soluble vcam-1","svcam-1","svcam1")
_add("E-selectin", "SELE", "protein", "e selectin","sele","e-selectin","soluble e-selectin")
_add("P-selectin", "SELP", "protein", "soluble p-selectin","selp","p selectin","sp-selectin","soluble p selectin","p-selectin")
_add("sCD40L", "CD40LG", "protein", "cd40l","scd40l","soluble cd40 ligand","cd40lg","soluble cd40l (scd40l)","soluble cd40l")
_add("Platelet factor 4", "PF4", "protein", "pf4","platelet factor 4 (pf4)","platelet factor-4","cxcl4")
_add("Beta-thromboglobulin", "PPBP", "protein", "b-thromboglobulin","beta thromboglobulin","btg","ppbp","cxcl7","beta-thromboglobulin")
_add("GPVI", "GP6", "protein", "glycoprotein vi","soluble gpvi","gp6","sgpvi","gpvi")
_add("Platelet-monocyte aggregates", None, "cell", "platelet monocyte aggregates","pmas","platelet-monocyte aggregates")
_add("Mean platelet volume", None, "cell", "mpv","mean platelet volume","mpv / mpv:platelet ratio","mpv:platelet ratio")
_add("11-dehydro-thromboxane B2", None, "metabolite", "11-dehydrothromboxane b2","11 dehydro thromboxane b2","11-dh-txb2","urinary thromboxane")
_add("Thromboxane B2", None, "metabolite", "txb2","thromboxane b2","thromboxane a2","txa2")
_add("Fibrinogen", "FGA", "protein", "fibrinogen","fga","fibrinogen alpha")
_add("D-dimer", None, "protein", "d dimer","ddimer","d-dimer")
_add("Thrombin-antithrombin complex", None, "protein", "tat","thrombin-antithrombin","thrombin antithrombin","thrombin-antithrombin / f1+2","thrombin-antithrombin complex")
_add("Prothrombin fragment 1+2", None, "protein", "f1+2","f1.2","prothrombin fragment 1+2","f1 2")
_add("Tissue factor", "F3", "protein", "tissue factor","f3","coagulation factor iii","cd142")
_add("PAI-1", "SERPINE1", "protein", "plasminogen activator inhibitor-1","pai1","serpine1","pai-1")
_add("Tissue plasminogen activator", "PLAT", "protein", "t-pa","tpa","plat","tissue plasminogen activator")
_add("NT-proBNP", "NPPB", "protein", "nt probnp","n-terminal pro b-type natriuretic peptide","ntprobnp","nt-probnp")
_add("BNP", "NPPB", "protein", "b-type natriuretic peptide","brain natriuretic peptide","bnp")
_add("MR-proADM", "ADM", "peptide", "mr-proadm","midregional pro-adrenomedullin","adm","proadm")
_add("CT-proET1", "EDN1", "peptide", "ct-proet1","c-terminal pro-endothelin-1","big endothelin","endothelin-1","edn1")
_add("MR-proANP", "NPPA", "peptide", "mr-proanp","midregional pro-atrial natriuretic peptide","proanp")
_add("Galectin-3", "LGALS3", "protein", "galectin 3","lgals3","gal-3","galectin-3")
_add("ST2", "IL1RL1", "protein", "st2","soluble st2","sst2","il1rl1","suppression of tumorigenicity 2")
_add("Growth differentiation factor 15", "GDF15", "protein", "gdf-15","gdf15","gdf 15","growth differentiation factor 15")
_add("Cystatin C", "CST3", "protein", "cystatin c","cst3","cystatin-c")
_add("Lactate", None, "metabolite", "lactate","lactic acid")
_add("Glucose", None, "metabolite", "glucose","blood glucose")
_add("Ischemia-modified albumin", "ALB", "protein", "ima","ischemia-modified albumin","ischemia modified albumin","ischemia-modified albumin (ima)")
_add("Neutrophil-lymphocyte ratio", None, "ratio", "nlr","neutrophil-lymphocyte ratio","neutrophil to lymphocyte ratio","neutrophil lymphocyte ratio")
_add("Soluble suppression of tumorigenicity 2", "IL1RL1", "protein", "sst2")

def normalize(name, gene_hint=None, type_hint=None):
    """Return (mol_id, display_name, gene_symbol, molecule_type).
    Uses curated canon first, then falls back to slug of the raw name."""
    s = _slug(name)
    if s in CANON:
        c = CANON[s]
        gid = _slug(c["gene"]) if c["gene"] else s
        return gid, c["name"], c["gene"], c["type"]
    # gene hint path
    if gene_hint:
        gs = _slug(gene_hint)
        if gs in CANON:
            c = CANON[gs]
            gid = _slug(c["gene"]) if c["gene"] else gs
            return gid, c["name"], c["gene"], c["type"]
    gid = _slug(gene_hint) if gene_hint else s
    disp = str(name).strip()
    return gid, disp, (gene_hint.upper() if gene_hint else None), (type_hint or "other")

if __name__ == "__main__":
    for t in ["hs-cTnI","MPO","Lp(a)","vWF","soluble CD40L (sCD40L)","NT-proBNP","some novel protein X"]:
        print(t, "->", normalize(t))
