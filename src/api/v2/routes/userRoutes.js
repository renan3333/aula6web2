// ADICIONADO: rotas relativas V2 com schemas próprios e middleware compartilhado.
import express from "express";
import uploadPhoto from "../../../config/multer.js";
import * as userController from "../controllers/userController.js";
import validate from "../../../middlewares/validate.js";
import {
  createUserV2Schema,
  idParamSchema,
  updateUserV2Schema,
} from "../schemas/userSchema.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserV2:
 *       type: object
 *       required: [id, primeiroNome, sobrenome, email, tipoUsuario, telefone, foto, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         primeiroNome:
 *           type: string
 *           example: Ada
 *         sobrenome:
 *           type: string
 *           nullable: true
 *           example: Lovelace
 *         email:
 *           type: string
 *           format: email
 *           example: ada@example.com
 *         tipoUsuario:
 *           type: string
 *           enum: [professor, admin]
 *           example: professor
 *         telefone:
 *           type: string
 *           nullable: true
 *           example: "38999998888"
 *         foto:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: https://ucarecdn.com/uuid/foto.jpg
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserV2Response:
 *       type: object
 *       required: [success, data]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Usuário criado com sucesso
 *         data:
 *           $ref: '#/components/schemas/UserV2'
 *     UserV2ListResponse:
 *       type: object
 *       required: [success, data, total]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserV2'
 *         total:
 *           type: integer
 *           example: 1
 *     CreateUserV2:
 *       type: object
 *       additionalProperties: false
 *       required: [primeiroNome, sobrenome, email]
 *       properties:
 *         primeiroNome:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Ada
 *         sobrenome:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Lovelace
 *         email:
 *           type: string
 *           format: email
 *           example: ada@example.com
 *         tipoUsuario:
 *           type: string
 *           enum: [professor, admin]
 *           default: professor
 *         telefone:
 *           type: string
 *           nullable: true
 *           pattern: '^\d{10,11}$'
 *           description: 10 ou 11 dígitos, sem máscara
 *           example: "38999998888"
 *         foto:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL da foto (use multipart para enviar o arquivo)
 *     CreateUserV2Multipart:
 *       type: object
 *       required: [primeiroNome, sobrenome, email]
 *       properties:
 *         primeiroNome:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         sobrenome:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *         tipoUsuario:
 *           type: string
 *           enum: [professor, admin]
 *           default: professor
 *         telefone:
 *           type: string
 *           pattern: '^\d{10,11}$'
 *         foto:
 *           type: string
 *           format: binary
 *           description: Imagem JPEG, PNG, GIF ou WebP de até 5 MiB
 *     UpdateUserV2:
 *       type: object
 *       additionalProperties: false
 *       minProperties: 1
 *       properties:
 *         primeiroNome:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         sobrenome:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *         tipoUsuario:
 *           type: string
 *           enum: [professor, admin]
 *         telefone:
 *           type: string
 *           nullable: true
 *           pattern: '^\d{10,11}$'
 *         foto:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL da foto; null remove a referência
 *     UpdateUserV2Multipart:
 *       type: object
 *       properties:
 *         primeiroNome:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         sobrenome:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *         tipoUsuario:
 *           type: string
 *           enum: [professor, admin]
 *         telefone:
 *           type: string
 *           pattern: '^\d{10,11}$'
 *         foto:
 *           type: string
 *           format: binary
 *           description: >-
 *             Imagem JPEG, PNG, GIF ou WebP de até 5 MiB. Sozinho, o arquivo
 *             já é uma atualização válida.
 *   responses:
 *     PayloadTooLarge:
 *       description: Corpo JSON acima de 100 KB ou foto acima de 5 MiB
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             error:
 *               code: PAYLOAD_TOO_LARGE
 *               message: Foto excede o limite de 5 MiB
 *             timestamp: "2026-11-03T12:00:00.000Z"
 *             path: /
 *     UploadServiceUnavailable:
 *       description: O serviço externo de upload (Uploadcare) falhou
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             error:
 *               code: UPLOAD_SERVICE_UNAVAILABLE
 *               message: Serviço de upload indisponível
 *             timestamp: "2026-11-03T12:00:00.000Z"
 *             path: /
 *     UploadNotConfigured:
 *       description: Upload não configurado no servidor (chave ausente)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             error:
 *               code: UPLOAD_NOT_CONFIGURED
 *               message: Upload não configurado no servidor
 *             timestamp: "2026-11-03T12:00:00.000Z"
 *             path: /
 */

/**
 * @swagger
 * /v2/users:
 *   post:
 *     tags: [Usuários V2]
 *     summary: Cria um usuário (V2)
 *     description: >-
 *       Aceita JSON (foto como URL) ou multipart/form-data (foto como
 *       arquivo). Quando há arquivo, ele tem prioridade sobre a URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserV2'
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserV2Multipart'
 *           encoding:
 *             foto:
 *               contentType: image/jpeg, image/png, image/gif, image/webp
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV2Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       413:
 *         $ref: '#/components/responses/PayloadTooLarge'
 *       502:
 *         $ref: '#/components/responses/UploadServiceUnavailable'
 *       503:
 *         $ref: '#/components/responses/UploadNotConfigured'
 */
router.post(
  "/",
  uploadPhoto,
  validate(createUserV2Schema),
  userController.create,
);

/**
 * @swagger
 * /v2/users:
 *   get:
 *     tags: [Usuários V2]
 *     summary: Lista os usuários (V2)
 *     description: Do mais recente para o mais antigo.
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV2ListResponse'
 */
router.get("/", userController.getAll);

/**
 * @swagger
 * /v2/users/{id}:
 *   get:
 *     tags: [Usuários V2]
 *     summary: Busca um usuário por ID (V2)
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV2Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(idParamSchema, "params"), userController.getById);

/**
 * @swagger
 * /v2/users/{id}:
 *   patch:
 *     tags: [Usuários V2]
 *     summary: Atualiza parcialmente um usuário (V2)
 *     description: >-
 *       Envie ao menos um campo ou um arquivo em foto. Aceita JSON ou
 *       multipart/form-data.
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserV2'
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserV2Multipart'
 *           encoding:
 *             foto:
 *               contentType: image/jpeg, image/png, image/gif, image/webp
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV2Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       413:
 *         $ref: '#/components/responses/PayloadTooLarge'
 *       502:
 *         $ref: '#/components/responses/UploadServiceUnavailable'
 *       503:
 *         $ref: '#/components/responses/UploadNotConfigured'
 */
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  uploadPhoto,
  (req, res, next) => {
    // Um arquivo válido, sozinho, também constitui uma atualização PATCH.
    if (req.file && Object.keys(req.body ?? {}).length === 0) {
      req.body = {};
      return next();
    }
    return validate(updateUserV2Schema)(req, res, next);
  },
  userController.update,
);

/**
 * @swagger
 * /v2/users/{id}:
 *   delete:
 *     tags: [Usuários V2]
 *     summary: Remove um usuário sem vínculos (V2)
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       200:
 *         description: Usuário removido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV2Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.delete("/:id", validate(idParamSchema, "params"), userController.remove);

export default router;
