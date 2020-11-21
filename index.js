const express = require("express");
const https = require("https");
const bodyP = require("body-parser");
const mysql = require("mysql");
const app = express();

//------------------------------------------------------------------//

//Register an EJS View Engine
app.set("view engine", "ejs");
//For Parsing Response Body
app.use(
  bodyP.urlencoded({
    extended: false,
  })
);
//For Initializing all Project Files in DIR
app.use(express.static(__dirname));

//------------------------------------------------------------------//
//Connect To MySQL
//use createPool instead of createConnection cause pool automatically opens and closes the connection
let con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "crysis123",
  database: "mydb",
});

//------------------------------------------------------------------//
//gets the requests frm '/' i.e. login screen
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/LogIn.html");
});

//------------------------------------------------------------------//
//posts the requested content to home or wherever u want it but in simple ... to home.html
//so all the requests i.e. filling forms, radio buttons,etc get posted to the home.html
//aka, i can use /login.html or /signup.html values here for further coding
app.post("/home", (req, res) => {
  //using these two above variables as my road dividers
  //if signinname == undefined it means user logged in
  //if loginpass == undefined it means user signed up
  if (req.body.signinname === undefined) {
    console.log("User Logged In ");
    var usernameL = req.body.loginusername;
    var passwordL = req.body.loginpass;
    var sqlu = "SELECT * FROM users WHERE username ='" + usernameL + "'";
    var sqlp = "SELECT * FROM users WHERE password ='" + passwordL + "'";
    con.query(sqlu, (err, result) => {
      if (err) throw err;
      //if username exists in DB
      if (result.length === 1) {
        //if user entered correct password
        console.log("User Exists in DB");
        con.query(sqlp, (err, result) => {
          if (err) throw err;
          if (result.length == 1) {
            //if correct pass continue
            console.log("Welcome " + usernameL);
            res.sendFile(__dirname + "/views/Home.html");
          } else {
            console.log("Wrong Password Bruh");
            res.sendFile(__dirname + "/views/Error.html");
          }
        });
      } else {
        res.sendFile(__dirname + "/views/Error.html");
      }
    });
  } else if (req.body.loginpass == undefined) {
    console.log("User Signed In ");
    var name = req.body.signinname;
    var email = req.body.signinemail;
    var username = req.body.signinusername;
    var password = req.body.signinpassword;

    //sql query to check if there is a user with the same email in the DB
    //If there is, then send err, else sign in successful
    var sql = "SELECT * FROM users WHERE email ='" + email + "'";
    con.query(sql, (err, result) => {
      if (err) throw err;

      if (result.length == 0) {
        var insertSQL =
          "INSERT INTO `users` (`name`, `email`, `username`, `password`) VALUES ('" +
          name +
          "', '" +
          email +
          "', '" +
          username +
          "', '" +
          password +
          "')";
        con.query(insertSQL, (err, result) => {
          if (err) throw err;
          console.log("Successful Added User");
          res.sendFile(__dirname + "/views/Home.html");
        });
      } else {
        res.sendFile(__dirname + "/views/Error.html");
      }
    });
  }
});

