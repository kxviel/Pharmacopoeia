const express = require("express");
const app = express();
const bodyP = require("body-parser");
const mysql = require("mysql");
const geoCode = require("node-geocoder");
const axios = require("axios")

//------------------------------------------------------------------//

const d = new Date();
let currentDate = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
let currentTime = `${d.getHours()}:${d.getMinutes()}`;

const CapMe = (str) => {
    let splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}
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
    multipleStatements: true
});

//------------------------------------------------------------------//

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/LogIn.html");
});

//------------------------------------------------------------------//

app.post("/home", (req, res) => {
    //signinname == undefined => user logged in && loginpass == undefined => user signed up
    if (req.body.signinname === undefined) {
        console.log("User Logged In ");
        let usernameL = req.body.loginusername;
        let passwordL = req.body.loginpass;
        app.set('usernameL', usernameL);
        let sqlu = "SELECT * FROM users WHERE username ='" + usernameL + "'";
        let sqlp = "SELECT * FROM users WHERE password ='" + passwordL + "'";
        con.query(sqlu, (err, result) => {
            if (err) throw err;
            //if username exists in DB
            if (result.length === 1) {
                //if user entered correct password
                console.log("User Exists in DB");
                con.query(sqlp, (err, result) => {
                    if (err) throw err;
                    if (result.length >= 1) {
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
    } else if (req.body.loginpass === undefined) {
        console.log("User Signed In ");
        let name = req.body.signinname;
        let email = req.body.signinemail;
        let username = req.body.signinusername;
        let password = req.body.signinpassword;

        //Query to if User Email Exists to Avoid Duplicate SignUps
        let sql = "SELECT * FROM users WHERE email ='" + email + "'";
        con.query(sql, (err, result) => {
            if (err) throw err;

            if (result.length === 0) {
                let insertSQL =
                    "INSERT INTO `users` (`name`, `email`, `username`, `password`) VALUES ('" +
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
    axios.all([axios.get(urlNDC),
        axios.get(urlLabel)])
        .then(axios.spread((responseNDC, ResponseLabel) => {
            const Render = () => {
                res.render('Display', {
                    //------------NDC------------//
                    DrugName: CapMe(responseNDC.data.results[0]["generic_name"]) ?? "Data N/A",
                    DosageForm: responseNDC.data.results[0]["dosage_form"] ?? "Data N/A",
                    BrandName: CapMe(responseNDC.data.results[0]["brand_name"]) ?? "Data N/A",
                    AdminRoute: responseNDC.data.results[0]["route"] ?? "Data N/A",
                    PharmacologicalClass: responseNDC.data.results[0]["pharm_class"] ?? "Data N/A",
                    LabelerName: responseNDC.data.results[0]["labeler_name"] ?? "Data N/A",
                    ProductType: responseNDC.data.results[0]["product_type"] ?? "Data N/A",
                    //------------Label------------//
                    Description: ResponseLabel.data.results[0]["description"] ?? "Data N/A",
                    OverDosage: ResponseLabel.data.results[0]["overdosage"] ?? "Data N/A",
                    PediatricUse:
                        ResponseLabel.data.results[0]["pediatric_use"] ?? "Data N/A",
                    DrugInteractions:
                        ResponseLabel.data.results[0]["drug_interactions"] ?? "Data N/A",
                    Contraindications:
                        ResponseLabel.data.results[0]["contraindications"] ?? "Data N/A",
                    InfoForPatients:
                        ResponseLabel.data.results[0]["information_for_patients"] ??
                        "Data N/A",
                    GeriatricUse:
                        ResponseLabel.data.results[0]["geriatric_use"] ?? "Data N/A",
                });
            }
            let sql = "SELECT * FROM drugs WHERE DrugName ='" + responseNDC.data.results[0]["generic_name"] + "';";
            con.query(sql, (err, result) => {
                if (err) throw err;
                if (result.length >= 1) {
                    Render();
                } else {
                    let drugSQL =
                        "INSERT INTO `drugs` (`DrugName`, `DosageForm`, `OverDosage`, `BrandName`, `AdminRoute`, `PharmacologicalClass`, `LabelerName`, `Description`, `ProductType`, `PediatricUse`, `DrugInteractions`, `Contraindications`, `InfoForPatients`, `GeriatricUse`) VALUES ('" +
                        responseNDC.data.results[0]["generic_name"] +
                        "', '" +
                        responseNDC.data.results[0]["dosage_form"] +
                        "', '" +
                        ResponseLabel.data.results[0]["overdosage"] +
                        "', '" +
                        responseNDC.data.results[0]["brand_name"] +
                        "', '" +
                        responseNDC.data.results[0]["route"] +
                        "', '" +
                        responseNDC.data.results[0]["pharm_class"] +
                        "','" +
                        responseNDC.data.results[0]["labeler_name"] +
                        "','" +
                        ResponseLabel.data.results[0]["description"] +
                        "','" +
                        responseNDC.data.results[0]["product_type"] +
                        "','" +
                        ResponseLabel.data.results[0]["pediatric_use"] +
                        "','" +
                        ResponseLabel.data.results[0]["drug_interactions"] +
                        "','" +
                        ResponseLabel.data.results[0]["contraindications"] +
                        "','" +
                        ResponseLabel.data.results[0]["information_for_patients"] +
                        "','" +
                        ResponseLabel.data.results[0]["geriatric_use"] +
                        "');" +
                        "INSERT INTO `history` (`UserName`, `DrugName`, `Date`, `Time`) VALUES ('" +
                        req.app.get('usernameL') + "','" +
                        responseNDC.data.results[0]["generic_name"] + "','" +
                        currentDate + "','" +
                        currentTime + "');";
                    con.query(drugSQL, (err) => {
                        if (err) throw err;
                        Render();
                    });
                }
            });
        }))
        .catch(error => console.log(error));
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
        await geoCoder.geocode(req.query.Current_location).then(daResponse => {
            let latitude = daResponse[0]["latitude"];
            let longitude = daResponse[0]["longitude"];

            function phoneNumber() {
                return `+91 9${Math.floor(Math.random() * 900000000)}`;
            }

            function availability() {
                let yesNo = ["Yes", "No"];
                return yesNo[Math.floor(Math.random() * yesNo.length)];
            }

            let locationDetails = [];
            axios.get('https://api.foursquare.com/v2/venues/search?ll='+latitude+','+longitude+'&query=pharmacy&radius=10000&client_id=BFL2Y52PUJAONSK3UICXZAH3QC2JZ2UJWJBQIISYVWB0MGVN&client_secret=DKAK11LMZZHILZWA0WSV2W4DV0UBEGU03CBVZ5FCSH0XAQEQ&v=20210101').then(res => {
                if (res.status === 200 && res.data.response['venues'].length !== 0) {
                    for (let i = 0; i <= 4; i++) {
                        locationDetails.push({
                            PharmacyName: res.data.response['venues'][i]['name'] ,
                            DrugAvailability: availability(),
                            ContactNumber: phoneNumber(),
                            CityName: res.data.response['venues'][i]['location']['city'],
                            DistanceFromYou: res.data.response['venues'][i]['location']['distance']
                        })
                    }

                    //Insert Data Into Table
                    for (let i = 0; i <= 4; i++) {
                        let sql =
                            "INSERT INTO `stores` (`StoreNames`,`SearchedLocation`,`StoreDistance`, `Availabilty`,`PhoneNo`, `City`) VALUES ('" + locationDetails[i].PharmacyName + "','" + req.query.Current_location + "','" + locationDetails[i].DistanceFromYou + "','" + locationDetails[i].DrugAvailability + "','" + locationDetails[i].ContactNumber + "','" + locationDetails[i].CityName + "');";
                        con.query(sql, (err) => {
                            if (err) throw err;
                        });
                    }
                    mainResponse.render("Map", {
                        Deets: locationDetails
                    });
                } else {
                    mainResponse.sendFile(__dirname + '/views/Oops.html')
                }
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));
    })();

});

//------------------------------------------------------------------//
//All Get Requests to '/myHistory'
app.get("/myHistory", (req, res) => {
    let myList = [];
    let emptyList = [];
    if (req.app.get('usernameL') !== undefined) {
        let sql = "SELECT * from history WHERE UserName = '" + req.app.get('usernameL') + "';";
        con.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length !== 0) {
                for (let i = 0; i < result.length; i++) {
                    myList.push({
                        drugName: CapMe(result[i].DrugName),
                        time: CapMe(result[i].Time),
                        date: CapMe(result[i].Date)
                    });
                }
                res.render('History', {
                    User: CapMe(req.app.get('usernameL')),
                    data: myList
                });
            } else {
                emptyList.push({
                    drugName: 'Search for a Drug First',
                    time: '-',
                    date: '-'
                });
                res.render('History', {
                        User: CapMe(req.app.get('usernameL')),
                        data: emptyList
                    }
                )
            }
        });
    } else {
        res.sendFile(__dirname + "/views/LogIn.html");
    }
});

//------------------------------------------------------------------//

app.get('/BuyNow', function (req, res) {
    let myPrice = Math.floor(100 + Math.random() * 900);
    app.set('myPrice', myPrice);
    res.render('BuyNow', {
        Price: myPrice
    })
});

//------------------------------------------------------------------//

app.post('/buy', function (req) {

    let phoneNo = req.body.phone;
    let fullName = req.body.fullname;
    let paymentMethod = req.body.method;
    let address = req.body.subject;
    let pincode = req.body.pin;
    let currPrice = req.app.get('myPrice')

    let sql = "INSERT INTO `buyDrugs`(`PhoneNo` ,`PaymentMethod` , `Address` ,`FullName` ,`Pincode` , `Price`) VALUES('" + phoneNo + "','" + paymentMethod + "','" + address + "','" + fullName + "','" + pincode + "','" + currPrice + "');";
    con.query(sql, (err) => {
        if (err) throw err;
    });
});

//------------------------------------------------------------------//

//Server Launch at Port 3000
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is Running at localhost:3000");
});

//------------------------------------------------------------------//
// CREATE TABLE `users` (`name` varchar(100) ,`email` varchar(255) ,`username` varchar(255),
// `password` varchar(255),PRIMARY KEY(username));

// CREATE TABLE `drugs` (drug_id int NOT NULL AUTO_INCREMENT, `DrugName` varchar(255) NOT NULL,
// `DosageForm` TEXT, `OverDosage` TEXT, `BrandName` TEXT, `AdminRoute` varchar(255),
// `PharmacologicalClass` TEXT, `LabelerName` TEXT, `Description` TEXT, `ProductType` TEXT,
// `PediatricUse` TEXT, `DrugInteractions` TEXT, `Contraindications` TEXT, `InfoForPatients` TEXT,
// `GeriatricUse` TEXT, PRIMARY KEY(drug_id));

// CREATE TABLE `stores` (`store_id` int NOT NULL AUTO_INCREMENT, `StoreNames` varchar(100),`SearchedLocation` varchar(100),`Availabilty` varchar(100),`StoreDistance` int,`PhoneNo` varchar(20),`City` varchar(100),PRIMARY KEY(store_id));

// CREATE TABLE `history` (`histID` int NOT NULL AUTO_INCREMENT, `UserName` varchar(100),`DrugName` varchar(100),`Time` varchar(100),`Date` varchar(100),PRIMARY KEY(histID));

//CREATE TABLE `buyDrugs`(`buyerID` int NOT NULL AUTO_INCREMENT,`PhoneNo` varchar(20),`PaymentMethod` varchar(20), `Address` TEXT,`FullName` varchar(20),`Pincode` int, `Price` int,PRIMARY KEY(buyerID));