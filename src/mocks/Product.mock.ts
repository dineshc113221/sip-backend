import { Types } from "mongoose";

export const ProductMock = [
  {
    "_id": {
      "$oid": "66e13e3359d7edf2a177e0fa"
    },
    "productSipId": "SIP_JJB_0000003",
    "productName": "Testing packing",
    "brandName": "Johnsons Baby",
    "projectId": "",
    "projectName": "",
    "description": "",
    "shortBrandCode": "JJB",
    "isDeleted": false,
    "users": [
      {
        "name": "Poonam",
        "role": "Member",
        "mail": "PKadam04@kenvue.com"
      },
      {
        "name": "Choudhary, Dinesh [Non-Kenvue]",
        "role": "Owner",
        "mail": "ashar018@kenvue.com"
      }
    ],
    "createdAt": {
      "$date": "2024-09-11T06:52:35.099Z"
    },
    "updatedAt": {
      "$date": "2024-09-24T10:23:04.130Z"
    },
    "__v": 0,
    "assessments": {
      "experimental": [
        {
          "assessmentId": "SIP_CDL_0000070_002_EXP",
          "name": "Testing_w/o",
          "isFormulationDataCompleted": true,
          "isPackagingDataCompleted": false,
          "fg_spec": "",
          "formula_number": "",
          "lab_notebook_code": "",
          "pc_spec": "",
          "sku_erp_code": "",
          "zone": "",
          "net_content": "",
          "formulation": {
            "fmlCode": "",
            "description": "OGX Coconut Miracle Oil Conditioner (K19-222) (GC) - KDC-L",
            "netContent": "12",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.3 Face Care - UV Protect",
            "productSubSegment": "2.3.1 Sunscreen",
            "useDose": "0.3",
            "consumablesUsed": "0",
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "DI Water, USP - For Vogue only",
                "rawMaterialId": "RAW92645481",
                "percentage": "100",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc5"
                }
              },
              {
                "tradeName": "Salcare SC 96- For Vogue Only",
                "rawMaterialId": "RAW92634541",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc6"
                }
              },
              {
                "tradeName": "Incroquat Behenyl TMC-85-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92635361",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc7"
                }
              },
              {
                "tradeName": "BTAC P7580KC",
                "rawMaterialId": "RAW92649465",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc8"
                }
              },
              {
                "tradeName": "Microcare Quat BHQ - For vogue only",
                "rawMaterialId": "RAW92654210",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc9"
                }
              },
              {
                "tradeName": "SP BRIJ S20-MBAL-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92637541",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dca"
                }
              },
              {
                "tradeName": "SP CRODACOL C95 MBAL-PA-(MH)- For Vogue  Only",
                "rawMaterialId": "RAW92636601",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dcb"
                }
              },
              {
                "tradeName": "CO-1695 Flaked Cetyl Alcohol NF-For Vogue only",
                "rawMaterialId": "RAW92647661",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dcc"
                }
              },
              {
                "tradeName": "Crodacol CS50-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92640481",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dcd"
                }
              },
              {
                "tradeName": "Vegarol 1618 (50:50)- For Vogue only",
                "rawMaterialId": "RAW92635802",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dce"
                }
              },
              {
                "tradeName": "Moon OU Kosher Glycerin, USP/FCC- For Vogue Only",
                "rawMaterialId": "RAW92636461",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dcf"
                }
              },
              {
                "tradeName": "Emery 917 Glycerine 99.7% USP, Kosher- For Vogeu Only",
                "rawMaterialId": "RAW92634438",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd0"
                }
              },
              {
                "tradeName": "DOWSIL 2-8566 Amino Fluid- For Vogue Only",
                "rawMaterialId": "RAW92634121",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd1"
                }
              },
              {
                "tradeName": "Merquat 2001 Polymer",
                "rawMaterialId": "RAW92636021",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd2"
                }
              },
              {
                "tradeName": "SP Crodamol STS MBAL-LQ-(MH) (formerly known as Crodamol STS-LQ-(MH))- For Vogue Only",
                "rawMaterialId": "RAW92635422",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd3"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd4"
                }
              },
              {
                "tradeName": "Citric Acid Anhyd FG USP FCC- For Vogue Only",
                "rawMaterialId": "RAW92634261",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd5"
                }
              },
              {
                "tradeName": "Sodium Hydroxide Pellets NF / FCC- For Vogue Only",
                "rawMaterialId": "RAW92636561",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd6"
                }
              },
              {
                "tradeName": "Versene NA Chelating Agent- For Vogue Only",
                "rawMaterialId": "RAW92636521",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd7"
                }
              },
              {
                "tradeName": "Coconut Miracle Oil Rev 2 2018040993 - For Vogue only",
                "rawMaterialId": "RAW92635062",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd8"
                }
              },
              {
                "tradeName": "ABS Tiare Gardenia Flower Extract OS (For OGX)",
                "rawMaterialId": "RAW92634391",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd9"
                }
              },
              {
                "tradeName": "Actiphyte of Vanilla GL- For Vogue Only",
                "rawMaterialId": "RAW92638182",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dda"
                }
              }
            ],
            "_id": {
              "$oid": "66f126e1b1b31d209f9310fe"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66ebc21904e56ce06106fe7b"
          },
          "createdAt": {
            "$date": "2024-09-19T06:18:01.574Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T08:29:21.028Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_002_EXP",
          "name": "w/o",
          "isFormulationDataCompleted": true,
          "isPackagingDataCompleted": false,
          "fg_spec": "",
          "formula_number": "",
          "lab_notebook_code": "",
          "pc_spec": "",
          "sku_erp_code": "",
          "zone": "",
          "net_content": "",
          "formulation": {
            "fmlCode": "",
            "description": "OGX Coconut Miracle Oil Conditioner (K19-222) (GC) - KDC-L",
            "netContent": "1",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.1 Face Care - Clean & Remove",
            "productSubSegment": "2.1.1 Face rinse-off products, neither pump or spray, containing water",
            "useDose": "0.6",
            "consumablesUsed": "2",
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Deionized Water, USP - For Vogue only",
                "rawMaterialId": "RAW92645481",
                "percentage": "100",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311bb"
                }
              },
              {
                "tradeName": "Salcare SC 96- For Vogue Only",
                "rawMaterialId": "RAW92634541",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311bc"
                }
              },
              {
                "tradeName": "Incroquat Behenyl TMC-85-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92635361",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311bd"
                }
              },
              {
                "tradeName": "BTAC P7580KC",
                "rawMaterialId": "RAW92649465",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311be"
                }
              },
              {
                "tradeName": "Microcare Quat BHQ - For vogue only",
                "rawMaterialId": "RAW92654210",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311bf"
                }
              },
              {
                "tradeName": "SP BRIJ S20-MBAL-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92637541",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c0"
                }
              },
              {
                "tradeName": "SP CRODACOL C95 MBAL-PA-(MH)- For Vogue  Only",
                "rawMaterialId": "RAW92636601",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c1"
                }
              },
              {
                "tradeName": "CO-1695 Flaked Cetyl Alcohol NF-For Vogue only",
                "rawMaterialId": "RAW92647661",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c2"
                }
              },
              {
                "tradeName": "SP CRODACOL CS50 MBAL-PA-(MH) - For Vogue Only",
                "rawMaterialId": "RAW92640481",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c3"
                }
              },
              {
                "tradeName": "Vegarol 1618 (50:50)- For Vogue only",
                "rawMaterialId": "RAW92635802",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c4"
                }
              },
              {
                "tradeName": "Glycerine, 99.7% USP/FCC- For Vogue Only",
                "rawMaterialId": "RAW92634486",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c5"
                }
              },
              {
                "tradeName": "GLYCERINE 99.7% USP KOSHER - for vogue",
                "rawMaterialId": "RAW92634482",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c6"
                }
              },
              {
                "tradeName": "DOWSIL 2-8566 Amino Fluid- For Vogue Only",
                "rawMaterialId": "RAW92634121",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c7"
                }
              },
              {
                "tradeName": "Merquat 2001 Polymer - for Vogue only",
                "rawMaterialId": "RAW92636021",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c8"
                }
              },
              {
                "tradeName": "SP Crodamol STS MBAL-LQ-(MH) (formerly known as Crodamol STS-LQ-(MH))- For Vogue Only",
                "rawMaterialId": "RAW92635422",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c9"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311ca"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous Fine F6000- For Vogue Only",
                "rawMaterialId": "RAW92634302",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311cb"
                }
              },
              {
                "tradeName": "Citric Acid 50%- For vogue only",
                "rawMaterialId": "RAW92634402",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311cc"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous-For Vogue only",
                "rawMaterialId": "RAW92634508",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311cd"
                }
              },
              {
                "tradeName": "Sodium Hydroxide Pellets NF / FCC- For Vogue Only",
                "rawMaterialId": "RAW92636561",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311ce"
                }
              },
              {
                "tradeName": "Sodium Hydroxide Pellets NF/FCC-For Vogue only",
                "rawMaterialId": "RAW92634641",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311cf"
                }
              },
              {
                "tradeName": "Versene NA Chelating Agent- For Vogue Only",
                "rawMaterialId": "RAW92636521",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311d0"
                }
              },
              {
                "tradeName": "Coconut Miracle Oil Rev 2 2018040993 - For Vogue only",
                "rawMaterialId": "RAW92635062",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311d1"
                }
              },
              {
                "tradeName": "ABS Tiare Gardenia Flower Extract OS (For OGX)",
                "rawMaterialId": "RAW92634391",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311d2"
                }
              },
              {
                "tradeName": "Actiphyte of Vanilla GL- For Vogue Only",
                "rawMaterialId": "RAW92638182",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311d3"
                }
              }
            ],
            "_id": {
              "$oid": "66f17f85d572e316734fe11d"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66ebd81204e56ce06107034d"
          },
          "createdAt": {
            "$date": "2024-09-19T07:51:46.949Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T14:47:33.883Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_004_EXP",
          "name": "Testing",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "TV-SPEC-10001-3",
          "formula_number": "FML2057662A-001",
          "lab_notebook_code": "1-30051-V027&V028-01",
          "pc_spec": "TV-SPEC-08583, TV-SPEC-54397",
          "sku_erp_code": "TV-SPEC-08583, TV-SPEC-54397",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "FML2057662A-001",
            "description": "Aveeno Almond Oil Blend Shampoo",
            "netContent": null,
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "",
            "productSubSegment": "",
            "useDose": "",
            "consumablesUsed": "",
            "isDataComplete": false,
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "DI Water, USP - For Vogue only",
                "rawMaterialId": "RAW92645481",
                "percentage": "3.7093",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f966c"
                }
              },
              {
                "tradeName": "Sodium Citrate Dihydrate USP/FCC Granular",
                "rawMaterialId": "RAW92634962",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f966d"
                }
              },
              {
                "tradeName": "Sodium Citrate - For vogue only",
                "rawMaterialId": "RAW92659784",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f966e"
                }
              },
              {
                "tradeName": "Trisodium Citrate Dihydrate TSC F6000- For Vogue Only",
                "rawMaterialId": "RAW92636642",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f966f"
                }
              },
              {
                "tradeName": "Sodium Citrate FCC/USP Fine Gran",
                "rawMaterialId": "RAW90019031",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9670"
                }
              },
              {
                "tradeName": "Merquat 280 NP Polymer",
                "rawMaterialId": "RAW92634642",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9671"
                }
              },
              {
                "tradeName": "Hexylene Glycol -For Vogue only",
                "rawMaterialId": "RAW92635143",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9672"
                }
              },
              {
                "tradeName": "Carbopol Ultrez 20 copolymer-For Vogue only",
                "rawMaterialId": "RAW92635021",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9673"
                }
              },
              {
                "tradeName": "Caustic Soda 50%-For Vogue only",
                "rawMaterialId": "RAW92637266",
                "percentage": "0.05",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9674"
                }
              },
              {
                "tradeName": "Structure PS-111-For Vogue only",
                "rawMaterialId": "RAW92636881",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9675"
                }
              },
              {
                "tradeName": "ARLASILK EFA-LQ-(AP)",
                "rawMaterialId": "RAW92634502",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9676"
                }
              },
              {
                "tradeName": "Silsense A-21 Silicone -For Vogue only",
                "rawMaterialId": "RAW92636381",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9677"
                }
              },
              {
                "tradeName": "Rita Avocado Oil-For Vogue only",
                "rawMaterialId": "RAW92637827",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9678"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous Fine F6000- For Vogue Only",
                "rawMaterialId": "RAW92634302",
                "percentage": "0.9",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9679"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous-For Vogue only",
                "rawMaterialId": "RAW92634508",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967a"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967b"
                }
              },
              {
                "tradeName": "Euperlan PK  3000 AM-For Vogue only",
                "rawMaterialId": "RAW92636481",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967c"
                }
              },
              {
                "tradeName": "SP Versathix MBAL-LQ-(MH)-For Vogue only",
                "rawMaterialId": "RAW92635721",
                "percentage": "0.99",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967d"
                }
              },
              {
                "tradeName": "Merquat 3940 polymer- For vogue only",
                "rawMaterialId": "RAW92635401",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967e"
                }
              },
              {
                "tradeName": "TEGO BETAIN F 50- For Vogue only",
                "rawMaterialId": "RAW92635661",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967f"
                }
              },
              {
                "tradeName": "Dehyton® PK 45 - For Vogue only",
                "rawMaterialId": "RAW92637261",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9680"
                }
              },
              {
                "tradeName": "SensaFoam™ F 50-For Vogue only",
                "rawMaterialId": "RAW92678701",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9681"
                }
              },
              {
                "tradeName": "Rita Sweet Almond Oil- \"For Vogue Only\"",
                "rawMaterialId": "RAW92638087",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9682"
                }
              },
              {
                "tradeName": "Nourishing Egg White Almond T11019845 - For vogue only",
                "rawMaterialId": "RAW92637863",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9683"
                }
              },
              {
                "tradeName": "Bio-Terge AS 40 HP- For vogue Only",
                "rawMaterialId": "RAW92634727",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9684"
                }
              }
            ],
            "_id": {
              "$oid": "66f139c2bd2a00075e0f966b"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f139c2bd2a00075e0f966a"
          },
          "createdAt": {
            "$date": "2024-09-23T09:49:54.981Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T09:49:54.981Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_006_EXP",
          "name": "Exp_w/o",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "",
          "formula_number": "",
          "lab_notebook_code": "",
          "pc_spec": "",
          "sku_erp_code": "",
          "zone": "",
          "net_content": "",
          "formulation": {
            "fmlCode": "",
            "description": "",
            "netContent": "",
            "productionZone": "",
            "salesZone": "",
            "productSegment": "",
            "productSubSegment": "",
            "useDose": "",
            "consumablesUsed": "",
            "isDataComplete": false,
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              ""
            ],
            "_id": {
              "$oid": "66f13e625e3e7dba06af2d2a"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f13e625e3e7dba06af2d29"
          },
          "createdAt": {
            "$date": "2024-09-23T10:09:38.036Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T10:09:38.036Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_007_EXP",
          "name": "Testing2",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "TV-SPEC-09998-3",
          "formula_number": "FML2057932A-001",
          "lab_notebook_code": "2-30042-V027&V028-01",
          "pc_spec": "TV-SPEC-07501, TV-SPEC-54397",
          "sku_erp_code": "TV-SPEC-07501, TV-SPEC-54397",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "",
            "description": "Colloidal Oat Extract- For Vogue only",
            "netContent": "123",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.4 Face Care - Boost",
            "productSubSegment": "2.4.1 Cleansing boosters/treatment",
            "useDose": "0.8",
            "consumablesUsed": "1",
            "isEdited": true,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Colloidal Oat Flour- For Vogue Only",
                "rawMaterialId": "RAW92635141",
                "percentage": "100",
                "_id": {
                  "$oid": "66f14384d4511f683fc0e2bc"
                }
              },
              {
                "tradeName": "DI Water, USP - For Vogue only",
                "rawMaterialId": "RAW92645481",
                "percentage": "",
                "_id": {
                  "$oid": "66f14384d4511f683fc0e2bd"
                }
              }
            ],
            "_id": {
              "$oid": "66f149eb597ba8269f9c5a41"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f14384d4511f683fc0e2ba"
          },
          "createdAt": {
            "$date": "2024-09-23T10:31:32.752Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T10:58:51.713Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_007_EXP",
          "name": "New_Testing",
          "isFormulationDataCompleted": true,
          "isPackagingDataCompleted": false,
          "fg_spec": "TV-SPEC-10001-3",
          "formula_number": "FML2057662A-001",
          "lab_notebook_code": "1-30051-V027&V028-01",
          "pc_spec": "TV-SPEC-08583, TV-SPEC-54397",
          "sku_erp_code": "TV-SPEC-08583, TV-SPEC-54397",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "",
            "description": "Aveeno Almond Oil Blend Shampoo",
            "netContent": "12",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.3 Face Care - UV Protect",
            "productSubSegment": "2.3.1 Sunscreen",
            "useDose": "0.3",
            "consumablesUsed": "1",
            "isEdited": true,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Sodium Citrate Dihydrate USP/FCC Granular",
                "rawMaterialId": "RAW92634962",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2b"
                }
              },
              {
                "tradeName": "Sodium Citrate - For vogue only",
                "rawMaterialId": "RAW92659784",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2c"
                }
              },
              {
                "tradeName": "Trisodium Citrate Dihydrate TSC F6000- For Vogue Only",
                "rawMaterialId": "RAW92636642",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2d"
                }
              },
              {
                "tradeName": "Sodium Citrate FCC/USP Fine Gran",
                "rawMaterialId": "RAW90019031",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2e"
                }
              },
              {
                "tradeName": "Merquat 280 NP Polymer",
                "rawMaterialId": "RAW92634642",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2f"
                }
              },
              {
                "tradeName": "Hexylene Glycol -For Vogue only",
                "rawMaterialId": "RAW92635143",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b30"
                }
              },
              {
                "tradeName": "Carbopol Ultrez 20 copolymer-For Vogue only",
                "rawMaterialId": "RAW92635021",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b31"
                }
              },
              {
                "tradeName": "Structure PS-111-For Vogue only",
                "rawMaterialId": "RAW92636881",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b33"
                }
              },
              {
                "tradeName": "ARLASILK EFA-LQ-(AP)",
                "rawMaterialId": "RAW92634502",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b34"
                }
              },
              {
                "tradeName": "Silsense A-21 Silicone -For Vogue only",
                "rawMaterialId": "RAW92636381",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b35"
                }
              },
              {
                "tradeName": "Rita Avocado Oil-For Vogue only",
                "rawMaterialId": "RAW92637827",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b36"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous-For Vogue only",
                "rawMaterialId": "RAW92634508",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b38"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b39"
                }
              },
              {
                "tradeName": "Euperlan PK  3000 AM-For Vogue only",
                "rawMaterialId": "RAW92636481",
                "percentage": "100",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3a"
                }
              },
              {
                "tradeName": "Merquat 3940 polymer- For vogue only",
                "rawMaterialId": "RAW92635401",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3c"
                }
              },
              {
                "tradeName": "TEGO BETAIN F 50- For Vogue only",
                "rawMaterialId": "RAW92635661",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3d"
                }
              },
              {
                "tradeName": "Dehyton® PK 45 - For Vogue only",
                "rawMaterialId": "RAW92637261",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3e"
                }
              },
              {
                "tradeName": "SensaFoam™ F 50-For Vogue only",
                "rawMaterialId": "RAW92678701",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3f"
                }
              },
              {
                "tradeName": "Rita Sweet Almond Oil- \"For Vogue Only\"",
                "rawMaterialId": "RAW92638087",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b40"
                }
              },
              {
                "tradeName": "Nourishing Egg White Almond T11019845 - For vogue only",
                "rawMaterialId": "RAW92637863",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b41"
                }
              },
              {
                "tradeName": "Bio-Terge AS 40 HP- For vogue Only",
                "rawMaterialId": "RAW92634727",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b42"
                }
              }
            ],
            "_id": {
              "$oid": "66f14b17d572e316734fdac5"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f14a1f597ba8269f9c5b28"
          },
          "createdAt": {
            "$date": "2024-09-23T10:59:43.936Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T11:03:51.206Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_008_EXP",
          "name": "Exp_w/o",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "",
          "formula_number": "",
          "lab_notebook_code": "",
          "pc_spec": "",
          "sku_erp_code": "",
          "zone": "",
          "net_content": "",
          "formulation": {
            "fmlCode": "",
            "description": "",
            "netContent": "",
            "productionZone": "",
            "salesZone": "",
            "productSegment": "",
            "productSubSegment": "",
            "useDose": "",
            "consumablesUsed": "",
            "isDataComplete": false,
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              ""
            ],
            "_id": {
              "$oid": "66f14b6e8958881836763e21"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f14b6e8958881836763e20"
          },
          "createdAt": {
            "$date": "2024-09-23T11:05:18.092Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T11:05:18.092Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_009_EXP",
          "name": "Testing_2",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "TV-SPEC-10001-3",
          "formula_number": "FML2057662A-001",
          "lab_notebook_code": "1-30051-V027&V028-01",
          "pc_spec": "TV-SPEC-08583, TV-SPEC-54397",
          "sku_erp_code": "TV-SPEC-08583, TV-SPEC-54397",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "",
            "description": "Aveeno Almond Oil Blend Shampoo",
            "netContent": "1",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.3 Face Care - UV Protect",
            "productSubSegment": "2.3.1 Sunscreen",
            "useDose": "0.3",
            "consumablesUsed": "1",
            "isEdited": true,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Sodium Citrate Dihydrate USP/FCC Granular",
                "rawMaterialId": "RAW92634962",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa5ff"
                }
              },
              {
                "tradeName": "Sodium Citrate - For vogue only",
                "rawMaterialId": "RAW92659784",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa600"
                }
              },
              {
                "tradeName": "Trisodium Citrate Dihydrate TSC F6000- For Vogue Only",
                "rawMaterialId": "RAW92636642",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa601"
                }
              },
              {
                "tradeName": "Sodium Citrate FCC/USP Fine Gran",
                "rawMaterialId": "RAW90019031",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa602"
                }
              },
              {
                "tradeName": "Merquat 280 NP Polymer",
                "rawMaterialId": "RAW92634642",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa603"
                }
              },
              {
                "tradeName": "Hexylene Glycol -For Vogue only",
                "rawMaterialId": "RAW92635143",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa604"
                }
              },
              {
                "tradeName": "Carbopol Ultrez 20 copolymer-For Vogue only",
                "rawMaterialId": "RAW92635021",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa605"
                }
              },
              {
                "tradeName": "Structure PS-111-For Vogue only",
                "rawMaterialId": "RAW92636881",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa607"
                }
              },
              {
                "tradeName": "ARLASILK EFA-LQ-(AP)",
                "rawMaterialId": "RAW92634502",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa608"
                }
              },
              {
                "tradeName": "Silsense A-21 Silicone -For Vogue only",
                "rawMaterialId": "RAW92636381",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa609"
                }
              },
              {
                "tradeName": "Rita Avocado Oil-For Vogue only",
                "rawMaterialId": "RAW92637827",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa60a"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous-For Vogue only",
                "rawMaterialId": "RAW92634508",
                "percentage": "100",
                "_id": {
                  "$oid": "66f157db6075d93427bfa60c"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa60d"
                }
              },
              {
                "tradeName": "Euperlan PK  3000 AM-For Vogue only",
                "rawMaterialId": "RAW92636481",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa60e"
                }
              },
              {
                "tradeName": "Merquat 3940 polymer- For vogue only",
                "rawMaterialId": "RAW92635401",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa610"
                }
              },
              {
                "tradeName": "TEGO BETAIN F 50- For Vogue only",
                "rawMaterialId": "RAW92635661",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa611"
                }
              },
              {
                "tradeName": "Dehyton® PK 45 - For Vogue only",
                "rawMaterialId": "RAW92637261",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa612"
                }
              },
              {
                "tradeName": "SensaFoam™ F 50-For Vogue only",
                "rawMaterialId": "RAW92678701",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa613"
                }
              },
              {
                "tradeName": "Rita Sweet Almond Oil- \"For Vogue Only\"",
                "rawMaterialId": "RAW92638087",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa614"
                }
              },
              {
                "tradeName": "Nourishing Egg White Almond T11019845 - For vogue only",
                "rawMaterialId": "RAW92637863",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa615"
                }
              },
              {
                "tradeName": "Bio-Terge AS 40 HP- For vogue Only",
                "rawMaterialId": "RAW92634727",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa616"
                }
              }
            ],
            "_id": {
              "$oid": "66f15dc56075d93427bfafdd"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f157db6075d93427bfa5fc"
          },
          "createdAt": {
            "$date": "2024-09-23T11:58:19.190Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T12:23:33.229Z"
          },
          "packaging_level": []
        }
      ],
      "baseline": {
        "assessmentId": "66f2930877a89aa14b990958",
        "name": "test",
        "isFormulationDataCompleted": false,
        "isPackagingDataCompleted": false,
        "fg_spec": "FG-0024947-3",
        "fg_revision": "2173901",
        "sales_country": "India",
        "production_country": "India",
        "formula_number": "TAB2299983A-002",
        "lab_notebook_code": "JJI-CA-044-01",
        "pc_spec": "PC-0006331",
        "sku_erp_code": "PC-0006331",
        "productSegment": "",
        "productSubSegment": "",
        "useDose": "",
        "consumablesUsed": "",
        "zone": "North America",
        "rawMaterials": [
          {
            "tradeName": "Nicotine- For Self Care Use Only",
            "rawMaterialId": "RAW92656921",
            "percentage": "39.86014",
            "_id": {
              "$oid": "66f2930877a89aa14b99095a"
            }
          },
          {
            "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
            "rawMaterialId": "RAW92670185",
            "percentage": "60.13986",
            "_id": {
              "$oid": "66f2930877a89aa14b99095b"
            }
          }
        ],
        "net_content": "",
        "netContentUnit": "20",
        "formulation": {
          "fmlCode": "TAB2299983A-002",
          "description": "Nicotine Transdermal Patch (21mg)",
          "netContent": "20",
          "netContentUnit": "g",
          "productionZone": "Canada",
          "salesZone": "Canada",
          "productSegment": "",
          "productSubSegment": "",
          "useDose": "2",
          "consumablesUsed": "",
          "consumableUse": "10",
          "isDataComplete": false,
          "isEdited": false,
          "isCalculating": false,
          "rawMaterialsPercentage": 100,
          "rawMaterials": [
            {
              "tradeName": "Nicotine- For Self Care Use Only",
              "rawMaterialId": "RAW92656921",
              "percentage": "39.86014",
              "_id": {
                "$oid": "66f2930877a89aa14b99095a"
              }
            },
            {
              "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
              "rawMaterialId": "RAW92670185",
              "percentage": "60.13986",
              "_id": {
                "$oid": "66f2930877a89aa14b99095b"
              }
            }
          ],
          "_id": {
            "$oid": "66f2930877a89aa14b990959"
          }
        },
        "users": [
          {
            "name": "Poonam",
            "role": "Member",
            "mail": "PKadam04@kenvue.com"
          },
          {
            "name": "Choudhary, Dinesh [Non-Kenvue]",
            "role": "Owner",
            "mail": "DChoud02@kenvue.com"
          }
        ],
        "createdBy": "Dinesh",
        "modifiedBy": "",
        "_id": new Types.ObjectId("66f2930877a89aa14b990958"),
        "createdAt": {
          "$date": "2024-09-24T10:23:04.130Z"
        },
        "updatedAt": {
          "$date": "2024-09-24T10:23:04.130Z"
        },
        "packaging_level": [
          {
            "packaging_level": "Primary",
            "isrecyclable": true,
            "isCalculating": false,
            "recyclability_status": "Recycle Ready",
            "productEvaluation": 0,
            "components": [
              {
                "pc_nm": "",
                "description": "VOGUE - PC Specification for Maui Moisture Bottle 13 fl oz 400 ml Kasbah PET 38 mm Locking Finish",
                "color": "Gold",
                "recyclability_status": "Recycle Ready",
                "isrecyclable": true,
                "opacity": "Clear",
                "component_type": "Bottle",
                "weight": "39.0",
                "opacifier": "transplant",
                "stage": "Commercial",
                "state": "Effective",
                "template": "Bottles/ Jars",
                "finishing_process": "Lacquering",
                "isDataComplete": false,
                "isEdited": true,
                "material": [
                  {
                    "material_name": "Unknown",
                    "material_type": "PCR",
                    "converting_process": "Injection moulding",
                    "material_pct": null,
                    "productEnvironmentalFootPrint": "0",
                    "carbonFootPrint": "0",
                    "virginPlasticValue": "0",
                    "_id": {
                      "$oid": "66f186796075d93427bfbbe9"
                    }
                  }
                ],
                "_id": {
                  "$oid": "66f186796075d93427bfbbe8"
                }
              },
            ]
          },
          {
            "packaging_level": "Primary",
            "isrecyclable": true,
            "isCalculating": false,
            "recyclability_status": "N/A",
            "productEvaluation": 0,
            "components": []
          },
          {
            "packaging_level": "Secondary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "N/A",
            "productEvaluation": 0,
            "components": [
              {
                "pc_nm": "",
                "description": "VOGUE - PC Specification for Maui Moisture Bottle 13 fl oz 400 ml Kasbah PET 38 mm Locking Finish",
                "color": "Gold",
                "recyclability_status": "Recycle Ready",
                "isrecyclable": true,
                "opacity": "Clear",
                "component_type": "Bottle",
                "weight": "39.0",
                "opacifier": "transplant",
                "stage": "Commercial",
                "state": "Effective",
                "template": "Bottles/ Jars",
                "finishing_process": "Lacquering",
                "isDataComplete": false,
                "isEdited": true,
                "material": [
                  {
                    "material_name": "Unknown",
                    "material_type": "PCR",
                    "converting_process": "Injection moulding",
                    "material_pct": null,
                    "productEnvironmentalFootPrint": "0",
                    "carbonFootPrint": "0",
                    "virginPlasticValue": "0",
                    "_id": {
                      "$oid": "66f186796075d93427bfbbe9"
                    }
                  }
                ],
                "_id": {
                  "$oid": "66f186796075d93427bfbbe8"
                }
              }
            ]
          }
        ]
      },
      "final": {
        "assessmentId": "SIP_ACV_0000098_003_FIN",
        "name": "TEST FINAL",
        "isFormulationDataCompleted": false,
        "isPackagingDataCompleted": true,
        "fg_spec": "FG-0024947-3",
        "formula_number": "TAB2299983A-002",
        "lab_notebook_code": "JJI-CA-044-01",
        "pc_spec": "PC-0006331",
        "sku_erp_code": "PC-0006331",
        "zone": "North America",
        "net_content": "",
        "formulation": {
          "fmlCode": "TAB2299983A-002",
          "description": "Nicotine Transdermal Patch (21mg)",
          "netContent": "10",
          "netContentUnit": "g",
          "productionZone": "Canada",
          "salesZone": "Canada",
          "productSegment": "2.2 Face Care - Moisturize & Treat",
          "productSubSegment": "2.2.1 All spot treatment (which don't belong to L2 Boost)",
          "useDose": "0.199",
          "consumablesUsed": "0",
          "isEdited": true,
          "isCalculating": false,
          "rawMaterials": [
            {
              "tradeName": "Nicotine- For Self Care Use Only",
              "rawMaterialId": "RAW92656921",
              "percentage": "39.86014",
              "_id": {
                "$oid": "66f18f846075d93427bfc0b8"
              }
            },
            {
              "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
              "rawMaterialId": "RAW92670185",
              "percentage": "60.13986",
              "_id": {
                "$oid": "66f18f846075d93427bfc0b9"
              }
            }
          ],
          "_id": {
            "$oid": "66f18fa26075d93427bfc0d4"
          }
        },
        "createdBy": "Bhagya",
        "modifiedBy": "",
        "_id": {
          "$oid": "66f18f846075d93427bfc0b6"
        },
        "createdAt": {
          "$date": "2024-09-23T15:55:48.099Z"
        },
        "updatedAt": {
          "$date": "2024-09-23T15:57:04.399Z"
        },
        "packaging_level": [
          {
            "packaging_level": "Primary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "Non Recycle Ready",
            "productEvaluation": 0,
            "components": [
              {
                "pc_nm": "TV-SPEC-54397",
                "description": "VOGUE-Packaging Component Spec Cap 54mmx34mm Purity Oval Snap, 22mm Snap, plug seal & Frost Finish",
                "color": "Gold",
                "recyclability_status": "",
                "opacity": "Opaque",
                "component_type": "Closure",
                "weight": "10",
                "opacifier": "transplant",
                "stage": "Commercial",
                "state": "Effective",
                "template": "Closure",
                "finishing_process": "Electroplating, 3 deposited layers, metal substrate",
                "isDataComplete": true,
                "isEdited": true,
                "material": [
                  {
                    "material_name": "Unknown",
                    "material_type": "PCR",
                    "converting_process": "Injection moulding",
                    "material_pct": "100",
                    "productEnvironmentalFootPrint": "0",
                    "carbonFootPrint": "0",
                    "virginPlasticValue": "0",
                    "_id": {
                      "$oid": "66f18fd06075d93427bfc102"
                    }
                  }
                ],
                "_id": {
                  "$oid": "66f18fd06075d93427bfc101"
                }
              }
            ]
          },
          {
            "packaging_level": "Secondary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "N/A",
            "productEvaluation": 0,
            "components": []
          }
        ]
      }
    }
  },
  {
    "_id": {
      "$oid": "66ebc1b204e56ce06106fe3a"
    },
    "productSipId": "SIP_CDL_0000070",
    "productName": "Testing_formulation",
    "brandName": "Caladryl",
    "projectId": "",
    "projectName": "",
    "description": "",
    "shortBrandCode": "CDL",
    "isDeleted": false,
    "users": [
      {
        "name": "Naveen Kumar",
        "role": "Owner",
        "mail": "NTanga01@kenvue.com"
      }
    ],
    "createdAt": {
      "$date": "2024-09-19T06:16:18.233Z"
    },
    "updatedAt": {
      "$date": "2024-09-23T15:49:14.718Z"
    },
    "__v": 0,
    "assessments": {
      "experimental": [
        {
          "assessmentId": "SIP_CDL_0000070_002_EXP",
          "name": "Testing_w/o",
          "isFormulationDataCompleted": true,
          "isPackagingDataCompleted": false,
          "fg_spec": "",
          "formula_number": "",
          "lab_notebook_code": "",
          "pc_spec": "",
          "sku_erp_code": "",
          "zone": "",
          "net_content": "",
          "formulation": {
            "fmlCode": "",
            "description": "OGX Coconut Miracle Oil Conditioner (K19-222) (GC) - KDC-L",
            "netContent": "12",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.3 Face Care - UV Protect",
            "productSubSegment": "2.3.1 Sunscreen",
            "useDose": "0.3",
            "consumablesUsed": "0",
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "DI Water, USP - For Vogue only",
                "rawMaterialId": "RAW92645481",
                "percentage": "100",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc5"
                }
              },
              {
                "tradeName": "Salcare SC 96- For Vogue Only",
                "rawMaterialId": "RAW92634541",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc6"
                }
              },
              {
                "tradeName": "Incroquat Behenyl TMC-85-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92635361",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc7"
                }
              },
              {
                "tradeName": "BTAC P7580KC",
                "rawMaterialId": "RAW92649465",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc8"
                }
              },
              {
                "tradeName": "Microcare Quat BHQ - For vogue only",
                "rawMaterialId": "RAW92654210",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dc9"
                }
              },
              {
                "tradeName": "SP BRIJ S20-MBAL-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92637541",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dca"
                }
              },
              {
                "tradeName": "SP CRODACOL C95 MBAL-PA-(MH)- For Vogue  Only",
                "rawMaterialId": "RAW92636601",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dcb"
                }
              },
              {
                "tradeName": "CO-1695 Flaked Cetyl Alcohol NF-For Vogue only",
                "rawMaterialId": "RAW92647661",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dcc"
                }
              },
              {
                "tradeName": "Crodacol CS50-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92640481",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dcd"
                }
              },
              {
                "tradeName": "Vegarol 1618 (50:50)- For Vogue only",
                "rawMaterialId": "RAW92635802",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dce"
                }
              },
              {
                "tradeName": "Moon OU Kosher Glycerin, USP/FCC- For Vogue Only",
                "rawMaterialId": "RAW92636461",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dcf"
                }
              },
              {
                "tradeName": "Emery 917 Glycerine 99.7% USP, Kosher- For Vogeu Only",
                "rawMaterialId": "RAW92634438",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd0"
                }
              },
              {
                "tradeName": "DOWSIL 2-8566 Amino Fluid- For Vogue Only",
                "rawMaterialId": "RAW92634121",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd1"
                }
              },
              {
                "tradeName": "Merquat 2001 Polymer",
                "rawMaterialId": "RAW92636021",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd2"
                }
              },
              {
                "tradeName": "SP Crodamol STS MBAL-LQ-(MH) (formerly known as Crodamol STS-LQ-(MH))- For Vogue Only",
                "rawMaterialId": "RAW92635422",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd3"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd4"
                }
              },
              {
                "tradeName": "Citric Acid Anhyd FG USP FCC- For Vogue Only",
                "rawMaterialId": "RAW92634261",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd5"
                }
              },
              {
                "tradeName": "Sodium Hydroxide Pellets NF / FCC- For Vogue Only",
                "rawMaterialId": "RAW92636561",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd6"
                }
              },
              {
                "tradeName": "Versene NA Chelating Agent- For Vogue Only",
                "rawMaterialId": "RAW92636521",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd7"
                }
              },
              {
                "tradeName": "Coconut Miracle Oil Rev 2 2018040993 - For Vogue only",
                "rawMaterialId": "RAW92635062",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd8"
                }
              },
              {
                "tradeName": "ABS Tiare Gardenia Flower Extract OS (For OGX)",
                "rawMaterialId": "RAW92634391",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dd9"
                }
              },
              {
                "tradeName": "Actiphyte of Vanilla GL- For Vogue Only",
                "rawMaterialId": "RAW92638182",
                "percentage": "",
                "_id": {
                  "$oid": "66f11d246075d93427bf8dda"
                }
              }
            ],
            "_id": {
              "$oid": "66f126e1b1b31d209f9310fe"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66ebc21904e56ce06106fe7b"
          },
          "createdAt": {
            "$date": "2024-09-19T06:18:01.574Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T08:29:21.028Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_002_EXP",
          "name": "w/o",
          "isFormulationDataCompleted": true,
          "isPackagingDataCompleted": false,
          "fg_spec": "",
          "formula_number": "",
          "lab_notebook_code": "",
          "pc_spec": "",
          "sku_erp_code": "",
          "zone": "",
          "net_content": "",
          "formulation": {
            "fmlCode": "",
            "description": "OGX Coconut Miracle Oil Conditioner (K19-222) (GC) - KDC-L",
            "netContent": "1",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.1 Face Care - Clean & Remove",
            "productSubSegment": "2.1.1 Face rinse-off products, neither pump or spray, containing water",
            "useDose": "0.6",
            "consumablesUsed": "2",
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Deionized Water, USP - For Vogue only",
                "rawMaterialId": "RAW92645481",
                "percentage": "100",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311bb"
                }
              },
              {
                "tradeName": "Salcare SC 96- For Vogue Only",
                "rawMaterialId": "RAW92634541",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311bc"
                }
              },
              {
                "tradeName": "Incroquat Behenyl TMC-85-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92635361",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311bd"
                }
              },
              {
                "tradeName": "BTAC P7580KC",
                "rawMaterialId": "RAW92649465",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311be"
                }
              },
              {
                "tradeName": "Microcare Quat BHQ - For vogue only",
                "rawMaterialId": "RAW92654210",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311bf"
                }
              },
              {
                "tradeName": "SP BRIJ S20-MBAL-PA-(MH)- For Vogue Only",
                "rawMaterialId": "RAW92637541",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c0"
                }
              },
              {
                "tradeName": "SP CRODACOL C95 MBAL-PA-(MH)- For Vogue  Only",
                "rawMaterialId": "RAW92636601",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c1"
                }
              },
              {
                "tradeName": "CO-1695 Flaked Cetyl Alcohol NF-For Vogue only",
                "rawMaterialId": "RAW92647661",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c2"
                }
              },
              {
                "tradeName": "SP CRODACOL CS50 MBAL-PA-(MH) - For Vogue Only",
                "rawMaterialId": "RAW92640481",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c3"
                }
              },
              {
                "tradeName": "Vegarol 1618 (50:50)- For Vogue only",
                "rawMaterialId": "RAW92635802",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c4"
                }
              },
              {
                "tradeName": "Glycerine, 99.7% USP/FCC- For Vogue Only",
                "rawMaterialId": "RAW92634486",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c5"
                }
              },
              {
                "tradeName": "GLYCERINE 99.7% USP KOSHER - for vogue",
                "rawMaterialId": "RAW92634482",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c6"
                }
              },
              {
                "tradeName": "DOWSIL 2-8566 Amino Fluid- For Vogue Only",
                "rawMaterialId": "RAW92634121",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c7"
                }
              },
              {
                "tradeName": "Merquat 2001 Polymer - for Vogue only",
                "rawMaterialId": "RAW92636021",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c8"
                }
              },
              {
                "tradeName": "SP Crodamol STS MBAL-LQ-(MH) (formerly known as Crodamol STS-LQ-(MH))- For Vogue Only",
                "rawMaterialId": "RAW92635422",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311c9"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311ca"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous Fine F6000- For Vogue Only",
                "rawMaterialId": "RAW92634302",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311cb"
                }
              },
              {
                "tradeName": "Citric Acid 50%- For vogue only",
                "rawMaterialId": "RAW92634402",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311cc"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous-For Vogue only",
                "rawMaterialId": "RAW92634508",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311cd"
                }
              },
              {
                "tradeName": "Sodium Hydroxide Pellets NF / FCC- For Vogue Only",
                "rawMaterialId": "RAW92636561",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311ce"
                }
              },
              {
                "tradeName": "Sodium Hydroxide Pellets NF/FCC-For Vogue only",
                "rawMaterialId": "RAW92634641",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311cf"
                }
              },
              {
                "tradeName": "Versene NA Chelating Agent- For Vogue Only",
                "rawMaterialId": "RAW92636521",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311d0"
                }
              },
              {
                "tradeName": "Coconut Miracle Oil Rev 2 2018040993 - For Vogue only",
                "rawMaterialId": "RAW92635062",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311d1"
                }
              },
              {
                "tradeName": "ABS Tiare Gardenia Flower Extract OS (For OGX)",
                "rawMaterialId": "RAW92634391",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311d2"
                }
              },
              {
                "tradeName": "Actiphyte of Vanilla GL- For Vogue Only",
                "rawMaterialId": "RAW92638182",
                "percentage": "",
                "_id": {
                  "$oid": "66f12731b1b31d209f9311d3"
                }
              }
            ],
            "_id": {
              "$oid": "66f17f85d572e316734fe11d"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66ebd81204e56ce06107034d"
          },
          "createdAt": {
            "$date": "2024-09-19T07:51:46.949Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T14:47:33.883Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_004_EXP",
          "name": "Testing",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "TV-SPEC-10001-3",
          "formula_number": "FML2057662A-001",
          "lab_notebook_code": "1-30051-V027&V028-01",
          "pc_spec": "TV-SPEC-08583, TV-SPEC-54397",
          "sku_erp_code": "TV-SPEC-08583, TV-SPEC-54397",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "FML2057662A-001",
            "description": "Aveeno Almond Oil Blend Shampoo",
            "netContent": null,
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "",
            "productSubSegment": "",
            "useDose": "",
            "consumablesUsed": "",
            "isDataComplete": false,
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "DI Water, USP - For Vogue only",
                "rawMaterialId": "RAW92645481",
                "percentage": "3.7093",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f966c"
                }
              },
              {
                "tradeName": "Sodium Citrate Dihydrate USP/FCC Granular",
                "rawMaterialId": "RAW92634962",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f966d"
                }
              },
              {
                "tradeName": "Sodium Citrate - For vogue only",
                "rawMaterialId": "RAW92659784",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f966e"
                }
              },
              {
                "tradeName": "Trisodium Citrate Dihydrate TSC F6000- For Vogue Only",
                "rawMaterialId": "RAW92636642",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f966f"
                }
              },
              {
                "tradeName": "Sodium Citrate FCC/USP Fine Gran",
                "rawMaterialId": "RAW90019031",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9670"
                }
              },
              {
                "tradeName": "Merquat 280 NP Polymer",
                "rawMaterialId": "RAW92634642",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9671"
                }
              },
              {
                "tradeName": "Hexylene Glycol -For Vogue only",
                "rawMaterialId": "RAW92635143",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9672"
                }
              },
              {
                "tradeName": "Carbopol Ultrez 20 copolymer-For Vogue only",
                "rawMaterialId": "RAW92635021",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9673"
                }
              },
              {
                "tradeName": "Caustic Soda 50%-For Vogue only",
                "rawMaterialId": "RAW92637266",
                "percentage": "0.05",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9674"
                }
              },
              {
                "tradeName": "Structure PS-111-For Vogue only",
                "rawMaterialId": "RAW92636881",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9675"
                }
              },
              {
                "tradeName": "ARLASILK EFA-LQ-(AP)",
                "rawMaterialId": "RAW92634502",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9676"
                }
              },
              {
                "tradeName": "Silsense A-21 Silicone -For Vogue only",
                "rawMaterialId": "RAW92636381",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9677"
                }
              },
              {
                "tradeName": "Rita Avocado Oil-For Vogue only",
                "rawMaterialId": "RAW92637827",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9678"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous Fine F6000- For Vogue Only",
                "rawMaterialId": "RAW92634302",
                "percentage": "0.9",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9679"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous-For Vogue only",
                "rawMaterialId": "RAW92634508",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967a"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967b"
                }
              },
              {
                "tradeName": "Euperlan PK  3000 AM-For Vogue only",
                "rawMaterialId": "RAW92636481",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967c"
                }
              },
              {
                "tradeName": "SP Versathix MBAL-LQ-(MH)-For Vogue only",
                "rawMaterialId": "RAW92635721",
                "percentage": "0.99",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967d"
                }
              },
              {
                "tradeName": "Merquat 3940 polymer- For vogue only",
                "rawMaterialId": "RAW92635401",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967e"
                }
              },
              {
                "tradeName": "TEGO BETAIN F 50- For Vogue only",
                "rawMaterialId": "RAW92635661",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f967f"
                }
              },
              {
                "tradeName": "Dehyton® PK 45 - For Vogue only",
                "rawMaterialId": "RAW92637261",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9680"
                }
              },
              {
                "tradeName": "SensaFoam™ F 50-For Vogue only",
                "rawMaterialId": "RAW92678701",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9681"
                }
              },
              {
                "tradeName": "Rita Sweet Almond Oil- \"For Vogue Only\"",
                "rawMaterialId": "RAW92638087",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9682"
                }
              },
              {
                "tradeName": "Nourishing Egg White Almond T11019845 - For vogue only",
                "rawMaterialId": "RAW92637863",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9683"
                }
              },
              {
                "tradeName": "Bio-Terge AS 40 HP- For vogue Only",
                "rawMaterialId": "RAW92634727",
                "percentage": "",
                "_id": {
                  "$oid": "66f139c2bd2a00075e0f9684"
                }
              }
            ],
            "_id": {
              "$oid": "66f139c2bd2a00075e0f966b"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f139c2bd2a00075e0f966a"
          },
          "createdAt": {
            "$date": "2024-09-23T09:49:54.981Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T09:49:54.981Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_006_EXP",
          "name": "Exp_w/o",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "",
          "formula_number": "",
          "lab_notebook_code": "",
          "pc_spec": "",
          "sku_erp_code": "",
          "zone": "",
          "net_content": "",
          "formulation": {
            "fmlCode": "",
            "description": "",
            "netContent": "",
            "productionZone": "",
            "salesZone": "",
            "productSegment": "",
            "productSubSegment": "",
            "useDose": "",
            "consumablesUsed": "",
            "isDataComplete": false,
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              ""
            ],
            "_id": {
              "$oid": "66f13e625e3e7dba06af2d2a"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f13e625e3e7dba06af2d29"
          },
          "createdAt": {
            "$date": "2024-09-23T10:09:38.036Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T10:09:38.036Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_007_EXP",
          "name": "Testing2",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "TV-SPEC-09998-3",
          "formula_number": "FML2057932A-001",
          "lab_notebook_code": "2-30042-V027&V028-01",
          "pc_spec": "TV-SPEC-07501, TV-SPEC-54397",
          "sku_erp_code": "TV-SPEC-07501, TV-SPEC-54397",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "",
            "description": "Colloidal Oat Extract- For Vogue only",
            "netContent": "123",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.4 Face Care - Boost",
            "productSubSegment": "2.4.1 Cleansing boosters/treatment",
            "useDose": "0.8",
            "consumablesUsed": "1",
            "isEdited": true,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Colloidal Oat Flour- For Vogue Only",
                "rawMaterialId": "RAW92635141",
                "percentage": "100",
                "_id": {
                  "$oid": "66f14384d4511f683fc0e2bc"
                }
              },
              {
                "tradeName": "DI Water, USP - For Vogue only",
                "rawMaterialId": "RAW92645481",
                "percentage": "",
                "_id": {
                  "$oid": "66f14384d4511f683fc0e2bd"
                }
              }
            ],
            "_id": {
              "$oid": "66f149eb597ba8269f9c5a41"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f14384d4511f683fc0e2ba"
          },
          "createdAt": {
            "$date": "2024-09-23T10:31:32.752Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T10:58:51.713Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_007_EXP",
          "name": "New_Testing",
          "isFormulationDataCompleted": true,
          "isPackagingDataCompleted": false,
          "fg_spec": "TV-SPEC-10001-3",
          "formula_number": "FML2057662A-001",
          "lab_notebook_code": "1-30051-V027&V028-01",
          "pc_spec": "TV-SPEC-08583, TV-SPEC-54397",
          "sku_erp_code": "TV-SPEC-08583, TV-SPEC-54397",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "",
            "description": "Aveeno Almond Oil Blend Shampoo",
            "netContent": "12",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.3 Face Care - UV Protect",
            "productSubSegment": "2.3.1 Sunscreen",
            "useDose": "0.3",
            "consumablesUsed": "1",
            "isEdited": true,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Sodium Citrate Dihydrate USP/FCC Granular",
                "rawMaterialId": "RAW92634962",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2b"
                }
              },
              {
                "tradeName": "Sodium Citrate - For vogue only",
                "rawMaterialId": "RAW92659784",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2c"
                }
              },
              {
                "tradeName": "Trisodium Citrate Dihydrate TSC F6000- For Vogue Only",
                "rawMaterialId": "RAW92636642",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2d"
                }
              },
              {
                "tradeName": "Sodium Citrate FCC/USP Fine Gran",
                "rawMaterialId": "RAW90019031",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2e"
                }
              },
              {
                "tradeName": "Merquat 280 NP Polymer",
                "rawMaterialId": "RAW92634642",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b2f"
                }
              },
              {
                "tradeName": "Hexylene Glycol -For Vogue only",
                "rawMaterialId": "RAW92635143",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b30"
                }
              },
              {
                "tradeName": "Carbopol Ultrez 20 copolymer-For Vogue only",
                "rawMaterialId": "RAW92635021",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b31"
                }
              },
              {
                "tradeName": "Structure PS-111-For Vogue only",
                "rawMaterialId": "RAW92636881",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b33"
                }
              },
              {
                "tradeName": "ARLASILK EFA-LQ-(AP)",
                "rawMaterialId": "RAW92634502",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b34"
                }
              },
              {
                "tradeName": "Silsense A-21 Silicone -For Vogue only",
                "rawMaterialId": "RAW92636381",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b35"
                }
              },
              {
                "tradeName": "Rita Avocado Oil-For Vogue only",
                "rawMaterialId": "RAW92637827",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b36"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous-For Vogue only",
                "rawMaterialId": "RAW92634508",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b38"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b39"
                }
              },
              {
                "tradeName": "Euperlan PK  3000 AM-For Vogue only",
                "rawMaterialId": "RAW92636481",
                "percentage": "100",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3a"
                }
              },
              {
                "tradeName": "Merquat 3940 polymer- For vogue only",
                "rawMaterialId": "RAW92635401",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3c"
                }
              },
              {
                "tradeName": "TEGO BETAIN F 50- For Vogue only",
                "rawMaterialId": "RAW92635661",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3d"
                }
              },
              {
                "tradeName": "Dehyton® PK 45 - For Vogue only",
                "rawMaterialId": "RAW92637261",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3e"
                }
              },
              {
                "tradeName": "SensaFoam™ F 50-For Vogue only",
                "rawMaterialId": "RAW92678701",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b3f"
                }
              },
              {
                "tradeName": "Rita Sweet Almond Oil- \"For Vogue Only\"",
                "rawMaterialId": "RAW92638087",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b40"
                }
              },
              {
                "tradeName": "Nourishing Egg White Almond T11019845 - For vogue only",
                "rawMaterialId": "RAW92637863",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b41"
                }
              },
              {
                "tradeName": "Bio-Terge AS 40 HP- For vogue Only",
                "rawMaterialId": "RAW92634727",
                "percentage": "",
                "_id": {
                  "$oid": "66f14a1f597ba8269f9c5b42"
                }
              }
            ],
            "_id": {
              "$oid": "66f14b17d572e316734fdac5"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f14a1f597ba8269f9c5b28"
          },
          "createdAt": {
            "$date": "2024-09-23T10:59:43.936Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T11:03:51.206Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_008_EXP",
          "name": "Exp_w/o",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "",
          "formula_number": "",
          "lab_notebook_code": "",
          "pc_spec": "",
          "sku_erp_code": "",
          "zone": "",
          "net_content": "",
          "formulation": {
            "fmlCode": "",
            "description": "",
            "netContent": "",
            "productionZone": "",
            "salesZone": "",
            "productSegment": "",
            "productSubSegment": "",
            "useDose": "",
            "consumablesUsed": "",
            "isDataComplete": false,
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              ""
            ],
            "_id": {
              "$oid": "66f14b6e8958881836763e21"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f14b6e8958881836763e20"
          },
          "createdAt": {
            "$date": "2024-09-23T11:05:18.092Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T11:05:18.092Z"
          },
          "packaging_level": []
        },
        {
          "assessmentId": "SIP_CDL_0000070_009_EXP",
          "name": "Testing_2",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": false,
          "fg_spec": "TV-SPEC-10001-3",
          "formula_number": "FML2057662A-001",
          "lab_notebook_code": "1-30051-V027&V028-01",
          "pc_spec": "TV-SPEC-08583, TV-SPEC-54397",
          "sku_erp_code": "TV-SPEC-08583, TV-SPEC-54397",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "",
            "description": "Aveeno Almond Oil Blend Shampoo",
            "netContent": "1",
            "netContentUnit": "g",
            "productionZone": "United States",
            "salesZone": "United States",
            "productSegment": "2.3 Face Care - UV Protect",
            "productSubSegment": "2.3.1 Sunscreen",
            "useDose": "0.3",
            "consumablesUsed": "1",
            "isEdited": true,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Sodium Citrate Dihydrate USP/FCC Granular",
                "rawMaterialId": "RAW92634962",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa5ff"
                }
              },
              {
                "tradeName": "Sodium Citrate - For vogue only",
                "rawMaterialId": "RAW92659784",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa600"
                }
              },
              {
                "tradeName": "Trisodium Citrate Dihydrate TSC F6000- For Vogue Only",
                "rawMaterialId": "RAW92636642",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa601"
                }
              },
              {
                "tradeName": "Sodium Citrate FCC/USP Fine Gran",
                "rawMaterialId": "RAW90019031",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa602"
                }
              },
              {
                "tradeName": "Merquat 280 NP Polymer",
                "rawMaterialId": "RAW92634642",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa603"
                }
              },
              {
                "tradeName": "Hexylene Glycol -For Vogue only",
                "rawMaterialId": "RAW92635143",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa604"
                }
              },
              {
                "tradeName": "Carbopol Ultrez 20 copolymer-For Vogue only",
                "rawMaterialId": "RAW92635021",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa605"
                }
              },
              {
                "tradeName": "Structure PS-111-For Vogue only",
                "rawMaterialId": "RAW92636881",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa607"
                }
              },
              {
                "tradeName": "ARLASILK EFA-LQ-(AP)",
                "rawMaterialId": "RAW92634502",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa608"
                }
              },
              {
                "tradeName": "Silsense A-21 Silicone -For Vogue only",
                "rawMaterialId": "RAW92636381",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa609"
                }
              },
              {
                "tradeName": "Rita Avocado Oil-For Vogue only",
                "rawMaterialId": "RAW92637827",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa60a"
                }
              },
              {
                "tradeName": "Citric Acid Anhydrous-For Vogue only",
                "rawMaterialId": "RAW92634508",
                "percentage": "100",
                "_id": {
                  "$oid": "66f157db6075d93427bfa60c"
                }
              },
              {
                "tradeName": "Kalama Sodium Benzoate NF/FCC-For vogue only",
                "rawMaterialId": "RAW92636181",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa60d"
                }
              },
              {
                "tradeName": "Euperlan PK  3000 AM-For Vogue only",
                "rawMaterialId": "RAW92636481",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa60e"
                }
              },
              {
                "tradeName": "Merquat 3940 polymer- For vogue only",
                "rawMaterialId": "RAW92635401",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa610"
                }
              },
              {
                "tradeName": "TEGO BETAIN F 50- For Vogue only",
                "rawMaterialId": "RAW92635661",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa611"
                }
              },
              {
                "tradeName": "Dehyton® PK 45 - For Vogue only",
                "rawMaterialId": "RAW92637261",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa612"
                }
              },
              {
                "tradeName": "SensaFoam™ F 50-For Vogue only",
                "rawMaterialId": "RAW92678701",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa613"
                }
              },
              {
                "tradeName": "Rita Sweet Almond Oil- \"For Vogue Only\"",
                "rawMaterialId": "RAW92638087",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa614"
                }
              },
              {
                "tradeName": "Nourishing Egg White Almond T11019845 - For vogue only",
                "rawMaterialId": "RAW92637863",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa615"
                }
              },
              {
                "tradeName": "Bio-Terge AS 40 HP- For vogue Only",
                "rawMaterialId": "RAW92634727",
                "percentage": "",
                "_id": {
                  "$oid": "66f157db6075d93427bfa616"
                }
              }
            ],
            "_id": {
              "$oid": "66f15dc56075d93427bfafdd"
            }
          },
          "createdBy": "Naveen Kumar",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f157db6075d93427bfa5fc"
          },
          "createdAt": {
            "$date": "2024-09-23T11:58:19.190Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T12:23:33.229Z"
          },
          "packaging_level": []
        }
      ],
      "baseline": {
        "assessmentId": "SIP_CDL_0000070_009_BSL",
        "name": "FG-0024947-3",
        "isFormulationDataCompleted": false,
        "isPackagingDataCompleted": false,
        "fg_spec": "FG-0024947-3",
        "formula_number": "TAB2299983A-002",
        "lab_notebook_code": "JJI-CA-044-01",
        "pc_spec": "PC-0006331",
        "sku_erp_code": "PC-0006331",
        "zone": "North America",
        "net_content": "",
        "formulation": {
          "fmlCode": "TAB2299983A-002",
          "description": "Nicotine Transdermal Patch (21mg)",
          "netContent": null,
          "netContentUnit": "g",
          "productionZone": "Canada",
          "salesZone": "Canada",
          "productSegment": "",
          "productSubSegment": "",
          "useDose": "",
          "consumablesUsed": "",
          "isDataComplete": false,
          "isEdited": false,
          "isCalculating": false,
          "rawMaterials": [
            {
              "tradeName": "Nicotine- For Self Care Use Only",
              "rawMaterialId": "RAW92656921",
              "percentage": "",
              "_id": {
                "$oid": "66f18dfad572e316734fe9d5"
              }
            },
            {
              "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
              "rawMaterialId": "RAW92670185",
              "percentage": "",
              "_id": {
                "$oid": "66f18dfad572e316734fe9d6"
              }
            }
          ],
          "_id": {
            "$oid": "66f18dfad572e316734fe9d4"
          }
        },
        "createdBy": "Naveen Kumar",
        "modifiedBy": "",
        "_id": {
          "$oid": "66f18dfad572e316734fe9d3"
        },
        "createdAt": {
          "$date": "2024-09-23T15:49:14.718Z"
        },
        "updatedAt": {
          "$date": "2024-09-23T15:49:14.718Z"
        },
        "packaging_level": [
          {
            "packaging_level": "Primary",
            "isrecyclable": true,
            "isCalculating": false,
            "recyclability_status": "Recycle Ready",
            "productEvaluation": 0,
            "components": [
              {
                "pc_nm": "",
                "description": "VOGUE - PC Specification for Maui Moisture Bottle 13 fl oz 400 ml Kasbah PET 38 mm Locking Finish",
                "color": "Gold",
                "recyclability_status": "Recycle Ready",
                "isrecyclable": true,
                "opacity": "Clear",
                "component_type": "Bottle",
                "weight": "39.0",
                "opacifier": "transplant",
                "stage": "Commercial",
                "state": "Effective",
                "template": "Bottles/ Jars",
                "finishing_process": "Lacquering",
                "isDataComplete": "false",
                "isEdited": true,
                "material": [
                  {
                    "material_name": "Unknown",
                    "material_type": "PCR",
                    "converting_process": "Injection moulding",
                    "material_pct": null,
                    "productEnvironmentalFootPrint": "0",
                    "carbonFootPrint": "0",
                    "virginPlasticValue": "0",
                    "_id": {
                      "$oid": "66f186796075d93427bfbbe9"
                    }
                  }
                ],
                "_id": {
                  "$oid": "66f186796075d93427bfbbe8"
                }
              },
            ]
          },
          {
            "packaging_level": "Primary",
            "isrecyclable": true,
            "isCalculating": false,
            "recyclability_status": "N/A",
            "productEvaluation": 0,
            "components": []
          },
          {
            "packaging_level": "Secondary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "N/A",
            "productEvaluation": 0,
            "components": [
              {
                "pc_nm": "",
                "description": "VOGUE - PC Specification for Maui Moisture Bottle 13 fl oz 400 ml Kasbah PET 38 mm Locking Finish",
                "color": "Gold",
                "recyclability_status": "Recycle Ready",
                "isrecyclable": true,
                "opacity": "Clear",
                "component_type": "Bottle",
                "weight": "39.0",
                "opacifier": "transplant",
                "stage": "Commercial",
                "state": "Effective",
                "template": "Bottles/ Jars",
                "finishing_process": "Lacquering",
                "isDataComplete": false,
                "isEdited": true,
                "material": [
                  {
                    "material_name": "Unknown",
                    "material_type": "PCR",
                    "converting_process": "Injection moulding",
                    "material_pct": null,
                    "productEnvironmentalFootPrint": "0",
                    "carbonFootPrint": "0",
                    "virginPlasticValue": "0",
                    "_id": {
                      "$oid": "66f186796075d93427bfbbe9"
                    }
                  }
                ],
                "_id": {
                  "$oid": "66f186796075d93427bfbbe8"
                }
              }
            ]
          }
        ]
      }
    }
  },
  {
    "_id": {
      "$oid": "66f17d506075d93427bfb4d7"
    },
    "productSipId": "SIP_ACV_0000098",
    "productName": "TEST BHAGYA PRODUCT",
    "brandName": "Acuvue",
    "projectId": "",
    "projectName": "",
    "description": "",
    "shortBrandCode": "ACV",
    "isDeleted": false,
    "users": [
      {
        "name": "Bhagya",
        "role": "Owner",
        "mail": "BAmulu01@kenvue.com"
      }
    ],
    "createdAt": {
      "$date": "2024-09-23T14:38:08.300Z"
    },
    "updatedAt": {
      "$date": "2024-09-23T15:57:04.399Z"
    },
    "__v": 0,
    "assessments": {
      "experimental": [
        {
          "assessmentId": "SIP_ACV_0000098_003_EXP",
          "name": "TEST EXP ASSESSMENT",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": true,
          "fg_spec": "TV-SPEC-09991-3",
          "formula_number": "FML2057743A-001",
          "lab_notebook_code": "1-30001-V027&V028-01",
          "pc_spec": "TV-SPEC-07501, TV-SPEC-54397",
          "sku_erp_code": "TV-SPEC-07501, TV-SPEC-54397",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "",
            "description": "OGX Coconut Miracle Oil Conditioner (K19-222) (GC) - KDC-L",
            "netContent": "1",
            "netContentUnit": "g",
            "productionZone": "United Kingdom",
            "salesZone": "United States",
            "productSegment": "3.1 Body Care - Wash",
            "productSubSegment": "3.1.10 Foam wash - formula with propellant | Hand",
            "useDose": "1.17",
            "consumablesUsed": "0",
            "isEdited": false,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "ABS Tiare Gardenia Flower Extract OS (For OGX)",
                "rawMaterialId": "RAW92634391",
                "percentage": "50",
                "_id": {
                  "$oid": "66f186296075d93427bfba2b"
                }
              },
              {
                "tradeName": "Actiphyte of Vanilla GL- For Vogue Only",
                "rawMaterialId": "RAW92638182",
                "percentage": "50",
                "_id": {
                  "$oid": "66f186296075d93427bfba2c"
                }
              }
            ],
            "_id": {
              "$oid": "66f186516075d93427bfbb73"
            }
          },
          "createdBy": "Bhagya",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f185e16075d93427bfb844"
          },
          "createdAt": {
            "$date": "2024-09-23T15:14:41.982Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T15:17:13.457Z"
          },
          "packaging_level": [
            {
              "packaging_level": "Primary",
              "isrecyclable": true,
              "isCalculating": false,
              "recyclability_status": "Recycle Ready",
              "productEvaluation": 0,
              "components": [
                {
                  "pc_nm": "",
                  "description": "VOGUE - PC Specification for Maui Moisture Bottle 13 fl oz 400 ml Kasbah PET 38 mm Locking Finish",
                  "color": "Gold",
                  "recyclability_status": "Recycle Ready",
                  "opacity": "Clear",
                  "component_type": "Bottle",
                  "weight": "39.0",
                  "opacifier": "transplant",
                  "stage": "Commercial",
                  "state": "Effective",
                  "template": "Bottles/ Jars",
                  "finishing_process": "Lacquering",
                  "isDataComplete": false,
                  "isEdited": true,
                  "material": [
                    {
                      "material_name": "Unknown",
                      "material_type": "PCR",
                      "converting_process": "Injection moulding",
                      "material_pct": null,
                      "productEnvironmentalFootPrint": "0",
                      "carbonFootPrint": "0",
                      "virginPlasticValue": "0",
                      "_id": {
                        "$oid": "66f186796075d93427bfbbe9"
                      }
                    }
                  ],
                  "_id": {
                    "$oid": "66f186796075d93427bfbbe8"
                  }
                }
              ]
            },
            {
              "packaging_level": "Secondary",
              "isrecyclable": false,
              "isCalculating": false,
              "recyclability_status": "N/A",
              "productEvaluation": 0,
              "components": []
            }
          ]
        }
      ],
      "baseline": {},
      "final": {
        "assessmentId": "SIP_ACV_0000098_003_FIN",
        "name": "TEST FINAL",
        "isFormulationDataCompleted": false,
        "isPackagingDataCompleted": true,
        "fg_spec": "FG-0024947-3",
        "formula_number": "TAB2299983A-002",
        "lab_notebook_code": "JJI-CA-044-01",
        "pc_spec": "PC-0006331",
        "sku_erp_code": "PC-0006331",
        "zone": "North America",
        "net_content": "",
        "formulation": {
          "fmlCode": "TAB2299983A-002",
          "description": "Nicotine Transdermal Patch (21mg)",
          "netContent": "10",
          "netContentUnit": "g",
          "productionZone": "Canada",
          "salesZone": "Canada",
          "productSegment": "2.2 Face Care - Moisturize & Treat",
          "productSubSegment": "2.2.1 All spot treatment (which don't belong to L2 Boost)",
          "useDose": "0.199",
          "consumablesUsed": "0",
          "isEdited": true,
          "isCalculating": false,
          "rawMaterials": [
            {
              "tradeName": "Nicotine- For Self Care Use Only",
              "rawMaterialId": "RAW92656921",
              "percentage": "39.86014",
              "_id": {
                "$oid": "66f18f846075d93427bfc0b8"
              }
            },
            {
              "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
              "rawMaterialId": "RAW92670185",
              "percentage": "60.13986",
              "_id": {
                "$oid": "66f18f846075d93427bfc0b9"
              }
            }
          ],
          "_id": {
            "$oid": "66f18fa26075d93427bfc0d4"
          }
        },
        "createdBy": "Bhagya",
        "modifiedBy": "",
        "_id": {
          "$oid": "66f18f846075d93427bfc0b6"
        },
        "createdAt": {
          "$date": "2024-09-23T15:55:48.099Z"
        },
        "updatedAt": {
          "$date": "2024-09-23T15:57:04.399Z"
        },
        "packaging_level": [
          {
            "packaging_level": "Primary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "Non Recycle Ready",
            "productEvaluation": 0,
            "components": [
              {
                "pc_nm": "TV-SPEC-54397",
                "description": "VOGUE-Packaging Component Spec Cap 54mmx34mm Purity Oval Snap, 22mm Snap, plug seal & Frost Finish",
                "color": "Gold",
                "recyclability_status": "",
                "opacity": "Opaque",
                "component_type": "Closure",
                "weight": "10",
                "opacifier": "transplant",
                "stage": "Commercial",
                "state": "Effective",
                "template": "Closure",
                "finishing_process": "Electroplating, 3 deposited layers, metal substrate",
                "isDataComplete": true,
                "isEdited": true,
                "material": [
                  {
                    "material_name": "Unknown",
                    "material_type": "PCR",
                    "converting_process": "Injection moulding",
                    "material_pct": "100",
                    "productEnvironmentalFootPrint": "0",
                    "carbonFootPrint": "0",
                    "virginPlasticValue": "0",
                    "_id": {
                      "$oid": "66f18fd06075d93427bfc102"
                    }
                  }
                ],
                "_id": {
                  "$oid": "66f18fd06075d93427bfc101"
                }
              }
            ]
          },
          {
            "packaging_level": "Secondary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "N/A",
            "productEvaluation": 0,
            "components": []
          }
        ]
      }
    }
  },
  {
    "_id": {
      "$oid": "66f190236075d93427bfc14c"
    },
    "productSipId": "SIP_AVN_0000100",
    "productName": "TEST BHAGYA RAO PRODUCT",
    "brandName": "Aveeno",
    "projectId": "",
    "projectName": "",
    "description": "",
    "shortBrandCode": "AVN",
    "isDeleted": false,
    "users": [
      {
        "name": "Bhagya",
        "role": "Owner",
        "mail": "BAmulu01@kenvue.com"
      }
    ],
    "createdAt": {
      "$date": "2024-09-23T15:58:27.605Z"
    },
    "updatedAt": {
      "$date": "2024-09-23T16:02:38.047Z"
    },
    "__v": 0,
    "assessments": {
      "final": {
        "assessmentId": "SIP_AVN_0000100_002_FIN",
        "name": "TEST FINAL",
        "isFormulationDataCompleted": false,
        "isPackagingDataCompleted": true,
        "fg_spec": "FG-0024947-3",
        "formula_number": "TAB2299983A-002",
        "lab_notebook_code": "JJI-CA-044-01",
        "pc_spec": "PC-0006331",
        "sku_erp_code": "PC-0006331",
        "zone": "North America",
        "net_content": "",
        "formulation": {
          "fmlCode": "TAB2299983A-002",
          "description": "Nicotine Transdermal Patch (21mg)",
          "netContent": "45",
          "netContentUnit": "g",
          "productionZone": "Canada",
          "salesZone": "Canada",
          "productSegment": "3.2 Body Care - Correct Odours",
          "productSubSegment": "3.2.2 Roll on",
          "useDose": "0.75",
          "consumablesUsed": "0",
          "isEdited": true,
          "isCalculating": false,
          "rawMaterials": [
            {
              "tradeName": "Nicotine- For Self Care Use Only",
              "rawMaterialId": "RAW92656921",
              "percentage": "39.86014",
              "_id": {
                "$oid": "66f190916075d93427bfc187"
              }
            },
            {
              "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
              "rawMaterialId": "RAW92670185",
              "percentage": "60.13986",
              "_id": {
                "$oid": "66f190916075d93427bfc188"
              }
            }
          ],
          "_id": {
            "$oid": "66f190a46075d93427bfc19c"
          }
        },
        "createdBy": "Bhagya",
        "modifiedBy": "",
        "_id": {
          "$oid": "66f190916075d93427bfc185"
        },
        "createdAt": {
          "$date": "2024-09-23T16:00:17.334Z"
        },
        "updatedAt": {
          "$date": "2024-09-23T16:01:18.349Z"
        },
        "packaging_level": [
          {
            "packaging_level": "Primary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "Non Recycle Ready",
            "productEvaluation": 0,
            "components": [
              {
                "pc_nm": "TV-SPEC-11756",
                "description": "VOGUE - PC Specification for Maui Moisture 38 mm Flip-Top Closure with Rachet - Gold",
                "color": "Green (PET recyclable)",
                "recyclability_status": "Not Recycle Ready",
                "opacity": "Opaque",
                "component_type": "Closure",
                "weight": "43",
                "opacifier": "transplant",
                "stage": "Commercial",
                "state": "Effective",
                "template": "Closure",
                "finishing_process": "Physical Vapour Deposition - Evaporation, aluminium, pieces",
                "isDataComplete": true,
                "isEdited": true,
                "material": [
                  {
                    "material_name": "Unknown",
                    "material_type": "PIR",
                    "converting_process": "Deep drawing, steel",
                    "material_pct": "100",
                    "productEnvironmentalFootPrint": "0",
                    "carbonFootPrint": "0",
                    "virginPlasticValue": "0",
                    "_id": {
                      "$oid": "66f190ce6075d93427bfc1b2"
                    }
                  }
                ],
                "_id": {
                  "$oid": "66f190ce6075d93427bfc1b1"
                }
              }
            ]
          },
          {
            "packaging_level": "Secondary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "N/A",
            "productEvaluation": 0,
            "components": []
          }
        ]
      },
      "experimental": [
        {
          "assessmentId": "SIP_AVN_0000100_003_EXP",
          "name": "TEST EXPERIMENTAL",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": true,
          "fg_spec": "FG-0024947-3",
          "formula_number": "TAB2299983A-002",
          "lab_notebook_code": "JJI-CA-044-01",
          "pc_spec": "PC-0006331",
          "sku_erp_code": "PC-0006331",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "",
            "description": "Nicotine Transdermal Patch (21mg)",
            "netContent": "13",
            "netContentUnit": "g",
            "productionZone": "Canada",
            "salesZone": "Canada",
            "productSegment": "3.1 Body Care - Wash",
            "productSubSegment": "3.1.8 Liquid/Gel wash | Hand",
            "useDose": "1.17",
            "consumablesUsed": "0",
            "isEdited": true,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Nicotine- For Self Care Use Only",
                "rawMaterialId": "RAW92656921",
                "percentage": "39.86014",
                "_id": {
                  "$oid": "66f190e26075d93427bfc1ce"
                }
              },
              {
                "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
                "rawMaterialId": "RAW92670185",
                "percentage": "60.13986",
                "_id": {
                  "$oid": "66f190e26075d93427bfc1cf"
                }
              }
            ],
            "_id": {
              "$oid": "66f190f76075d93427bfc1ef"
            }
          },
          "createdBy": "Bhagya",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f190e26075d93427bfc1cc"
          },
          "createdAt": {
            "$date": "2024-09-23T16:01:38.917Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T16:02:38.047Z"
          },
          "packaging_level": [
            {
              "packaging_level": "Primary",
              "isrecyclable": false,
              "isCalculating": false,
              "recyclability_status": "Non Recycle Ready",
              "productEvaluation": 0,
              "components": [
                {
                  "pc_nm": "",
                  "description": "VOGUE - Packaging Component Specification for Aveeno 12 fl oz PETG Oval 24mm Snap Bottle",
                  "color": "Green (PET recyclable)",
                  "recyclability_status": "",
                  "opacity": "Clear",
                  "component_type": "Bottle",
                  "weight": "32.5",
                  "opacifier": "transplant",
                  "stage": "Commercial",
                  "state": "Effective",
                  "template": "Bottles/ Jars",
                  "finishing_process": "Electroplating, 3 deposited layers, metal substrate",
                  "isDataComplete": false,
                  "isEdited": true,
                  "material": [
                    {
                      "material_name": "Unknown",
                      "material_type": "PCR",
                      "converting_process": "Blow moulding",
                      "material_pct": "100",
                      "productEnvironmentalFootPrint": "0",
                      "carbonFootPrint": "0",
                      "virginPlasticValue": "0",
                      "_id": {
                        "$oid": "66f1911e6075d93427bfc212"
                      }
                    }
                  ],
                  "_id": {
                    "$oid": "66f1911e6075d93427bfc211"
                  }
                }
              ]
            },
            {
              "packaging_level": "Secondary",
              "isrecyclable": false,
              "isCalculating": false,
              "recyclability_status": "N/A",
              "productEvaluation": 0,
              "components": []
            }
          ]
        }
      ],
      "baseline" : {
        "assessmentId": "SIP_CDL_0000070_009_BSL",
        "name": "FG-0024947-3",
        "isFormulationDataCompleted": false,
        "isPackagingDataCompleted": false,
        "fg_spec": "FG-0024947-3",
        "formula_number": "TAB2299983A-002",
        "lab_notebook_code": "JJI-CA-044-01",
        "pc_spec": "PC-0006331",
        "sku_erp_code": "PC-0006331",
        "zone": "North America",
        "net_content": "",
        "formulation": {
          "fmlCode": "TAB2299983A-002",
          "description": "Nicotine Transdermal Patch (21mg)",
          "netContent": null,
          "netContentUnit": "g",
          "productionZone": "Canada",
          "salesZone": "Canada",
          "productSegment": "",
          "productSubSegment": "",
          "useDose": "",
          "consumablesUsed": "",
          "isDataComplete": false,
          "isEdited": false,
          "isCalculating": false,
          "rawMaterials": [
            {
              "tradeName": "Nicotine- For Self Care Use Only",
              "rawMaterialId": "RAW92656921",
              "percentage": "",
              "_id": {
                "$oid": "66f18dfad572e316734fe9d5"
              }
            },
            {
              "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
              "rawMaterialId": "RAW92670185",
              "percentage": "",
              "_id": {
                "$oid": "66f18dfad572e316734fe9d6"
              }
            }
          ],
          "_id": {
            "$oid": "66f18dfad572e316734fe9d4"
          }
        },
        "createdBy": "Naveen Kumar",
        "modifiedBy": "",
        "_id": {
          "$oid": "66f18dfad572e316734fe9d3"
        },
        "createdAt": {
          "$date": "2024-09-23T15:49:14.718Z"
        },
        "updatedAt": {
          "$date": "2024-09-23T15:49:14.718Z"
        },
        "packaging_level": [
          {
            "packaging_level": "Primary",
            "isrecyclable": true,
            "isCalculating": false,
            "recyclability_status": "Recycle Ready",
            "productEvaluation": 0,
            "components": []
          }
        ]
      }
    }
  },
  {
    "_id": {
      "$oid": "66f190236075d93427bfc14d"
    },
    "productSipId": "SIP_AVN_0000100",
    "productName": "TEST BHAGYA RAO PRODUCT",
    "brandName": "Aveeno",
    "projectId": "",
    "projectName": "",
    "description": "",
    "shortBrandCode": "AVN",
    "isDeleted": false,
    "users": [
      {
        "name": "Bhagya",
        "role": "Owner",
        "mail": "BAmulu01@kenvue.com"
      }
    ],
    "createdAt": {
      "$date": "2024-09-23T15:58:27.605Z"
    },
    "updatedAt": {
      "$date": "2024-09-23T16:02:38.047Z"
    },
    "__v": 0,
    "assessments": {
      "final": {
        "assessmentId": "SIP_AVN_0000100_002_FIN",
        "name": "TEST FINAL",
        "isFormulationDataCompleted": false,
        "isPackagingDataCompleted": true,
        "fg_spec": "FG-0024947-3",
        "formula_number": "TAB2299983A-002",
        "lab_notebook_code": "JJI-CA-044-01",
        "pc_spec": "PC-0006331",
        "sku_erp_code": "PC-0006331",
        "zone": "North America",
        "net_content": "",
        "formulation": {
          "fmlCode": "TAB2299983A-002",
          "description": "Nicotine Transdermal Patch (21mg)",
          "netContent": "45",
          "netContentUnit": "g",
          "productionZone": "Canada",
          "salesZone": "Canada",
          "productSegment": "3.2 Body Care - Correct Odours",
          "productSubSegment": "3.2.2 Roll on",
          "useDose": "0.75",
          "consumablesUsed": "0",
          "isEdited": true,
          "isCalculating": false,
          "rawMaterials": [
            {
              "tradeName": "Nicotine- For Self Care Use Only",
              "rawMaterialId": "RAW92656921",
              "percentage": "39.86014",
              "_id": {
                "$oid": "66f190916075d93427bfc187"
              }
            },
            {
              "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
              "rawMaterialId": "RAW92670185",
              "percentage": "60.13986",
              "_id": {
                "$oid": "66f190916075d93427bfc188"
              }
            }
          ],
          "_id": {
            "$oid": "66f190a46075d93427bfc19c"
          }
        },
        "createdBy": "Bhagya",
        "modifiedBy": "",
        "_id": {
          "$oid": "66f190916075d93427bfc185"
        },
        "createdAt": {
          "$date": "2024-09-23T16:00:17.334Z"
        },
        "updatedAt": {
          "$date": "2024-09-23T16:01:18.349Z"
        },
        "packaging_level": [
          {
            "packaging_level": "Primary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "Non Recycle Ready",
            "productEvaluation": 0,
            "components": [
              {
                "pc_nm": "TV-SPEC-11756",
                "description": "VOGUE - PC Specification for Maui Moisture 38 mm Flip-Top Closure with Rachet - Gold",
                "color": "Green (PET recyclable)",
                "recyclability_status": "Not Recycle Ready",
                "opacity": "Opaque",
                "component_type": "Closure",
                "weight": "43",
                "opacifier": "transplant",
                "stage": "Commercial",
                "state": "Effective",
                "template": "Closure",
                "finishing_process": "Physical Vapour Deposition - Evaporation, aluminium, pieces",
                "isDataComplete": true,
                "isEdited": true,
                "material": [
                  {
                    "material_name": "Unknown",
                    "material_type": "PIR",
                    "converting_process": "Deep drawing, steel",
                    "material_pct": "100",
                    "productEnvironmentalFootPrint": "0",
                    "carbonFootPrint": "0",
                    "virginPlasticValue": "0",
                    "_id": {
                      "$oid": "66f190ce6075d93427bfc1b2"
                    }
                  }
                ],
                "_id": {
                  "$oid": "66f190ce6075d93427bfc1b1"
                }
              }
            ]
          },
          {
            "packaging_level": "Secondary",
            "isrecyclable": false,
            "isCalculating": false,
            "recyclability_status": "N/A",
            "productEvaluation": 0,
            "components": []
          }
        ]
      },
      "experimental": [
        {
          "assessmentId": "SIP_AVN_0000100_003_EXP",
          "name": "TEST EXPERIMENTAL",
          "isFormulationDataCompleted": false,
          "isPackagingDataCompleted": true,
          "fg_spec": "FG-0024947-3",
          "formula_number": "TAB2299983A-002",
          "lab_notebook_code": "JJI-CA-044-01",
          "pc_spec": "PC-0006331",
          "sku_erp_code": "PC-0006331",
          "zone": "North America",
          "net_content": null,
          "formulation": {
            "fmlCode": "",
            "description": "Nicotine Transdermal Patch (21mg)",
            "netContent": "13",
            "netContentUnit": "g",
            "productionZone": "Canada",
            "salesZone": "Canada",
            "productSegment": "3.1 Body Care - Wash",
            "productSubSegment": "3.1.8 Liquid/Gel wash | Hand",
            "useDose": "1.17",
            "consumablesUsed": "0",
            "isEdited": true,
            "isCalculating": false,
            "rawMaterials": [
              {
                "tradeName": "Nicotine- For Self Care Use Only",
                "rawMaterialId": "RAW92656921",
                "percentage": "39.86014",
                "_id": {
                  "$oid": "66f190e26075d93427bfc1ce"
                }
              },
              {
                "tradeName": "ELVAX 40W Ethylene Vinyl Acetate Copolymer- For Self Care Use Only",
                "rawMaterialId": "RAW92670185",
                "percentage": "60.13986",
                "_id": {
                  "$oid": "66f190e26075d93427bfc1cf"
                }
              }
            ],
            "_id": {
              "$oid": "66f190f76075d93427bfc1ef"
            }
          },
          "createdBy": "Bhagya",
          "modifiedBy": "",
          "_id": {
            "$oid": "66f190e26075d93427bfc1cc"
          },
          "createdAt": {
            "$date": "2024-09-23T16:01:38.917Z"
          },
          "updatedAt": {
            "$date": "2024-09-23T16:02:38.047Z"
          },
          "packaging_level": [
            {
              "packaging_level": "Primary",
              "isrecyclable": false,
              "isCalculating": false,
              "recyclability_status": "Non Recycle Ready",
              "productEvaluation": 0,
              "components": [
                {
                  "pc_nm": "",
                  "description": "VOGUE - Packaging Component Specification for Aveeno 12 fl oz PETG Oval 24mm Snap Bottle",
                  "color": "Green (PET recyclable)",
                  "recyclability_status": "",
                  "opacity": "Clear",
                  "component_type": "Bottle",
                  "weight": "32.5",
                  "opacifier": "transplant",
                  "stage": "Commercial",
                  "state": "Effective",
                  "template": "Bottles/ Jars",
                  "finishing_process": "Electroplating, 3 deposited layers, metal substrate",
                  "isDataComplete": false,
                  "isEdited": true,
                  "material": [
                    {
                      "material_name": "Unknown",
                      "material_type": "PCR",
                      "converting_process": "Blow moulding",
                      "material_pct": "100",
                      "productEnvironmentalFootPrint": "0",
                      "carbonFootPrint": "0",
                      "virginPlasticValue": "0",
                      "_id": {
                        "$oid": "66f1911e6075d93427bfc212"
                      }
                    }
                  ],
                  "_id": {
                    "$oid": "66f1911e6075d93427bfc211"
                  }
                }
              ]
            },
            {
              "packaging_level": "Secondary",
              "isrecyclable": false,
              "isCalculating": false,
              "recyclability_status": "N/A",
              "productEvaluation": 0,
              "components": []
            }
          ]
        }
      ]
    }
  }
]