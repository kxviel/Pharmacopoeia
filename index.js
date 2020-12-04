const express = require("express");
const app = express();
const https = require("https");
const bodyP = require("body-parser");
const mysql = require("mysql");
const geo = require("node-geocoder");
const { send } = require("process");

//------------------------------------------------------------------//

//Register an EJS View Engine
app.set("view engine", "ejs");
//For Parsing Response Body
app.use(
  bodyP.urlencoded({
    extended: true,
  })
);
//For Initializing all Project Files in DIR
app.use(express.static(__dirname));

//------------------------------------------------------------------//

//Connect To MySQL
//Use createPool to auto close MySQL Connections
let con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "chinmay",
  database: "mydb",
});

//------------------------------------------------------------------//

//'/' is our Home Screen i.e. localhost:777
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/LogIn.html");
});

//------------------------------------------------------------------//

//All Post Requests to '/home'
app.post("/home", (req, res) => {
  //signinname == undefined => user logged in && loginpass == undefined => user signed up
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

    //Query to if User Email Exists to Avoid Duplicate SignUps
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

//All Post Requests to '/display'
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

  //one() => Stores Variables from NDC.json
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

  //two() => Stores Variables from Label.json & Renders to Index.ejs
  function two() {
    https.get(urlLabel, (response2) => {
      console.log("HTTP Call 2 Done");
      let body = "";
      response2.on("data", (data) => {
        body += data;
      });

      //three() => Renders to Index.ejs
      function three() {
        res.render("Index", {
          DrugName: drugName ?? "Data N/A",
          DosageForm: dosageForm ?? "Data N/A",
          OverDosage: JSON.parse(body).results[0]["overdosage"] ?? "Data N/A",
          BrandName: brandName ?? "Data N/A",
          AdminRoute: route ?? "Data N/A",
          PharmacologicalClass: pharmClass ?? "Data N/A",
          LabelerName: labelerName ?? "Data N/A",
          Description: JSON.parse(body).results[0]["description"] ?? "Data N/A",
          ProductType: productType ?? "Data N/A",
          PediatricUse:
            JSON.parse(body).results[0]["pediatric_use"] ?? "Data N/A",
          DrugInteractions:
            JSON.parse(body).results[0]["drug_interactions"] ?? "Data N/A",
          Contraindications:
            JSON.parse(body).results[0]["contraindications"] ?? "Data N/A",
          InfoForPatients:
            JSON.parse(body).results[0]["information_for_patients"] ??
            "Data N/A",
          GeriatricUse:
            JSON.parse(body).results[0]["geriatric_use"] ?? "Data N/A",
        });
      }

      //Avoid Duplicate Entries of Drug to Table
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

  //Function Calls in Order
  one();
  two();
});

//------------------------------------------------------------------//

//All Get Requests to '/map'
app.get("/map", (req, resmain) => {
  //Get form data with city name
  let myLocation = req.query.mylocation;

  //url Variables
  const clientID = "BFL2Y52PUJAONSK3UICXZAH3QC2JZ2UJWJBQIISYVWB0MGVN";
  const clientSecret = "DKAK11LMZZHILZWA0WSV2W4DV0UBEGU03CBVZ5FCSH0XAQEQ";
  const query = "pharmacy";
  const date = "20201120";

  //Get Lat and Long from City Name Entered
  let latitude;
  let longitude;
  let myBody;
  var a = [],
    b = [],
    c = [],
    d = [],
    e = [];

  //Geocode
  let options = {
    provider: "openstreetmap",
  };
  let geoCoder = geo(options);

  async function getLatLang() {
    myBody = await geoCoder.geocode(myLocation);
  }

  function getMapURL() {
    latitude = myBody[0]["latitude"];
    longitude = myBody[0]["longitude"];
    mapURL =
      "https://api.foursquare.com/v2/venues/search?ll=" +
      latitude +
      "," +
      longitude +
      "&query=" +
      query +
      "&radius=10000&client_id=" +
      clientID +
      "&client_secret=" +
      clientSecret +
      "&v=" +
      date;
    var location1, meters1, city1;
    var location2, meters2, city2;
    var location3, meters3, city3;
    var location4, meters4, city4;
    var location5, meters5, city5;

    //Random Phone Number
    function phoneNumber() {
      let randomNumber = Math.floor("9" + Math.random() * 900000000);
      let phoneNumber = "+91 " + `${randomNumber}`;
      return phoneNumber;
    }

    //Availability
    function availability() {
      var yesNo = ["Yes", "No"];
      var rand = Math.floor(Math.random() * yesNo.length);
      let availability = yesNo[rand];
      return availability;
    }

    //Parse JSON and Render
    https
      .get(mapURL, function (res) {
        var json = "";
        res.on("data", function (chunk) {
          json += chunk;
        });
        res.on("end", function () {
          if (res.statusCode === 200) {
            try {
              var i;

              for (i = 0; i <= 4; i++) {
                a[i] = JSON.parse(json).response.venues[i].name;
                b[i] = JSON.parse(json).response.venues[i].location.distance;
                c[i] = JSON.parse(json).response.venues[i].location.city;
                d[i] = availability();
                e[i] = phoneNumber();
              }

              //Insert Data Into Table
              for (i = 0; i <= 4; i++) {
                let sql =
                  "INSERT INTO `stores` (`StoreNames`,`SearchedLocation`,`StoreDistance`, `Availabilty`,`PhoneNo`, `City`) VALUES ('" +
                  a[i] +
                  "','" +
                  myLocation +
                  "','" +
                  b[i] +
                  "','" +
                  d[i] +
                  "','" +
                  e[i] +
                  "','" +
                  c[i] +
                  "');";
                con.query(sql, (err, result) => {
                  if (err) throw err;
                });
              }

              resmain.render("Map", {
                Heading: "Pharmacies Near Me",
                loc1: a[0] ?? "No Shops Nearby",
                loc2: a[1] ?? "No Shops Nearby",
                loc3: a[2] ?? "No Shops Nearby",
                loc4: a[3] ?? "No Shops Nearby",
                loc5: a[4] ?? "No Shops Nearby",
                met1: b[0] ?? "N/A",
                met2: b[1] ?? "N/A",
                met3: b[2] ?? "N/A",
                met4: b[3] ?? "N/A",
                met5: b[4] ?? "N/A",
                cit1: c[0] ?? "N/A",
                cit2: c[1] ?? "N/A",
                cit3: c[2] ?? "N/A",
                cit4: c[3] ?? "N/A",
                cit5: c[4] ?? "N/A",
                phone1: e[0],
                avail1: d[0],
                phone2: e[1],
                avail2: d[1],
                phone3: e[2],
                avail3: d[2],
                phone4: e[3],
                avail4: d[3],
                phone5: e[4],
                avail5: d[4],
              });
            } catch (exc) {
              console.log(exc, "Error parsing JSON!");
            }
          } else {
            console.log("Status:", res.statusCode);
          }
        });
      })
      .on("error", function (err) {
        console.log("Error:", err);
      });
  }

  //Resolve Async Function
  getLatLang();
  setTimeout(getMapURL, 3000);
});

//------------------------------------------------------------------//

//Server Launch at Port 777
app.listen(process.env.PORT || 777, () => {
  console.log("Server is Running at localhost:777");
});

//------------------------------------------------------------------//
// CREATE TABLE `users` (`name` varchar(100) ,`email` varchar(255) ,`username` varchar(255),
// `password` varchar(255),PRIMARY KEY(username));

// CREATE TABLE `drugs` (drug_id int NOT NULL AUTO_INCREMENT, `DrugName` varchar(255) NOT NULL,
// `DosageForm` TEXT, `OverDosage` TEXT, `BrandName` TEXT, `AdminRoute` varchar(255),
// `PharmacologicalClass` TEXT, `LabelerName` TEXT, `Description` TEXT, `ProductType` TEXT,
// `PediatricUse` TEXT, `DrugInteractions` TEXT, `Contraindications` TEXT, `InfoForPatients` TEXT,
// `GeriatricUse` TEXT, PRIMARY KEY(drug_id));

// CREATE TABLE `stores` (`store_id` int NOT NULL AUTO_INCREMENT, `StoreNames` varchar(100),`SearchedLocation` varchar(100),`StoreDistance` int,PRIMARY KEY(store_id));
