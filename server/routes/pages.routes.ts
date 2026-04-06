import { Router } from "express";
import { getPages, createPage, updatePage, deletePage } from "../controllers/pages.controller.js";

const router = Router();

router.get("/", getPages);
router.post("/", createPage);
router.put("/:id", updatePage);
router.delete("/:id", deletePage);

export { router as pagesRouter };
