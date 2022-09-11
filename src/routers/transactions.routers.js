import express from "express";
import { createTransactions, getTransactions } from "../controllers/transactions.controllers.js";
import { checkAuthorization } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/transactions", checkAuthorization, createTransactions);
router.get("/transactions", checkAuthorization, getTransactions);

export default router;