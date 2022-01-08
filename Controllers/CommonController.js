import { DisplayController } from "./DisplayController.js";

import { HistoryController } from "./HistoryController.js";
import { MapController } from "./MapController.js";
import { BuyController } from "./BuyController.js";
import { LoginController } from "./Login.js";
import { SignupController } from "./Signup.js";

export const CommonControllers = {
  Login: LoginController,
  Signup: SignupController,
  Display: DisplayController,
  Map: MapController,
  History: HistoryController,
  Buy: BuyController,
};
