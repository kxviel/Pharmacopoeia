import { LoginController } from "./Login.js";
import { SignupController } from "./Signup.js";
import { FetchDataController } from "./FetchData.js";
import { FetchHistory } from "./FetchHistory.js";
import { MapController } from "./Map.js";
import { BuyNowController } from "./BuyNow.js";
import { BuyController } from "./Buy.js";
import { PaymentSuccessController } from "./PaymentSuccess.js";

export const CommonControllers = {
  Login: LoginController,
  Signup: SignupController,
  FetchData: FetchDataController,
  FetchHistory: FetchHistory,
  //unedited
  Map: MapController,
  BuyNow: BuyNowController,
  Buy: BuyController,
  PaymentSuccess: PaymentSuccessController,
};
