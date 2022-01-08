import mysql from "mysql";

export const con = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "Pharma",
  multipleStatements: true,
});
