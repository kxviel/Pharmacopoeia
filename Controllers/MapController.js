export const MapController = (req, res) => {
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
};
