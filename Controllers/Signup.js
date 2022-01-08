import { con } from "../Utils/db.js";
import { __dirname } from "../index.js";

export const SignupController = (req, res) => {
  let { name, email, username, password } = req.body;
  console.log(name, email, username, password);
  //Check if email exists
  let checkEmail = "SELECT * FROM USERS WHERE email ='" + email + "'";

  con.query(checkEmail, (err, result) => {
    if (err) throw err;
    //if username exists
    if (result.length >= 1) {
      res.render("Error", {
        error: "User Already Exists, Please Login",
      });
    } else {
      // Add User to DB
      let insertUser =
        "INSERT INTO `USERS` (`name`, `email`, `username`, `password`) VALUES ('" +
        name +
        "', '" +
        email +
        "', '" +
        username +
        "', '" +
        password +
        "')";
      con.query(insertUser, (err, result) => {
        if (err) throw err;
        res.sendFile(__dirname + "/views/Home.html");
      });
    }
  });
};
