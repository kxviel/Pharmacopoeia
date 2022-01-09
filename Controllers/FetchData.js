import { getNDC, getLabel } from "../Utils/API.js";
import { con } from "../Utils/db.js";
import { __dirname, app } from "../index.js";
import axios from "axios";
import { Render } from "../Utils/DisplayRender.js";
import { DateFormat } from "../Utils/Date.js";
import { InsertToDrugInfo } from "../Utils/InsertToDrugInfo.js";

export const FetchDataController = (req, res) => {
  const reqDrugName = req.body.query;

  axios
    .all([axios.get(getNDC(reqDrugName)), axios.get(getLabel(reqDrugName))])
    .then(
      axios.spread((responseNDC, responseLabel) => {
        let GlobalDrugName = responseNDC?.data?.results[0]["generic_name"];

        req.app.locals.globalDrugName = GlobalDrugName;
        res.render("Display", Render(responseNDC, responseLabel));

        //If it exists in History
        let ifPreviosulySearched =
          "SELECT * FROM History WHERE DrugName = ? AND username = ?";
        con.query(
          ifPreviosulySearched,
          [GlobalDrugName, req.app.locals.globalUser],
          (err, result) => {
            if (err) throw err;
            //If it exists
            if (result.length >= 1) {
              //________________________________
              //update time
              //________________________________
              //To-Do
              //________________________________
            } else {
              //add to history
              let insertToHistory =
                "INSERT INTO `HISTORY`(`username`, `DateTime`, DrugName) VALUES (?, ?, ?)";

              con.query(
                insertToHistory,
                [req.app.locals.globalUser, DateFormat(), GlobalDrugName],
                (err, result) => {
                  if (err) throw err;
                  //After insert-to-history success
                  //insert to druginfo
                  InsertToDrugInfo(
                    req.app.locals.globalUser,
                    responseNDC,
                    responseLabel
                  );
                }
              );
            }
          }
        );
      })
    );
};
