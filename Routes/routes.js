import express from "express";
import { CommonControllers } from "../Controllers/CommonController.js";

export const router = express.Router();

router.post("/login", CommonControllers.Login);
router.post("/signup", CommonControllers.Signup);
router.post("/fetch", CommonControllers.FetchData);
router.get("/history", CommonControllers.FetchHistory);
router.post("/map", CommonControllers.Map);
router.get("/buynow", CommonControllers.BuyNow);
router.get("/buy", CommonControllers.Buy);
router.get("/success", CommonControllers.PaymentSuccess);
