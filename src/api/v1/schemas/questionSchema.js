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

// Helper para dificuldade de 1 a 3 (aceita número ou texto decimal, rejeita booleanos e arrays)
const dificuldadeSchema = z.preprocess((val) => {
  if (typeof val === "boolean" || Array.isArray(val) || val === null || val === undefined) {
    return val;
  }
  if (typeof val === "string" && val.trim() !== "") {
    const num = Number(val);
    return Number.isInteger(num) ? num : val;
  }
  return val;
}, z.number().int().min(1).max(3));

// Campo opcional no POST/PATCH: string com trim (1 a 500 caracteres) ou null
const respostaCorretaSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .nullable()
  .optional();

// Validação de parâmetro :id em GET, PATCH e DELETE
export const idParamSchema = z.object({
  id: positiveIdSchema,
});

// POST /questions
export const createQuestionSchema = z
  .object({
    enunciado: z.string().trim().min(3).max(500),
    dificuldade: dificuldadeSchema,
    respostaCorreta: respostaCorretaSchema,
    subjectId: positiveIdSchema,
    authorId: positiveIdSchema,
    ativa: z.boolean().optional(),
  })
  .strict();

// PATCH /questions/:id
export const updateQuestionSchema = z
  .object({
    enunciado: z.string().trim().min(3).max(500).optional(),
    dificuldade: dificuldadeSchema.optional(),
    respostaCorreta: respostaCorretaSchema,
    subjectId: positiveIdSchema.optional(),
    authorId: positiveIdSchema.optional(),
    ativa: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "PATCH não pode ficar vazio",
  });