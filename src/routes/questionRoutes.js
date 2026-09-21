import { Router } from "express";
import * as questionController from "../controllers/questionController.js";

import validate from "../middlewares/validate.js";
import {
  idParamSchema,
  createQuestionSchema,
  updateQuestionSchema,
} from "../schemas/questionSchema.js";

const router = Router();

router.get("/", questionController.getAllQuestions);

router.get(
  "/:id",
  validate(idParamSchema, "params"),
  questionController.getQuestionById
);

router.post(
  "/",
  validate(createQuestionSchema, "body"),
  questionController.createQuestion
);

router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateQuestionSchema, "body"),
  questionController.updateQuestion
);

router.delete(
  "/:id",
  validate(idParamSchema, "params"),
  questionController.deleteQuestion
);

export default router;