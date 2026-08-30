type Rec = Record<string, any>;


export function transformPackaging(input: Rec) {
  return input.packaging_level.map((pkg: Rec) => ({
    ...pkg,
    components: pkg.components.flatMap(
      ({
        sub_components = [],
        component_type: parentType,
        weight: parentWeight,
        _id: parentId,
        ...restParent
      }: Rec) =>
        sub_components.length
          ? sub_components.map((sub: Rec) => {
              const {
                name,
                component_type: subType,
                material = [],
                ...subRest
              } = sub;

              const subWeight = (material as Rec[]).reduce((sum, m) => {
                const v = Number(m.material_pct ?? 0);
                return sum + (isNaN(v) ? 0 : v);
              }, 0);
 
              return {
                ...restParent,                     // parent fields
                ...subRest,                        // sub_component fields
                material,                          // keep full material array
                main_component: parentType,        // parent type
                main_component_weight: parentWeight,
                main_id:String(parentId),
                component_type: name ?? subType ?? parentType,
                weight: subWeight,                 // total material weight
              };
            })
          : [
              {
                ...restParent,
                main_component: parentType,
                main_component_weight: parentWeight,
                main_id:String(parentId),
                component_type: parentType,
                weight: parentWeight,
              },
            ]
    ),
  }));
}

function deepClone<T>(v: T): T {
  if (Array.isArray(v)) return v.map(deepClone) as any;
  if (v && typeof v === "object") {
    const o: any = {};
    for (const k in v as any) o[k] = deepClone((v as any)[k]);
    return o;
  }
  return v;
}
 
