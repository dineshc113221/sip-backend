/* eslint-disable @typescript-eslint/no-explicit-any */
// scripts/migrate-packaging-structure.ts
import mongoose from "mongoose";
import { readFileSync } from "fs";
import path from "path";

/**
 * DICTS:
 *  - Primary flat dicts (highest priority):
 *      DICT_MATERIALS:  [{ spice_name, tru_name }]
 *      DICT_CONVERTING: [{ spice_name, tru_name }]
 *      DICT_FINISHING:  [{ spice_name, tru_name }]
 *  - Master nested dict (fallback):
 *      master[0].packaging.materials[].name {spice_name, tru_name}
 *      master[0].packaging.materials[].type[] {spice_name, tru_name}
 *      master[0].packaging.finishing_process[] {spice_name, tru_name}
 *      master[0].packaging.convertingProcess[] {spice_name, tru_name} (optional)
 *  - NEW: Component → Subcomponent dict:
 *      DICT_COMPONENTS: [{ componentType: string, Subcomponent: string }]
 */

// ========= CONFIG =========
const FILTER_JSON = process.env.FILTER ?? "";
const MONGO_URI =
  process.env.MONGO_URI ??
  "mongodb+srv://SIP-Dev-SystemAccount:Administrator!@sip-dev.rruwsdz.mongodb.net/sip?retryWrites=true&w=majority";
const COLLECTION = process.env.COLLECTION ?? "internal_products";
const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? 200);
const DRY_RUN = (process.env.DRY_RUN ?? "false").toLowerCase() === "true";

// Three priority dicts (flat arrays)
const DICT_MATERIALS = process.env.DICT_MATERIALS ?? "C:\\Users\\AAghar01\\Downloads\\material_json.json";   // required if you want materials mapping
const DICT_CONVERTING = process.env.DICT_CONVERTING ?? "C:\\Users\\AAghar01\\Downloads\\converting_process.json"; // required if you want converting mapping
const DICT_FINISHING  = process.env.DICT_FINISHING  ?? "C:\\Users\\AAghar01\\Downloads\\finishing_process.json"; // required if you want finishing mapping

// One master dict (fallback)
const DICT_MASTER = process.env.DICT ??
  "C:\\Users\\AAghar01\\Downloads\\sip.internal_sip_master_data_v2.json";        // optional but recommended
const DICT_COMPONENTS = process.env.DICT_COMPONENTS ?? "C:\\Users\\AAghar01\\Downloads\\component_sub.json";

// ========= MONGOOSE =========
const ProductSchema = new mongoose.Schema({}, { strict: false, collection: COLLECTION });
const Product = mongoose.model("Product", ProductSchema);

// ========= UTILS =========
const isArr = Array.isArray;
const isObj = (v: any): v is Record<string, any> => v !== null && typeof v === "object" && !isArr(v);
const s = (v: any): string => (typeof v === "string" ? v : v == null ? "" : "" + v);
const b = (v: any): boolean => (typeof v === "boolean" ? v : v != null && ("" + v).toLowerCase() === "true");
const n = (v: any): number => { const x = +v; return Number.isFinite(x) ? x : 0; };
const key = (v: any): string => (typeof v === "string" ? v.trim().toLowerCase() : "");
const wrapOid = (maybe: any): { $oid: string } =>
  (isObj(maybe) && typeof (maybe as any).$oid === "string")
    ? (maybe as any)
    : { $oid: typeof maybe === "string" ? maybe : new mongoose.Types.ObjectId().toString() };

const asPctOfWeight = (pctStr: any, weightStr: any): string => {
  const pct = parseFloat(s(pctStr));
  const wt  = parseFloat(s(weightStr));
  if (!Number.isFinite(pct) || !Number.isFinite(wt)) return "0";
  return ((pct / 100) * wt).toFixed(6).replace(/\.?0+$/, "");
};

function loadJsonMaybe(pth: string): any | null {
  if (!pth) return null;
  const full = path.resolve(pth);
  return JSON.parse(readFileSync(full, "utf8"));
}

// ========= LOOKUPS =========
type StrMap = Record<string, string>;
type TypesByMaterial = Record<string, StrMap>;

