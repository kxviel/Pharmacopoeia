const express = require("express");
const app = express();
const bodyP = require("body-parser");
const mysql = require("mysql");
const geoCode = require("node-geocoder");
const axios = require("axios");

//------------------------------------------------------------------//

const myDate = () => {
  const d = new Date();
  // IST offset UTC +5:30
  let ISTTime = new Date(d.getTime() + (330 + d.getTimezoneOffset()) * 60000);
  return `${d.getDate()}/${
    d.getMonth() + 1
  }/${d.getFullYear()}, ${ISTTime.getHours()}:${ISTTime.getMinutes()}`;
};

const CapMe = (str) => {
  let splitStr = str.toLowerCase().split(" ");
  for (let i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(" ");
};
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
  database: "GemDrugs",
  multipleStatements: true,
});

//------------------------------------------------------------------//

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/LogIn.html");
});

//------------------------------------------------------------------//

app.post("/home", (req, res) => {
  //signinname == undefined => user logged in && loginpass == undefined => user signed up
  if (req.body.signinname === undefined) {
    let usernameL = req.body.loginusername;
    let passwordL = req.body.loginpass;
    app.set("usernameL", usernameL);
    let sqlu = "SELECT * FROM USERS WHERE username ='" + usernameL + "'";
    let sqlp = "SELECT * FROM USERS WHERE password ='" + passwordL + "'";
    con.query(sqlu, (err, result) => {
      if (err) throw err;
      //if username exists in DB
      if (result.length === 1) {
        //if user entered correct password
        con.query(sqlp, (err, result) => {
          if (err) throw err;
          if (result.length >= 1) {
            //if correct pass continue
            res.sendFile(__dirname + "/views/Home.html");
          } else {
            res.sendFile(__dirname + "/views/Error.html");
          }
        });
      } else {
        res.sendFile(__dirname + "/views/Error.html");
      }
    });
  } else if (req.body.loginpass === undefined) {
    let name = req.body.signinname;
    let email = req.body.signinemail;
    let username = req.body.signinusername;
    let password = req.body.signinpassword;

    //Query to if User Email Exists to Avoid Duplicate SignUps
    let sql = "SELECT * FROM USERS WHERE email ='" + email + "'";
    con.query(sql, (err, result) => {
      if (err) throw err;

      if (result.length === 0) {
        let insertSQL =
          "INSERT INTO `USERS` (`name`, `email`, `username`, `password`) VALUES ('" +
          name +
          "', '" +
          email +
          "', '" +
          username +
          "', '" +
          password +
          "')";
        con.query(insertSQL, (err) => {
          if (err) throw err;
          res.sendFile(__dirname + "/views/Home.html");
        });
      } else {
        res.sendFile(__dirname + "/views/Error.html");
      }
    });
  }
});

//------------------------------------------------------------------//

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
});

//------------------------------------------------------------------//

