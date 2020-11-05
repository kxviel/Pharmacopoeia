const express = require("express");
const https = require("https");
const bodyP = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.use(bodyP.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/display.html", function (req, res) {
  var query = req.body.drug_name;
  var type = "generic_name";
  const apiKey = "S3DeKRRy8PtgRxfFGl5QbUlH0lxcAZ7QR2k8R9wH&";
  var url =
    "https://api.fda.gov/drug/ndc.json?api_key=" +
    apiKey +
    "search=" +
    type +
    ":" +
    query +
    "&limit=1";
  https.get(url, function (response) {
    console.log(response);

    response.on("data", function (data) {
      var drug = JSON.parse(data);
      var form = drug.results[0].dosage_form;
      var drug_name = drug.results[0].generic_name;
      var brand_name = drug.results[0].brand_name;
      var admin_route = drug.results[0].route;
      var pharm_class = drug.results[0].pharm_class;

      res.render('index',{drugName: drug_name, dosageForm: form, brandName: brand_name, route: admin_route, pharmClass: pharm_class});
    });
  });
});

app.listen(3000, function () {
  console.log("Server is Running");
});
