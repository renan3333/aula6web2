import express from "express";
import * as userController from "../controllers/userController.js";
import validate from "../../../middlewares/validate.js";
import {
  createUserSchema,
  idParamSchema,
  updateUserSchema,
} from "../schemas/userSchema.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserV1:
 *       type: object
 *       description: >-
 *         Usuário público da V1 (publicUserSelect). Não expõe campos da V2.
 *       required: [id, nome, email, papel, foto, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: Ada Lovelace
 *         email:
 *           type: string
 *           format: email
 *           example: ada@example.com
 *         papel:
 *           type: string
 *           enum: [PROFESSOR, ADMIN]
 *           example: PROFESSOR
 *         foto:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: https://example.com/ada.png
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserV1Response:
 *       type: object
 *       description: Envelope de item da V1.
 *       required: [success, data]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           description: Presente em POST, PATCH e DELETE; ausente em GET.
 *           example: Usuário criado com sucesso
 *         data:
 *           $ref: '#/components/schemas/UserV1'
 *     UserV1ListResponse:
 *       type: object
 *       description: Envelope de lista da V1.
 *       required: [success, data, total]
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserV1'
 *         total:
 *           type: integer
 *           example: 1
 *     CreateUserV1:
 *       type: object
 *       description: Corpo estrito; campos desconhecidos retornam 400.
 *       additionalProperties: false
 *       required: [nome, email]
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: 3 a 100 caracteres, sem espaços nas pontas
 *           example: Ada Lovelace
 *         email:
 *           type: string
 *           format: email
 *           description: Único; normalizado para minúsculas
 *           example: ada@example.com
 *         papel:
 *           type: string
 *           enum: [PROFESSOR, ADMIN]
 *           default: PROFESSOR
 *         foto:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL da foto ou null
 *     UpdateUserV1:
 *       type: object
 *       description: Corpo estrito com pelo menos um campo.
 *       additionalProperties: false
 *       minProperties: 1
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *         papel:
 *           type: string
 *           enum: [PROFESSOR, ADMIN]
 *         foto:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL da foto; null remove a referência
 */

/**
 * @swagger
 * /v1/users:
 *   post:
 *     tags: [Usuários V1]
 *     summary: Cria um usuário (V1)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserV1'
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV1Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post("/", validate(createUserSchema), userController.create);

/**
 * @swagger
 * /v1/users:
 *   get:
 *     tags: [Usuários V1]
 *     summary: Lista os usuários (V1)
 *     description: Do mais recente para o mais antigo.
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV1ListResponse'
 */
router.get("/", userController.getAll);

/**
 * @swagger
 * /v1/users/{id}:
 *   get:
 *     tags: [Usuários V1]
 *     summary: Busca um usuário por ID (V1)
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV1Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(idParamSchema, "params"), userController.getById);

/**
 * @swagger
 * /v1/users/{id}:
 *   patch:
 *     tags: [Usuários V1]
 *     summary: Atualiza parcialmente um usuário (V1)
 *     description: Envie ao menos um campo.
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserV1'
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV1Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateUserSchema),
  userController.update,
);

/**
 * @swagger
 * /v1/users/{id}:
 *   delete:
 *     tags: [Usuários V1]
 *     summary: Remove um usuário sem vínculos (V1)
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       200:
 *         description: Usuário removido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserV1Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.delete("/:id", validate(idParamSchema, "params"), userController.remove);

export default router;