type PrimaryLookups = {
  materials: StrMap;
  converting: StrMap;
  finishing: StrMap;
};

type MasterLookups = {
  materialName: StrMap;
  typesByMaterial: TypesByMaterial;
  finishingFlat: StrMap;
  convertingGlobal: StrMap;
};

type Lookups = {
  primary: PrimaryLookups;
  master: MasterLookups;
  componentToSub: StrMap; // NEW
};
let LOOKUPS: Lookups | null = null;

function addPair(map: StrMap, spice: any, tru: any) {
  const k = key(spice);
  if (k && typeof tru === "string") map[k] = tru;
}
function absorbFlat(map: StrMap, arr: any) {
  if (!isArr(arr)) return;
  for (const it of arr) addPair(map, it?.spice_name, it?.tru_name);
}

function buildLookups(): Lookups {
  const primary: PrimaryLookups = {
    materials: Object.create(null),
    converting: Object.create(null),
    finishing: Object.create(null),
  };
  const master: MasterLookups = {
    materialName: Object.create(null),
    typesByMaterial: Object.create(null),
    finishingFlat: Object.create(null),
    convertingGlobal: Object.create(null),
  };
  const componentToSub: StrMap = Object.create(null);

  // Primary dicts
  absorbFlat(primary.materials,  loadJsonMaybe(DICT_MATERIALS));
  absorbFlat(primary.converting, loadJsonMaybe(DICT_CONVERTING));
  absorbFlat(primary.finishing,  loadJsonMaybe(DICT_FINISHING));

  // Master dict (nested)
  const masterJson = loadJsonMaybe(DICT_MASTER);
  const pkg = masterJson?.[0]?.packaging ?? {};
  if (isArr(pkg.materials)) {
    for (const m of pkg.materials) {
      if (m?.name) addPair(master.materialName, m.name.spice_name, m.name.tru_name);
      const matKey = key(m?.name?.spice_name);
      if (matKey && isArr(m?.type)) {
        const bucket: StrMap = (master.typesByMaterial[matKey] ||= Object.create(null));
        for (const t of m.type) addPair(bucket, t?.spice_name, t?.tru_name);
      }
    }
  }
  absorbFlat(master.finishingFlat,    pkg.finishing_process);
  absorbFlat(master.convertingGlobal, pkg.convertingProcess);

  // NEW: Component → Subcomponent dict (flat array with fields: componentType, Subcomponent)
  const compRows = loadJsonMaybe(DICT_COMPONENTS);
  if (isArr(compRows)) {
    for (const row of compRows) {
      const ck = key(row?.componentType);
      const sub = s(row?.Subcomponent);
      if (ck && sub) componentToSub[ck] = sub;
    }
  }

  console.log(
    `🔎 Dict sizes → primary: materials=${Object.keys(primary.materials).length}, converting=${Object.keys(primary.converting).length}, finishing=${Object.keys(primary.finishing).length} | master: names=${Object.keys(master.materialName).length}, typeBuckets=${Object.keys(master.typesByMaterial).length}, finishing=${Object.keys(master.finishingFlat).length}, converting=${Object.keys(master.convertingGlobal).length} | componentMap=${Object.keys(componentToSub).length}`
  );

  return { primary, master, componentToSub };
}

// ========= MAPPERS (priority: primary → master → SPICE) =========
function mapFinishing(target: any) {
  if (!LOOKUPS || !isObj(target)) return;
  const raw = s(target.finishing_process);
  const k = key(raw);
  if (k && LOOKUPS.primary.finishing[k])      { target.finishing_process = LOOKUPS.primary.finishing[k]; return; }
  if (k && LOOKUPS.master.finishingFlat[k])   { target.finishing_process = LOOKUPS.master.finishingFlat[k]; return; }
  target.finishing_process = raw;
}

