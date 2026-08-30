import { Collection } from 'mongodb';
 
export const updateFormulaEcoGaiaFlag = async (
  rawMaterialConstituentsCollection: Collection,
  compositions: Array<{ rawMaterialId?: string }>
): Promise<{ flag: boolean; reason: string }> => {
  // Extract all unique raw material IDs from the compositions array (use rawMaterialId)
  const rawMaterialIds = [
    ...new Set(
      compositions
        .map((comp) => comp.rawMaterialId)
        .filter(Boolean)
    ),
  ];
 
  if (rawMaterialIds.length === 0) {
    // No raw materials, set flag to false
    return {
      flag: false,
      reason: 'No raw materials present in formula compositions.',
    };
  }
 
  // Fetch all raw material constituent docs for these IDs (match details.rawMaterialID)
  if (
    !rawMaterialConstituentsCollection || typeof rawMaterialConstituentsCollection.find !== 'function'
  ) {
    console.error('rawMaterialConstituentsCollection is not valid MongoDB collection');
    return {
      flag: false,
      reason: 'rawMaterialConstituentsCollection is not valid MongoDB collection',
    };
  }
 
  let constituentDocs: any[] = [];
  try {
    constituentDocs = await rawMaterialConstituentsCollection
      .find({ 'details.rawMaterialID': { $in: rawMaterialIds } })
      .toArray();
  } catch (err) {
    console.error('Error fetching constituents docs:', err);
    return {
      flag: false,
      reason: 'Error fetching constituents docs: ' + err,
    };
  }
 
  // Collect all constituent reasons from raw materials
  const constituentReasons: string[] = [];
  let allPresent = true;
 
  rawMaterialIds.forEach((id) => {
    const doc = constituentDocs.find(
      (d) => d.details?.rawMaterialID === id
    );
    if (!doc) {
      allPresent = false;
      constituentReasons.push(`Raw material ${id} is missing from the database.`);
    } else {
      if (
        doc.details?.ecosphere_data_present !== true ||
        doc.details?.gaia_data_present !== true
      ) {
        allPresent = false;
      }
      // Only collect non-empty constituent reasons
      if (doc.details?.constituent_gaia_ecosphere_reason) {
        constituentReasons.push(doc.details.constituent_gaia_ecosphere_reason);
      }
    }
  });
 
  let reason = '';
  if (!allPresent && constituentReasons.length > 0) {
    reason = constituentReasons.join(' | ');
  }
  // If allPresent is true, reason remains empty string
 
  return { flag: allPresent, reason };
};
 
 