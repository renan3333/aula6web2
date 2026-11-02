// ADICIONADO: módulo V2 de questões; não altera arquivos ou regras da V1.
import express from "express";
import stableQuestionRoutes from "../../v1/routes/questionRoutes.js";

const router = express.Router();

// ADICIONADO: reaproveita integralmente o contrato estável de Question.
router.use("/", stableQuestionRoutes);

export default router;
