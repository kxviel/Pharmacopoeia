import { con } from "../Utils/db.js";
import { __dirname, app } from "../index.js";

export const SignupController = (req, res) => {
  let { name, email, username, password } = req.body;
  console.log(name, email, username, password);

  //Check if email exists
  let checkEmail = "SELECT * FROM USERS WHERE email = ?";

  con.query(checkEmail, [email], (err, result) => {
    if (err) throw err;
    //if email already exists
    if (result[0]?.email === email) {
      res.render("Error", {
        error: "User Already Exists, Please Login",
      });
    } else {
      req.app.locals.globalUser = username;
      // Add User to DB
      let insertUser =
        "INSERT INTO `USERS` (`name`, `email`, `username`, `password`) VALUES (?, ?, ?, ?);";
      con.query(insertUser, [name, email, username, password], (err, _) => {
        if (err) throw err;
        res.sendFile(__dirname + "/views/Home.html");
      });
    }
  });
};
