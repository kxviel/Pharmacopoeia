import { Capitalize } from "../Utils/Capitalize.js";
import { con } from "../Utils/db.js";

export const MapController = (req, res) => {
  let { location } = req.body;
  let locationList = [];
  const pharmacyNames = [
    "London Drugs",
    "Radha Medicals",
    "Apollo Pharmacy",
    "Boone Drugs",
    "MedPlus",
    "MedLife",
  ];
  const distance = ["200m", "150m", "1.4km", "2km", "7m", "765m"];
  const drugAvailabilty = ["Available", "Not Available"];
  const phoneNumber = () => `+91 9${Math.floor(Math.random() * 900000000)}`;
  const randomize = (arr) => arr[Math.floor(Math.random() * arr.length)];

  for (let i = 0; i <= 4; i++) {
    locationList.push({
      PharmacyName: randomize(pharmacyNames),
      DrugAvailability: randomize(drugAvailabilty),
      ContactNumber: phoneNumber(),
      CityName: Capitalize(location),
      DistanceFromYou: randomize(distance),
    });
  }

  let sql =
    "INSERT INTO `STORES`(username, StoreNames, SearchedLocation, Availabilty, StoreDistance, PhoneNo, City) VALUES (?,?,?,?,?,?,?)";
  for (let j = 0; j <= 4; j++) {
    con.query(
      sql,
      [
        Capitalize(req.app.locals.globalUser),
        locationList[j].PharmacyName,
        locationList[j].CityName,
        locationList[j].DrugAvailability,
        locationList[j].DistanceFromYou,
        locationList[j].ContactNumber,
        locationList[j].CityName,
      ],
      (err, result) => {
        if (err) throw err;
      }
    );
  }
  res.render("Map", {
    Deets: locationList,
  });
};
