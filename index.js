//------------------------------------------------------------------//

const express = require("express");
const https = require("https");
const bodyP = require("body-parser");
const mysql = require("mysql");
const app = express();

//------------------------------------------------------------------//

app.set("view engine", "ejs");
app.use(bodyP.urlencoded({
  extended: false
}));
app.use(express.static(__dirname));

//------------------------------------------------------------------//
//use createPool instead of createConnection cause pool automatically opens and closes the connection
var con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "crysis123",
  database: "mydb",
});

//------------------------------------------------------------------//
//gets the requests frm '/' i.e. login screen
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

//------------------------------------------------------------------//
//posts the requested content to home or wherever u want it but in simple ... to home.html
//so all the requests i.e. filling forms, radio buttons,etc get posted to the home.html
//aka, i can use /login.html or /signup.html values here for further coding
app.post("/home.html", function (req, res) {
  //using these two above variables as my road dividers
  //if signinname == undefined it means user logged in
  //if loginpass == undefined it means user signed up
  if (req.body.signinname == undefined) {
    console.log("User Logged In ");
    var usernameL = req.body.loginusername;
    var passwordL = req.body.loginpass;
    var sqlu = "SELECT * FROM users WHERE username ='" + usernameL + "'";
    var sqlp = "SELECT * FROM users WHERE password ='" + passwordL + "'";
    con.query(sqlu, function (err, result) {
      if (err) throw err;
      //if username exists in DB
      if (result.length == 1) {
        //if user entered correct password
        console.log("User Exists in DB");
        con.query(sqlp, function (err, result) {
          if (err) throw err;
          if (result.length == 1) {
            //if correct pass continue
            console.log("Welcome " + usernameL);
            res.sendFile(__dirname + "/home.html");
          } else {
            console.log("Wrong Password Bruh");
            res.sendFile(__dirname + "/loginalert.html");
          }
        });
      } else {
        res.sendFile(__dirname + "/loginalert.html");
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
    con.query(sql, function (err, result) {
      if (err) throw err;
      c
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
        con.query(insertSQL, function (err, result) {
          if (err) throw err;
          console.log('Successful Added User');
          res.sendFile(__dirname + "/home.html");
        });
      } else {
        res.sendFile(__dirname + "/signupalert.html");
      }
    });
  }
});

//------------------------------------------------------------------//
//posts the display html i.e. index.ejs using display.html as a template
//all the code written inside is to wrok out the data and pass it to display.html(index.ejs)
app.post("/display.html", function (req, res) {
  var query = req.body.drug_name;
  var type = "brand_name";
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
  var labelerName;

  function one() {
    https.get(urlNdc, function (response1) {
      console.log("HTTP Call 1 Done");

      response1.on("data", function (data) {
        drugName = JSON.parse(data).results[0].generic_name;
        dosageForm = JSON.parse(data).results[0].dosage_form;
        brandName = JSON.parse(data).results[0].brand_name;
        route = JSON.parse(data).results[0].route;
        pharmClass = JSON.parse(data).results[0].pharm_class;
        labelerName = JSON.parse(data).results[0].labeler_name;
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
      var drugInteractions = JSON.parse(body).results[0].drug_interactions;
      var description = JSON.parse(body).results[0].description;
      var indicationanduse = JSON.parse(body).results[0].indications_and_usage;
      var contraindications = JSON.parse(body).results[0].contraindications;
      var pediatricuse = JSON.parse(body).results[0].pediatric_use;
      var geriatricuse = JSON.parse(body).results[0].geriatric_use;
      var infoforpatients = JSON.parse(body).results[0].information_for_patients;
      var overdosage = JSON.parse(body).results[0].overdosage;

      function three() {
        res.render("index", {
          drug_interactions: drugInteractions == null ? 'Data N/A' : drugInteractions,
          indication_and_use: indicationanduse == null ? 'Data N/A' : indicationanduse,
          contraindications: contraindications == null ? 'Data N/A' : contraindications,
          info_for_patients: infoforpatients == null ? 'Data N/A' : infoforpatients,
          geriatric_use: geriatricuse == null ? 'Data N/A' : geriatricuse,
          drug_name: drugName == null ? 'Data N/A' : drugName,
          dosage_form: dosageForm == null ? 'Data N/A' : dosageForm,
          overdosage: overdosage == null ? 'Data N/A' : overdosage,
          brand_name: brandName == null ? 'Data N/A' : brandName,
          route: route == null ? 'Data N/A' : route,
          pharm_class: pharmClass == null ? 'Data N/A' : pharmClass,
          description: description == null ? 'Data N/A' : description,
          pediatric_use: pediatricuse == null ? 'Data N/A' : pediatricuse,
          labeler_name: labelerName == null ? 'Data N/A' : labelerName,
        });
      }

      response2.on("end", function () {
        var sql = "SELECT * FROM drugs WHERE DrugName ='" + drugName + "'";
        con.query(sql, function (err, result) {
          if (err) throw err;
          if (result.length == 1) { //if the drug name data exists in DB
            console.log('Drug Exists in DB');
            three();
          } else { //if drug name doesnt exist in DB
            //insert
            console.log('Drug Doesnt Exist in DB');
            var sql = "INSERT INTO `drugs` (`DrugName`, `dosage_form`, `dosage`, `overDosage`, `brandName`, `administrationRoute`, `pharmClass`, `pharmDynamics`, `description`, `pediatricUse`) VALUES ('" + drugName + "', '" + dosageForm + "', '" + JSON.parse(body).results[0].dosage_forms_and_strengths + "', '" + JSON.parse(body).results[0].overdosage + "', '" + brandName + "', '" + route + "','" + pharmClass + "','" + JSON.parse(body).results[0].pharmacodynamics + "','" + JSON.parse(body).results[0].description + "','" + JSON.parse(body).results[0].pediatric_use + "');"
            con.query(sql, function (err, result) {
              if (err) throw err;
              three();
            });
          }
        });

      });
    });
  }

  //to make sure the functions are called orderwise
  one();
  two();
});

//------------------------------------------------------------------//

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is Running");
});

//------------------------------------------------------------------//
//CREATE TABLE `users` (`name` varchar(100) ,`email` varchar(255) ,`username` varchar(255),`password` varchar(255));
//CREATE TABLE `drugs` (drug_id int NOT NULL AUTO_INCREMENT, `DrugName` varchar(255) NOT NULL, `dosage_form` TEXT, `dosage` TEXT, `overDosage` TEXT, `brandName` varchar(255), `administrationRoute` TEXT, `pharmClass` TEXT, `pharmDynamics` TEXT, `description` TEXT, `pediatricUse` TEXT, PRIMARY KEY(drug_id));