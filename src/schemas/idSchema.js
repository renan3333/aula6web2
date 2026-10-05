import { z } from "zod";

/** Aceita números ou texto decimal, nunca booleanos, arrays ou objetos. */
export const numericInputSchema = z.union([
  z.number(),
  z.string().regex(/^\d+$/, "Use um número inteiro em formato decimal"),
]);

/** ID positivo limitado ao Int de 32 bits usado pelo schema PostgreSQL. */
export const positiveIdSchema = numericInputSchema.pipe(
  z.coerce
    .number()
    .int("ID deve ser inteiro")
    .positive("ID deve ser positivo")
    .max(2147483647, "ID excede o limite do banco"),
);

/** Valida o objeto de parâmetros da requisição (req.params = { id }) */
export const idParamSchema = z.object({
  id: positiveIdSchema,
});

/** Alias para compatibilidade caso alguma rota busque por idSchema */
export const idSchema = idParamSchema;