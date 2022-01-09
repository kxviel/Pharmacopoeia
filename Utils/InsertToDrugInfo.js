import { con } from "./db.js";

export const InsertToDrugInfo = (username, ndc, label) => {
  let insert =
    "INSERT INTO `DRUGINFO`(`username`,`DrugName`, `DosageForm`, `OverDosage`, `BrandName`, `AdminRoute`, `PharmacologicalClass`, `LabelerName`, `Description`, `ProductType`, `PediatricUse`, `DrugInteractions`, `Contraindications`, `InfoForPatients`, `GeriatricUse`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  con.query(
    insert,
    [
      username,
      ndc?.data?.results[0]["generic_name"],
      ndc?.data?.results[0]["dosage_form"],
      label?.data?.results[0]["overdosage"],
      ndc?.data?.results[0]["brand_name"],
      ndc?.data?.results[0]["route"],
      ndc?.data?.results[0]["pharm_class"],
      ndc?.data?.results[0]["labeler_name"],
      label?.data?.results[0]["description"],
      ndc?.data?.results[0]["product_type"],
      label?.data?.results[0]["pediatric_use"],
      label?.data?.results[0]["drug_interactions"],
      label?.data?.results[0]["contraindications"],
      label?.data?.results[0]["information_for_patients"],
      label?.data?.results[0]["geriatric_use"],
    ],
    (err, _) => {
      if (err) throw err;
    }
  );
};
