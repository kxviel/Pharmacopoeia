import mysql from "mysql";

export const con = mysql.createPool({
  host: "localhost",
  user: "root",
  // password: "chinmay",
  database: "Pharma",
  multipleStatements: true,
});
