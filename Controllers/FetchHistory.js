import { Capitalize } from "../Utils/Capitalize.js";
import { con } from "../Utils/db.js";

export const FetchHistory = (req, res) => {
  let list = [];
  let getHistory = "select * from history where username = ?";
  con.query(getHistory, [req.app.locals.globalUser], (err, result) => {
    console.log(err);
    console.log(result);
    if (result.length !== 0) {
      for (let i = 0; i < result.length; i++) {
        list.push({
          drugName: Capitalize(result[i]?.DrugName),
          date: result[i]["DateTime"],
        });
      }
      res.render("History", {
        User: Capitalize(req.app.locals.globalUser),
        data: list,
      });
    } else {
      res.render("History", {
        User: Capitalize(req.app.locals.globalUser),
        data: [],
      });
    }
  });
};