export function groupByMainComponentInPlace(rows: Rec[]): Rec[] {
  if (!rows?.length) return [];
 
  const LABEL_MAIN = "main_component";
  const LABEL_TYPE = "component_type";
 
  // handle both naming variants, just in case
  const PCR_AMOUNT_KEYS = [
    "Amount_of_PCR_Materials_per_Component",
  ];
 
  const arrayKeys = new Set<string>();
  for (const r of rows) {
    for (const k of Object.keys(r)) {
      if (Array.isArray(r[k])) arrayKeys.add(k);
    }
  }
 
  const ALWAYS_SUB_KEYS = new Set([
    "opacity",
    "color",
    "colour",
    "finishing_process",
    "weight", // row.weight => subcomponent weight
  ]);
 
  function parentKey(row: Rec): string {
    const main = String(row[LABEL_MAIN] ?? "");
    const parentWeight = row.main_component_weight ?? row.weight ?? "";
    return `${main}::wt=${parentWeight}::id=${row.main_id}`;
  }
 
  const groups: Record<string, Rec[]> = {};
  const order: string[] = [];
 
  for (const row of rows) {
    const key = parentKey(row);
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(row);
  }
 
  const result: Rec[] = [];
 
  for (const key of order) {
    const groupRows = groups[key];
    const first = groupRows[0];
 
    const main = first[LABEL_MAIN];
    // main_component_weight is not the parentWeight for the assignment anymore
    // const parentWeight =
    //   first.main_component_weight ?? first.weight ?? undefined;
 
    const parentPcrAmountKey =
      PCR_AMOUNT_KEYS.find((k) => k in first) ??
      "Amount_of_PCR_Materials_per_Component";
 
    const parent: Rec = {
      [LABEL_MAIN]: main,
      component_type: main,
      sub_components: [] as Rec[],
    };
 
    for (const k of Object.keys(first)) {
      if (k === LABEL_MAIN || k === LABEL_TYPE || k === "fieldsExist") continue;
      if (k === "main_component_weight") continue; // becomes parent.weight
      if (k === "material_efficiency") continue;   // computed at group level
      if (PCR_AMOUNT_KEYS.includes(k)) continue;   // computed at group level
      if (arrayKeys.has(k)) continue;
      if (ALWAYS_SUB_KEYS.has(k)) continue;
      parent[k] = deepClone(first[k]);
    }
 
    // Calculate total weight from subcomponents
    const calculatedTotalWeight = groupRows.reduce((sum, row) => {
      const w = Number(row.weight);      
      return sum + (Number.isNaN(w) ? 0 : w);
    }, 0);    
    parent.weight = calculatedTotalWeight;
 
    // ----- build sub_components -----
    for (const row of groupRows) {
      const sub: Rec = {
        name: row[LABEL_TYPE],
      };
 
      for (const k of Object.keys(row)) {
        if (k === LABEL_MAIN || k === LABEL_TYPE || k === "fieldsExist") continue;
        if (k === "main_component_weight") continue;
        if (k === "material_efficiency") continue;
        if (PCR_AMOUNT_KEYS.includes(k)) continue; // don't keep at sub-level
 
        if (arrayKeys.has(k) || ALWAYS_SUB_KEYS.has(k)) {
          sub[k] = deepClone(row[k]);
        }
      }
 
      (parent.sub_components as Rec[]).push(sub);
    }
 
    // ----- group-level material_efficiency (sum of material[].material_efficiency) -----
    const totalMaterialEfficiency = groupRows.reduce((groupSum, row) => {
      const mats = row.material;
      if (Array.isArray(mats)) {
        const sumForRow = mats.reduce((sum: number, m: Rec) => {
          const v = Number(m.material_efficiency ?? 0);
          return sum + (isNaN(v) ? 0 : v);
        }, 0);
        return groupSum + sumForRow;
      }
 
      const v = Number(row.material_efficiency ?? 0);
      return groupSum + (isNaN(v) ? 0 : v);
    }, 0);
    parent.material_efficiency = totalMaterialEfficiency;
 
    // ----- group-level Amount_of_PCR_Materials_per_Component -----
    const totalPcrAmount = groupRows.reduce((sum, row) => {
      let v = 0;
      for (const keyName of PCR_AMOUNT_KEYS) {
        if (keyName in row) {
          v = Number(row[keyName] ?? 0);
          break;
        }
      }
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
    parent[parentPcrAmountKey] = totalPcrAmount;

    // Recalculate percentage using the corrected parent.weight
    const parentWeightForCalc = Number(parent.weight) || 0;
    const PCR_Percent_Per_Component_2_7 = parentWeightForCalc > 0 
      ? (Number(totalPcrAmount) / parentWeightForCalc) * 100 
      : 0;
      
    parent["PCR_Percent_Per_Component"]=PCR_Percent_Per_Component_2_7
 
    // ----- merge recyclability_disruptors_list_formatted_4_5 -----
    const disruptorSet = new Set<string>();
    for (const row of groupRows) {
      const raw = row.recyclability_disruptors_list_formatted_4_5;
      if (typeof raw === "string") {
        raw.split(",").forEach((part) => {
          const trimmed = part.trim();
          if (trimmed) disruptorSet.add(trimmed);
        });
      }
    }
    if (disruptorSet.size > 0) {
      parent.recyclability_disruptors_list_formatted_4_5 = Array.from(
        disruptorSet
      ).join(", ");
    }
 
    result.push(parent);
  }
 
  return result;
}
 
export function toComponentSubcomponentTreeInPlace<T = any>(root: T): T {
  const stack: any[] = [root];
  while (stack.length) {
    const node = stack.pop();

    if (Array.isArray(node)) {
      // If this array is a flattened components list, group it now
      if (
        node.length &&
        node[0] != null &&
        typeof node[0] === "object" &&
        "main_component" in node[0] &&
        "component_type" in node[0]
      ) {
        const grouped = groupByMainComponentInPlace(node as Rec[]);
        // mutate array reference in parent by replacing contents
        node.length = 0;
        for (let i = 0; i < grouped.length; i++) node.push(grouped[i]);
      } else {
        for (let i = 0; i < node.length; i++) stack.push(node[i]);
      }
      continue;
    }

    if (node && typeof node === "object") {
      // push children (values) to stack
      for (const k in node) stack.push(node[k]);
    }
  }
  return root;
}
