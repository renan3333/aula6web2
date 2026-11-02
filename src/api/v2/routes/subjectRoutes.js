// ADICIONADO: módulo V2 de matérias; reutiliza contrato estável sem editar a V1.
import express from "express";
import stableSubjectRoutes from "../../v1/routes/subjectRoutes.js";

const router = express.Router();

// ADICIONADO: compõe validação, controller e service existentes de Subject.
router.use("/", stableSubjectRoutes);

export default router;
