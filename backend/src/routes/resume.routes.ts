import { Router } from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { resumeUpload } from "../config/multer.js";

import {
  upload,
  getAll,
  getOne,
  remove,
} from "../controllers/resume.controller.js";

const router = Router();

router.use(protect);

router.post(
  "/upload",
  resumeUpload.single("resume"),
  upload
);

router.get("/", getAll);

router.get("/:id", getOne);

router.delete("/:id", remove);

export default router;