import { Router } from "express";
import { getPosts, createPost, updatePost, deletePost } from "../controllers/posts.controller.js";

const router = Router();

router.get("/", getPosts);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export { router as postsRouter };
