import { con } from "../Utils/db.js";
import { __dirname } from "../index.js";

export const LoginController = (req, res) => {
  let { username, password } = req.body;
  console.log(username, password);
  //Check if username exists
  let checkUsername = "SELECT * FROM USERS WHERE username = ?";
  let checkPassword = "SELECT * FROM USERS WHERE password = ?";

  con.query(checkUsername, [username], (err, result) => {
    if (err) throw err;

    //if username exists
    if (result.length >= 1) {
      con.query(checkPassword, [password], (err, result) => {
        if (err) throw err;

        //if password is correct
        console.log(result[0]);
        if (result[0]?.password === password) {
          res.sendFile(__dirname + "/views/Home.html");
        } else {
          res.render("Error", {
            error: "Wrong Password",
          });
        }
      });
    } else {
      res.render("Error", {
        error: "User Not Found, Please Sign Up",
      });
    }
  });
};
