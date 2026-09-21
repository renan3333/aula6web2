import { z } from "zod";

// Helper para ID numérico positivo (aceita número ou string decimal, rejeita booleanos e arrays)
const positiveIdSchema = z.preprocess((val) => {
  if (typeof val === "boolean" || Array.isArray(val) || val === null || val === undefined) {
    return val;
  }
  if (typeof val === "string" && val.trim() !== "") {
    const num = Number(val);
    return Number.isInteger(num) ? num : val;
  }
  return val;
}, z.number().int().positive().max(2147483647));

// Validação de parâmetro :id em GET, PATCH e DELETE
export const idParamSchema = z.object({
  id: positiveIdSchema,
});

// POST /subjects
export const createSubjectSchema = z
  .object({
    nome: z.string().trim().min(3).max(100),
    professorId: positiveIdSchema,
    ativa: z.boolean().optional(),
  })
  .strict();

// PATCH /subjects/:id
export const updateSubjectSchema = z
  .object({
    nome: z.string().trim().min(3).max(100).optional(),
    professorId: positiveIdSchema.optional(),
    ativa: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Pelo menos um campo aceito deve ser fornecido",
  });