//All Get Requests to '/map'
app.get("/map", (req, mainResponse) => {
  //Geocode
  let geoCoder = geoCode({
    provider: "openstreetmap",
  });

  //Self Invoking Function
  (async function GetLatLang() {
    await geoCoder
      .geocode(req.query.Current_location)
      .then((daResponse) => {
        let latitude = daResponse[0]["latitude"];
        let longitude = daResponse[0]["longitude"];

        function phoneNumber() {
          return `+91 9${Math.floor(Math.random() * 900000000)}`;
        }

        function availability() {
          let yesNo = ["Available", "Not Available"];
          return yesNo[Math.floor(Math.random() * yesNo.length)];
        }

        let locationDetails = [];
        axios
          .get(
            "https://api.foursquare.com/v2/venues/search?ll=" +
              latitude +
              "," +
              longitude +
              "&query=pharmacy&radius=10000&client_id=BFL2Y52PUJAONSK3UICXZAH3QC2JZ2UJWJBQIISYVWB0MGVN&client_secret=DKAK11LMZZHILZWA0WSV2W4DV0UBEGU03CBVZ5FCSH0XAQEQ&v=20210101"
          )
          .then((res) => {
            if (
              res.status === 200 &&
              res.data.response["venues"].length !== 0
            ) {
              for (let i = 0; i <= 4; i++) {
                locationDetails.push({
                  PharmacyName: res.data.response["venues"][i]["name"],
                  DrugAvailability: availability(),
                  ContactNumber: phoneNumber(),
                  CityName: res.data.response["venues"][i]["location"]["city"],
                  DistanceFromYou:
                    res.data.response["venues"][i]["location"]["distance"],
                });
              }

              //Insert Data Into Table
              for (let i = 0; i <= 4; i++) {
                let sql =
                  "INSERT INTO `STORES`(username, StoreNames, SearchedLocation, Availabilty, StoreDistance, PhoneNo, City) VALUES ('" +
                  req.app.get("usernameL") +
                  "','" +
                  locationDetails[i].PharmacyName +
                  "','" +
                  req.query.Current_location +
                  "','" +
                  locationDetails[i].DrugAvailability +
                  "','" +
                  locationDetails[i].DistanceFromYou +
                  "','" +
                  locationDetails[i].ContactNumber +
                  "','" +
                  locationDetails[i].CityName +
                  "');";
                con.query(sql, (err) => {
                  if (err) throw err;
                });
              }
              mainResponse.render("Map", {
                Deets: locationDetails,
              });
            } else {
              mainResponse.sendFile(__dirname + "/views/Oops.html");
            }
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  })();
});

//------------------------------------------------------------------//
//All Get Requests to '/myHISTORY'
app.get("/myHISTORY", (req, res) => {
  let myList = [];
  let emptyList = [];
  if (req.app.get("usernameL") !== undefined) {
    let sql =
      "SELECT * from HISTORY WHERE UserName = '" +
      req.app.get("usernameL") +
      "';";
    con.query(sql, (err, result) => {
      if (err) throw err;
      if (result.length !== 0) {
        for (let i = 0; i < result.length; i++) {
          myList.push({
            drugName: CapMe(result[i].DrugName),
            date: result[i]["DateTime"],
          });
        }
        res.render("HISTORY", {
          User: CapMe(req.app.get("usernameL")),
          data: myList,
        });
      } else {
        emptyList.push({
          drugName: "Search for a Drug First",
          date: "-",
        });
        res.render("HISTORY", {
          User: CapMe(req.app.get("usernameL")),
          data: emptyList,
        });
      }
    });
  } else {
    res.sendFile(__dirname + "/views/LogIn.html");
  }
});

//------------------------------------------------------------------//

app.get("/BuyNow", function (req, res) {
  let myPrice = Math.floor(100 + Math.random() * 900);
  app.set("myPrice", myPrice);
  res.render("BuyNow", {
    Price: `₹${myPrice}`,
    DrugName: req.app.get("globalDrugName"),
  });
});

//------------------------------------------------------------------//

app.post("/buy", function (req, res) {
  let phoneNo = req.body.phone;
  let fullName = req.body.fullname;
  let paymentMethod = req.body.method;
  let address = req.body.subject;
  let pincode = req.body.pin;
  let currPrice = req.app.get("myPrice");
  let sql =
    "INSERT INTO `BUYMEDS`(username, PhoneNo, PaymentMethod,Address,FullName,Pincode,Price) VALUES('" +
    req.app.get("usernameL") +
    "','" +
    phoneNo +
    "','" +
    paymentMethod +
    "','" +
    address +
    "','" +
    fullName +
    "','" +
    pincode +
    "','" +
    currPrice +
    "');";
  con.query(sql, (err) => {
    if (err) throw err;
  });
  let selSQL = "SELECT Price, PhoneNo, FullName FROM BUYMEDS";
  con.query(selSQL, (err, result) => {
    if (err) throw err;
    if (result !== 0) {
      res.render("Temp", {
        DrugName: req.app.get("globalDrugName"),
        Price: `₹${result[0]["Price"]}`,
        Phone: result[0]["PhoneNo"],
        Name: result[0]["FullName"],
      });
    }
  });
});
//------------------------------------------------------------------//

app.get("/temp", (req, res) => {
  let sql =
    "SELECT * FROM STORES WHERE username ='" + req.app.get("usernameL") + "'";
  let list = [];
  con.query(sql, (err, result) => {
    if (err) throw err;
    for (let i = 0; i < result.length; i++) {
      list.push({
        PharmacyName: result[i]["StoreNames"],
        DrugAvailability: result[i]["Availabilty"],
        DistanceFromYou: result[i]["StoreDistance"],
        ContactNumber: result[i]["PhoneNo"],
        CityName: result[i]["City"],
      });
    }
    res.render("map", {
      Deets: list,
    });
  });
});

//------------------------------------------------------------------//

app.get("/getMapBack", (req, res) => {});

//------------------------------------------------------------------//

app.get("/getMapBack", (req, res) => {});

//------------------------------------------------------------------//

//Server Launch at Port 3000
app.listen(process.env.PORT || 3000);

//------------------------------------------------------------------//

// CREATE TABLE `USERS` (`name` varchar(100) ,`email` varchar(255) ,`username` varchar(255),
// `password` varchar(255),PRIMARY KEY(username));

// CREATE TABLE `DRUGINFO` (drug_id int NOT NULL AUTO_INCREMENT, `username` varchar(255), `DrugName` varchar(255) NOT NULL,
// `DosageForm` TEXT, `OverDosage` TEXT, `BrandName` TEXT, `AdminRoute` varchar(255),
// `PharmacologicalClass` TEXT, `LabelerName` TEXT, `Description` TEXT, `ProductType` TEXT,
// `PediatricUse` TEXT, `DrugInteractions` TEXT, `Contraindications` TEXT, `InfoForPatients` TEXT,
// `GeriatricUse` TEXT, PRIMARY KEY(drug_id), FOREIGN KEY(username) REFERENCES USERS(username));

// CREATE TABLE `STORES` (`store_id` int NOT NULL AUTO_INCREMENT, `username` varchar(255), `StoreNames` varchar(100),`SearchedLocation` varchar(100),`Availabilty` varchar(100),`StoreDistance` int,`PhoneNo` varchar(20),`City` varchar(100),PRIMARY KEY(store_id), FOREIGN KEY(username) REFERENCES USERS(username));

// CREATE TABLE `HISTORY` (`histID` int NOT NULL AUTO_INCREMENT,  `username` varchar(255),`DateTime` varchar(100),PRIMARY KEY(histID), DrugName varchar(50), FOREIGN KEY(username) REFERENCES USERS(username));

// CREATE TABLE `BUYMEDS`(`buyerID` int NOT NULL AUTO_INCREMENT, `username` varchar(255), `store_id` int,`PhoneNo` varchar(20),`PaymentMethod` varchar(20), `Address` TEXT,`FullName` varchar(20),`Pincode` int, `Price` int,PRIMARY KEY(buyerID), FOREIGN KEY(username) REFERENCES USERS(username), FOREIGN KEY(store_id) REFERENCES STORES(store_id));
