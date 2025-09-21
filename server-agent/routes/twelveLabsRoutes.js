import express from "express";
import { queryTwelveLabs } from "../controllers/twelveLabsController.js";

const router = express.Router();

router.post("/query", queryTwelveLabs);

export default router;
