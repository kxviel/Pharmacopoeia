import { getNDC, getLabel } from "../Utils/API.js";
import { con } from "../Utils/db.js";
import { __dirname } from "../index.js";
import { Render } from "../Utils/DisplayRender.js";

export const FetchDataController = (req, res) => {
  const reqDrugName = req.body.drug_name;

  console.log(reqDrugName);
};
