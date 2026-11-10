// ADICIONADO: módulo V2 de questões; não altera arquivos ou regras da V1.
import express from "express";
// ADICIONADO (aula 11): autenticação (quem é) e autorização (o que pode fazer).
import authenticate from "../../../middlewares/auth.js";
import authorize, { isAdmin } from "../../../middlewares/authorize.js";
import stableQuestionRoutes from "../../v1/routes/questionRoutes.js";

const router = express.Router();

// ADICIONADO (aula 11): leitura (GET) segue pública; só as escritas passam por token.
// POST e PATCH: PROFESSOR ou ADMIN.
router.post("/", authenticate, authorize("PROFESSOR", "ADMIN"));
router.patch("/:id", authenticate, authorize("PROFESSOR", "ADMIN"));
// DELETE: exclusivo de ADMIN.
router.delete("/:id", authenticate, isAdmin);

// ADICIONADO: reaproveita integralmente o contrato estável de Question.
router.use("/", stableQuestionRoutes);

export default router;
