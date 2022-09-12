import express from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controllers.js";
import { checkAuthorization } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.delete("/sign-out", checkAuthorization, signOut);

export default router;