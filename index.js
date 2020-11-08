//------------------------------------------------------------------//

const express = require("express");
const https = require("https");
const bodyP = require("body-parser");
const mysql = require("mysql");

const app = express();

//------------------------------------------------------------------//

app.set("view engine", "ejs");
app.use(bodyP.urlencoded({ extended: true }));
app.use(express.static(__dirname));

//------------------------------------------------------------------//

// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "crysis123",
//   database: "mydb",
// });

//------------------------------------------------------------------//

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

//------------------------------------------------------------------//

app.post("/home.html", function (req, res) {
  res.sendFile(__dirname + "/home.html");
});

//------------------------------------------------------------------//

app.post("/display.html", function (req, res) {
  var query = req.body.drug_name;
  var type = "generic_name";
  const apiKey = "S3DeKRRy8PtgRxfFGl5QbUlH0lxcAZ7QR2k8R9wH&";
  var urlLabel =
    "https://api.fda.gov/drug/label.json?api_key=" +
    apiKey +
    "&search=openfda." +
    type +
    ":" +
    query +
    "&limit=2";
  var urlNdc =
    "https://api.fda.gov/drug/ndc.json?api_key=" +
    apiKey +
    "&search=" +
    type +
    ":" +
    query +
    "&limit=2";

  var drugName;
  var dosageForm;
  var brandName;
  var route;
  var pharmClass;

  function one() {
    https.get(urlNdc, function (response1) {
      console.log("HTTP Call 1 Done");

      response1.on("data", function (data) {
        //parse JSON data
        //DB Table Name:ndc
        drugName = JSON.parse(data).results[0].generic_name;
        dosageForm = JSON.parse(data).results[0].dosage_form;
        brandName = JSON.parse(data).results[0].brand_name;
        route = JSON.parse(data).results[0].route;
        pharmClass = JSON.parse(data).results[0].pharm_class;
      });
    });
  }

  function two() {
    https.get(urlLabel, function (response2) {
      console.log("HTTP Call 2 Done");
      let body = "";
      response2.on("data", function (data) {
        body += data;
      });
      response2.on("end", function () {
        var resp = JSON.parse(body);
        res.render("index", {
          drugName: drugName,
          dosageForm: dosageForm,
          brandName: brandName,
          route: route,
          pharmClass: pharmClass,
          pp: resp.results[0].pharmacodynamics,
        });
      });
    });
  }

  one();
  two();
});

//------------------------------------------------------------------//

app.listen(3000, function () {
  console.log("Server is Running");
});

//------------------------------------------------------------------//
