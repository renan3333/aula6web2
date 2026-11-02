// ADICIONADO: rotas relativas V2 com schemas próprios e middleware compartilhado.
import express from "express";
import uploadPhoto from "../../../config/multer.js";
import { ValidationError } from "../../../errors/AppError.js";
import * as userController from "../controllers/userController.js";
import validate from "../../../middlewares/validate.js";
import {
  createUserV2Schema,
  idParamSchema,
  updateUserV2Schema,
} from "../schemas/userSchema.js";

const router = express.Router();

/**
 * PATCH aceita arquivo sozinho, mas continua rejeitando corpo vazio sem foto.
 * A validação do schema permanece responsável pelos campos textuais estritos.
 */
function validatePatchBody(req, res, next) {
  const hasBodyFields = Object.keys(req.body ?? {}).length > 0;

  if (!hasBodyFields && !req.file) {
    return next(
      new ValidationError("Envie pelo menos um campo para atualização"),
    );
  }

  return validate(updateUserV2Schema)(req, res, next);
}

router.post(
  "/",
  uploadPhoto,
  validate(createUserV2Schema),
  userController.create,
);
router.get("/", userController.getAll);
router.get("/:id", validate(idParamSchema, "params"), userController.getById);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  uploadPhoto,
  validatePatchBody,
  userController.update,
);
router.delete("/:id", validate(idParamSchema, "params"), userController.remove);

export default router;
