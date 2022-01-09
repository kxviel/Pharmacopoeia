//Imports
import express from "express";
import dotenv from "dotenv";
import { router } from "./Routes/routes.js";
import path from "path";
import { fileURLToPath } from "url";

//Inits
const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Register an EJS View Engine
app.set("view engine", "ejs");

//For Initializing all Project Files in DIR
app.use(express.static("./"));

app.use("/v1", router);
app.locals.globalDrugName = "";
app.locals.globalUser = "";
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/LogIn.html");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