function mapMaterial(m: any) {
  if (!LOOKUPS || !isObj(m)) return;

  const spiceName = s(m.material_name);
  const spiceType = s(m.material_type);
  const spiceConv = s(m.converting_process);

  const nameK = key(spiceName);
  const typeK = key(spiceType);
  const convK = key(spiceConv);

  // material_name
  if (nameK && LOOKUPS.primary.materials[nameK]) {
    m.material_name = LOOKUPS.primary.materials[nameK];
  } else if (nameK && LOOKUPS.master.materialName[nameK]) {
    m.material_name = LOOKUPS.master.materialName[nameK];
  } else {
    m.material_name = spiceName;
  }

  // material_type (prefer master per-material bucket; else keep SPICE)
  const bucket = nameK ? LOOKUPS.master.typesByMaterial[nameK] : null;
  if (bucket && typeK && bucket[typeK]) m.material_type = bucket[typeK];
  else m.material_type = spiceType;

  // converting_process (bucket → primary converting → master converting → SPICE)
  if (bucket && convK && bucket[convK])             m.converting_process = bucket[convK];
  else if (convK && LOOKUPS.primary.converting[convK]) m.converting_process = LOOKUPS.primary.converting[convK];
  else if (convK && LOOKUPS.master.convertingGlobal[convK]) m.converting_process = LOOKUPS.master.convertingGlobal[convK];
  else m.converting_process = spiceConv;
}

// ========= TARGET SHAPE HELPERS =========
function defaultLevel(name: string) {
  return {
    packaging_level: name,
    isrecyclable: false,
    recyclability_status: "N/A",
    productEvaluation: 0,
    isManualEdit: false,
    components: [] as any[],
    _id: wrapOid(null),
  };
}

function ensureComponentBase(c: any): void {
  c.pc_nm = s(c.pc_nm);
  c.description = s(c.description);
  c.component_type = s(c.component_type);
  c.weight = s(c.weight);
  c.opacifier = s(c.opacifier);
  c.recyclability_status = s(c.recyclability_status);
  c.stage = s(c.stage);
  c.state = s(c.state);
  c.template = s(c.template);
  c.isDataComplete = b(c.isDataComplete);
  c.isEdited = b(c.isEdited);
  c.isCalculated = b(c.isCalculated);
  c._id = wrapOid(c._id);
}

// If already in target structure (and no legacy fields), skip
function looksStructuredAssessment(container: any): boolean {
  const levels: any[] = isArr(container?.packaging_level)
    ? container.packaging_level
    : isArr(container) ? container : [];
  if (!levels.length) return true;

  for (const lvl of levels) {
    if (!isObj(lvl)) return false;
    if (!isArr(lvl.components)) return false;
    for (const comp of lvl.components) {
      if (!isObj(comp)) return false;
      if (!isArr(comp.sub_components) || comp.sub_components.length === 0) return false;
      if ("opacity" in comp || "color" in comp || "finishing_process" in comp || "material" in comp) return false;
    }
  }
  return true;
}

// === NEW === helper to pick subcomponent display name for a component_type
function subNameForComponent(componentType: string): string {
  const raw = s(componentType);
  const k = key(raw);
  if (!LOOKUPS) return raw;
  return LOOKUPS.componentToSub[k] ?? raw; // fallback: same as component_type
}

/** Restructure + map */
function restructureComponent(c: any) {
  if (!isObj(c)) return;
  ensureComponentBase(c);

  // Decide subcomponent name from dict (fallback to component_type)
  const resolvedSubName = subNameForComponent(c.component_type);

  if (!isArr(c.sub_components) || c.sub_components.length === 0) {
    c.sub_components = [{
      name: resolvedSubName,
      opacity: s(c.opacity),
      color: s(c.color),
      finishing_process: s(c.finishing_process),
      material: isArr(c.material) ? c.material : [],
      _id: wrapOid(null),
    }];
  }

  for (const sc of c.sub_components) {
    if (!isObj(sc)) continue;
    sc.name = resolvedSubName;                 // authoritative
    sc.opacity = s(sc.opacity);
    sc.color = s(sc.color);
    sc.finishing_process = s(sc.finishing_process);
    sc._id = wrapOid(sc._id);

    mapFinishing(sc);

    if (!isArr(sc.material)) sc.material = [];
    for (const mat of sc.material) {
      if (!isObj(mat)) continue;
      mat.material_name       = s(mat.material_name);
      mat.material_type       = s(mat.material_type).includes("PCR")?"PCR - Mechanical":s(mat.material_type);;
      mat.converting_process  = s(mat.converting_process);
      mat.layer               = "N/A";
      mat.material_pct        = asPctOfWeight(mat.material_pct, c.weight);
      mat.productEnvironmentalFootPrint = s(mat.productEnvironmentalFootPrint);
      mat.carbonFootPrint     = s(mat.carbonFootPrint);
      mat.virginPlasticValue  = s(mat.virginPlasticValue);
      mat._id = wrapOid(mat._id);
      mapMaterial(mat);
    }
  }

  // remove legacy fields
  delete (c as any).opacity;
  delete (c as any).color;
  delete (c as any).finishing_process;
  delete (c as any).material;
}

