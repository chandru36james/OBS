import { Router } from "express";
import { getNavigation, createNavigation, updateNavigation, deleteNavigation } from "../controllers/navigation.controller.js";

const router = Router();

router.get("/", getNavigation);
router.post("/", createNavigation);
router.put("/:id", updateNavigation);
router.delete("/:id", deleteNavigation);

export { router as navigationRouter };
