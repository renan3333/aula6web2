// ADICIONADO: módulo V2 de matérias; reutiliza contrato estável sem editar a V1.
import express from "express";
// ADICIONADO (aula 11): autenticação (quem é) e autorização (o que pode fazer).
import authenticate from "../../../middlewares/auth.js";
import authorize, { isAdmin } from "../../../middlewares/authorize.js";
import stableSubjectRoutes from "../../v1/routes/subjectRoutes.js";

const router = express.Router();

// ADICIONADO (aula 11): leitura (GET) segue pública; só as escritas passam por token.
// POST e PATCH: PROFESSOR ou ADMIN.
router.post("/", authenticate, authorize("PROFESSOR", "ADMIN"));
router.patch("/:id", authenticate, authorize("PROFESSOR", "ADMIN"));
// DELETE: exclusivo de ADMIN.
router.delete("/:id", authenticate, isAdmin);

// ADICIONADO: compõe validação, controller e service existentes de Subject.
router.use("/", stableSubjectRoutes);

export default router;