function normalizePackaging(container: any): any[] {
  const levels: any[] = isArr(container?.packaging_level)
    ? container.packaging_level
    : isArr(container) ? container : [];

  const order: Record<string, number> = { Primary: 1, Secondary: 2, Tertiary: 3 };
  let lastRank = -1, needSort = false;

  for (let i = 0; i < levels.length; i++) {
    let lvl = levels[i];
    if (isArr(lvl) && lvl.length === 0) lvl = levels[i] = defaultLevel(i === 0 ? "Primary" : "Secondary");
    else if (!isObj(lvl))               lvl = levels[i] = defaultLevel(i === 0 ? "Primary" : "Secondary");

    lvl.packaging_level      = s(lvl.packaging_level) || (i === 0 ? "Primary" : "Secondary");
    lvl.isrecyclable         = b(lvl.isrecyclable);
    lvl.recyclability_status = s(lvl.recyclability_status);
    lvl.productEvaluation    = n(lvl.productEvaluation);
    if (typeof lvl.isManualEdit !== "boolean") lvl.isManualEdit = false;
    lvl._id = wrapOid(lvl._id);

    if (!isArr(lvl.components)) lvl.components = [];
    for (const comp of lvl.components) restructureComponent(comp);

    const rank = order[lvl.packaging_level] ?? 99;
    if (rank < lastRank) needSort = true; else lastRank = rank;
  }

  if (needSort && levels.length > 1) {
    levels.sort((a, b) => (order[a.packaging_level] ?? 99) - (order[b.packaging_level] ?? 99));
  }
  return levels;
}

function transformAssessments(doc: any): void {
  if (!isObj(doc) || !isObj(doc.assessments)) return;
  const a = doc.assessments;

  if (isObj(a.baseline) && !looksStructuredAssessment(a.baseline))
    a.baseline.packaging_level = normalizePackaging(a.baseline);

  if (isObj(a.final) && !looksStructuredAssessment(a.final))
    a.final.packaging_level = normalizePackaging(a.final);

  if (isArr(a.experimental)) {
    for (const ex of a.experimental) {
      if (isObj(ex) && !looksStructuredAssessment(ex))
        ex.packaging_level = normalizePackaging(ex);
    }
  }
}

// ========= RUN =========
async function main() {
  LOOKUPS = buildLookups();

  await mongoose.connect(MONGO_URI, { maxPoolSize: 20 });
  console.log("✅ Connected");

  const filter = FILTER_JSON ? JSON.parse(FILTER_JSON) : { assessments: { $exists: true } };
  const cursor = Product.collection.find(filter, { projection: { assessments: 1 } }).batchSize(1000);

  let ops: any[] = [];
  let scanned = 0, updated = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next(); if (!doc) break;
    scanned++;

    const before = JSON.stringify(doc.assessments);
    transformAssessments(doc);
    const after = JSON.stringify(doc.assessments);

    if (before !== after) {
      updated++;
      if (!DRY_RUN) {
        ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: { assessments: doc.assessments } } } });
        if (ops.length >= BATCH_SIZE) {
          await Product.collection.bulkWrite(ops, { ordered: false });
          ops = [];
        }
      }
    }
  }

  if (!DRY_RUN && ops.length) await Product.collection.bulkWrite(ops, { ordered: false });

  console.log(`📊 Scanned: ${scanned} | Updated: ${updated} | DryRun: ${DRY_RUN}`);
  await mongoose.disconnect();
  console.log("✅ Done");
}

main().catch((err) => { console.error("❌ Migration failed:", err); process.exit(1); });