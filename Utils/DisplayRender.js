export const Render = (ndc, label) => {
  return {
    //------------NDC------------//
    DrugName: CapMe(ndc.data.results[0]["generic_name"]) ?? "Data N/A",
    DosageForm: ndc.data.results[0]["dosage_form"] ?? "Data N/A",
    BrandName: CapMe(ndc.data.results[0]["brand_name"]) ?? "Data N/A",
    AdminRoute: ndc.data.results[0]["route"] ?? "Data N/A",
    PharmacologicalClass: ndc.data.results[0]["pharm_class"] ?? "Data N/A",
    LabelerName: ndc.data.results[0]["labeler_name"] ?? "Data N/A",
    ProductType: ndc.data.results[0]["product_type"] ?? "Data N/A",
    //------------Label------------//
    Description: label.data.results[0]["description"] ?? "Data N/A",
    OverDosage: label.data.results[0]["overdosage"] ?? "Data N/A",
    PediatricUse: label.data.results[0]["pediatric_use"] ?? "Data N/A",
    DrugInteractions: label.data.results[0]["drug_interactions"] ?? "Data N/A",
    Contraindications: label.data.results[0]["contraindications"] ?? "Data N/A",
    InfoForPatients:
      label.data.results[0]["information_for_patients"] ?? "Data N/A",
    GeriatricUse: label.data.results[0]["geriatric_use"] ?? "Data N/A",
  };
};
