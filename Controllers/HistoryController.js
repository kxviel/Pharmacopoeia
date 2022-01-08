export const HistoryController = (req, res) => {
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
};
