export const DisplayController = (req, res) => {
  let query = req.body.drug_name;
  let type = "brand_name";
  const apiKey = "S3DeKRRy8PtgRxfFGl5QbUlH0lxcAZ7QR2k8R9wH&";
  let urlLabel =
    "https://api.fda.gov/drug/label.json?api_key=" +
    apiKey +
    "&search=openfda." +
    type +
    ":" +
    query +
    "&limit=2";
  let urlNDC =
    "https://api.fda.gov/drug/ndc.json?api_key=" +
    apiKey +
    "&search=" +
    type +
    ":" +
    query +
    "&limit=2";
  //------------API Call------------//
  axios
    .all([axios.get(urlNDC), axios.get(urlLabel)])
    .then(
      axios.spread((responseNDC, responseLabel) => {
        app.set("globalDrugName", responseNDC.data.results[0]["generic_name"]);
        const Render = () => {
          res.render("Display", {
            //------------NDC------------//
            DrugName:
              CapMe(responseNDC.data.results[0]["generic_name"]) ?? "Data N/A",
            DosageForm:
              responseNDC.data.results[0]["dosage_form"] ?? "Data N/A",
            BrandName:
              CapMe(responseNDC.data.results[0]["brand_name"]) ?? "Data N/A",
            AdminRoute: responseNDC.data.results[0]["route"] ?? "Data N/A",
            PharmacologicalClass:
              responseNDC.data.results[0]["pharm_class"] ?? "Data N/A",
            LabelerName:
              responseNDC.data.results[0]["labeler_name"] ?? "Data N/A",
            ProductType:
              responseNDC.data.results[0]["product_type"] ?? "Data N/A",
            //------------Label------------//
            Description:
              responseLabel.data.results[0]["description"] ?? "Data N/A",
            OverDosage:
              responseLabel.data.results[0]["overdosage"] ?? "Data N/A",
            PediatricUse:
              responseLabel.data.results[0]["pediatric_use"] ?? "Data N/A",
            DrugInteractions:
              responseLabel.data.results[0]["drug_interactions"] ?? "Data N/A",
            Contraindications:
              responseLabel.data.results[0]["contraindications"] ?? "Data N/A",
            InfoForPatients:
              responseLabel.data.results[0]["information_for_patients"] ??
              "Data N/A",
            GeriatricUse:
              responseLabel.data.results[0]["geriatric_use"] ?? "Data N/A",
          });
        };
        let sql =
          "SELECT * FROM DRUGINFO WHERE DrugName ='" +
          responseNDC.data.results[0]["generic_name"] +
          "';";
        con.query(sql, (err, result) => {
          if (err) throw err;
          if (result.length >= 1) {
            let selectDrugHISTORY =
              "SELECT * FROM HISTORY WHERE DrugName = '" +
              responseNDC.data.results[0]["generic_name"] +
              "'";
            con.query(selectDrugHISTORY, (err, res) => {
              if (err) throw err;
              if (res.length >= 1) {
                let updateSQL =
                  "UPDATE HISTORY SET DateTime = REPLACE(DateTime, '" +
                  res[0]["DateTime"] +
                  "', '" +
                  myDate() +
                  "');";
                con.query(updateSQL, (error) => {
                  if (error) throw error;
                  Render();
                });
              } else {
                let HISTORYSQL =
                  "INSERT INTO `HISTORY`(`username`, `DateTime`, DrugName) VALUES ('" +
                  req.app.get("usernameL") +
                  "', '" +
                  myDate() +
                  "','" +
                  responseNDC.data.results[0]["generic_name"] +
                  "');";
                con.query(HISTORYSQL, (err) => {
                  if (err) throw err;
                });
                Render();
              }
            });
          } else {
            let DRUGINFOQL =
              "INSERT INTO `DRUGINFO`(`username`,`DrugName`, `DosageForm`, `OverDosage`, `BrandName`, `AdminRoute`, `PharmacologicalClass`, `LabelerName`, `Description`, `ProductType`, `PediatricUse`, `DrugInteractions`, `Contraindications`, `InfoForPatients`, `GeriatricUse`) VALUES ('" +
              req.app.get("usernameL") +
              "','" +
              responseNDC.data.results[0]["generic_name"] +
              "', '" +
              responseNDC.data.results[0]["dosage_form"] +
              "', '" +
              responseLabel.data.results[0]["overdosage"] +
              "', '" +
              responseNDC.data.results[0]["brand_name"] +
              "', '" +
              responseNDC.data.results[0]["route"] +
              "', '" +
              responseNDC.data.results[0]["pharm_class"] +
              "','" +
              responseNDC.data.results[0]["labeler_name"] +
              "','" +
              responseLabel.data.results[0]["description"] +
              "','" +
              responseNDC.data.results[0]["product_type"] +
              "','" +
              responseLabel.data.results[0]["pediatric_use"] +
              "','" +
              responseLabel.data.results[0]["drug_interactions"] +
              "','" +
              responseLabel.data.results[0]["contraindications"] +
              "','" +
              responseLabel.data.results[0]["information_for_patients"] +
              "','" +
              responseLabel.data.results[0]["geriatric_use"] +
              "');";
            con.query(DRUGINFOQL, (err) => {
              if (err) throw err;
              let HISTORYSQL =
                "INSERT INTO `HISTORY`(`username`, `DateTime`, DrugName) VALUES ('" +
                req.app.get("usernameL") +
                "', '" +
                myDate() +
                "','" +
                responseNDC.data.results[0]["generic_name"] +
                "');";
              con.query(HISTORYSQL, (err) => {
                if (err) throw err;
              });
              Render();
            });
          }
        });
      })
    )
    .catch((error) => console.log(error));
};
