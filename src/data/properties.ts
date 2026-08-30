export const BOOLEAN_KEYS = ["isDeleted"];
export const PERMISSIONS = {
  OWNER: {
    PAGES: [
      "dashboard",
      "allproduct",
      "productDetails",
      "assessmentDetails",
      "results",
    ],
  },
  MEMBERS: {
    PAGES: [
      "dashboard",
      "allproduct",
      "productDetails",
      "assessmentDetails",
      "results",
    ],
  },
  Member: {
    dashboard: {
      C: 1,
      U: 1,
      D: 0,
    },
  },
};
