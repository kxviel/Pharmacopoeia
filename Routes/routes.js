import express from "express";
import { CommonControllers } from "../Controllers/CommonController.js";

export const router = express.Router();

router.post("/login", CommonControllers.Login);
router.post("/signup", CommonControllers.Signup);
router.post("/display", CommonControllers.Display);
router.get("/map", CommonControllers.Map);
router.get("/history", CommonControllers.History);
router.get("/buy", CommonControllers.Buy);