//------------------------------------------------------------------//
//posts the display html i.e. index.ejs using display.html as a template
//all the code written inside is to work out the data and pass it to display.html(index.ejs)
app.post("/display", (req, res) => {
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
  let urlNdc =
    "https://api.fda.gov/drug/ndc.json?api_key=" +
    apiKey +
    "&search=" +
    type +
    ":" +
    query +
    "&limit=2";

  let drugName;
  let dosageForm;
  let brandName;
  let route;
  let pharmClass;
  let labelerName;
  let productType;

  function one() {
    https.get(urlNdc, (response1) => {
      console.log("HTTP Call 1 Done");

      response1.on("data", (data) => {
        drugName = JSON.parse(data).results[0]["generic_name"];
        dosageForm = JSON.parse(data).results[0]["dosage_form"];
        brandName = JSON.parse(data).results[0]["brand_name"];
        route = JSON.parse(data).results[0]["route"];
        pharmClass = JSON.parse(data).results[0]["pharm_class"];
        labelerName = JSON.parse(data).results[0]["labeler_name"];
        productType = JSON.parse(data).results[0]["product_type"];
      });
    });
  }

  function two() {
    https.get(urlLabel, (response2) => {
      console.log("HTTP Call 2 Done");
      let body = "";
      response2.on("data", (data) => {
        body += data;
      });

      function three() {
        res.render("Index", {
          DrugName: drugName == null ? "Data N/A" : drugName,
          DosageForm: dosageForm == null ? "Data N/A" : dosageForm,
          OverDosage:
            JSON.parse(body).results[0]["overdosage"] == null
              ? "Data N/A"
              : JSON.parse(body).results[0]["overdosage"],
          BrandName: brandName == null ? "Data N/A" : brandName,
          AdminRoute: route == null ? "Data N/A" : route,
          PharmacologicalClass: pharmClass == null ? "Data N/A" : pharmClass,
          LabelerName: labelerName == null ? "Data N/A" : labelerName,
          Description:
            JSON.parse(body).results[0]["description"] == null
              ? "Data N/A"
              : JSON.parse(body).results[0]["description"],
          ProductType: productType == null ? "Data N/A" : productType,
          PediatricUse:
            JSON.parse(body).results[0]["pediatric_use"] == null
              ? "Data N/A"
              : JSON.parse(body).results[0]["pediatric_use"],
          DrugInteractions:
            JSON.parse(body).results[0]["drug_interactions"] == null
              ? "Data N/A"
              : JSON.parse(body).results[0]["drug_interactions"],
          Contraindications:
            JSON.parse(body).results[0]["contraindications"] == null
              ? "Data N/A"
              : JSON.parse(body).results[0]["contraindications"],
          InfoForPatients:
            JSON.parse(body).results[0]["information_for_patients"] == null
              ? "Data N/A"
              : JSON.parse(body).results[0]["information_for_patients"],
          GeriatricUse:
            JSON.parse(body).results[0]["geriatric_use"] == null
              ? "Data N/A"
              : JSON.parse(body).results[0]["geriatric_use"],
        });
      }

      response2.on("end", () => {
        let sql = "SELECT * FROM drugs WHERE DrugName ='" + drugName + "'";
        con.query(sql, (err, result) => {
          if (err) throw err;
          if (result.length === 1) {
            //if the drug name data exists in DB
            console.log("Drug Exists in DB");
            three();
            console.log("Display Rendered");
          } else {
            //if drug name doesnt exist in DB
            //insert
            console.log("Drug Doesnt Exist in DB");
            let sql =
              "INSERT INTO `drugs` (`DrugName`, `DosageForm`, `OverDosage`, `BrandName`, `AdminRoute`, `PharmacologicalClass`, `LabelerName`, `Description`, `ProductType`, `PediatricUse`, `DrugInteractions`, `Contraindications`, `InfoForPatients`, `GeriatricUse`) VALUES ('" +
              drugName +
              "', '" +
              dosageForm +
              "', '" +
              JSON.parse(body).results[0]["overdosage"] +
              "', '" +
              brandName +
              "', '" +
              route +
              "', '" +
              pharmClass +
              "','" +
              labelerName +
              "','" +
              JSON.parse(body).results[0]["description"] +
              "','" +
              productType +
              "','" +
              JSON.parse(body).results[0]["pediatric_use"] +
              "','" +
              JSON.parse(body).results[0]["drug_interactions"] +
              "','" +
              JSON.parse(body).results[0]["contraindications"] +
              "','" +
              JSON.parse(body).results[0]["information_for_patients"] +
              "','" +
              JSON.parse(body).results[0]["geriatric_use"] +
              "');";

            con.query(sql, (err, result) => {
              if (err) throw err;
              console.log("Drug Data Entered into DB");
              three();
              console.log("Display Rendered");
            });
          }
        });
      });
    });
  }

  //to make sure the functions are called orderly
  one();
  two();
});

app.get("/map", (req, res) => {
  let hey = "my abab";
  res.render("Map", {
    text: hey,
  });
});

//------------------------------------------------------------------//

app.listen(process.env.PORT || 777, () => {
  console.log("Server is Running");
});

//------------------------------------------------------------------//
//CREATE TABLE `users` (`name` varchar(100) ,`email` varchar(255) ,`username` varchar(255),`password` varchar(255));
//CREATE TABLE `drugs` (drug_id int NOT NULL AUTO_INCREMENT, `DrugName` varchar(255) NOT NULL, `DosageForm` TEXT, `OverDosage` TEXT, `BrandName` TEXT, `AdminRoute` varchar(255), `PharmacologicalClass` TEXT, `LabelerName` TEXT, `Description` TEXT, `ProductType` TEXT, `PediatricUse` TEXT, `DrugInteractions` TEXT, `Contraindications` TEXT, `InfoForPatients` TEXT, `GeriatricUse` TEXT, PRIMARY KEY(drug_id));
