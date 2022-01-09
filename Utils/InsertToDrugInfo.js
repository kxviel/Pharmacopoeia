import { con } from "./db.js";
import { ShortenWord } from "./Shorten.js";

export const InsertToDrugInfo = (username, ndc, label) => {
  let insert =
    "INSERT INTO `DRUGINFO`(`username`,`DrugName`, `DosageForm`, `OverDosage`, `BrandName`, `AdminRoute`, `PharmacologicalClass`, `LabelerName`, `Description`, `ProductType`, `PediatricUse`, `DrugInteractions`, `Contraindications`, `InfoForPatients`, `GeriatricUse`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  con.query(
    insert,
    [
      username,
      ShortenWord(ndc?.data?.results[0]["generic_name"], 500),
      ShortenWord(ndc?.data?.results[0]["dosage_form"], 500),
      ShortenWord(label?.data?.results[0]["overdosage"], 500),
      ShortenWord(ndc?.data?.results[0]["brand_name"], 500),
      ShortenWord(ndc?.data?.results[0]["route"], 500),
      ShortenWord(ndc?.data?.results[0]["pharm_class"], 500),
      ShortenWord(ndc?.data?.results[0]["labeler_name"], 500),
      ShortenWord(label?.data?.results[0]["description"], 500),
      ShortenWord(ndc?.data?.results[0]["product_type"], 500),
      ShortenWord(label?.data?.results[0]["pediatric_use"], 500),
      ShortenWord(label?.data?.results[0]["drug_interactions"], 500),
      ShortenWord(label?.data?.results[0]["contraindications"], 500),
      ShortenWord(label?.data?.results[0]["information_for_patients"], 500),
      ShortenWord(label?.data?.results[0]["geriatric_use"], 500),
    ],
    (err, _) => {
      if (err) throw err;
    }
  );
};
