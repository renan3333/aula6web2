// src/config/swagger.js
import swaggerJsdoc from "swagger-jsdoc";

/** Especificação base OpenAPI 3.0.3; as rotas entram via blocos @swagger. */
const options = {
  // Falha na inicialização se algum bloco @swagger tiver YAML/OpenAPI inválido.
  failOnErrors: true,
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API do Gerador de Provas",
      version: "1.0.0",
      description:
        "API para gerenciar usuários, matérias e questões do Gerador de Provas.",
    },
    servers: [
      {
        url: "/",
        description: "Mesmo servidor que publica esta documentação",
      },
    ],
    tags: [
      { name: "Health", description: "Monitoramento da API e do banco" },
      { name: "Usuários V1", description: "Contrato original de usuários" },
      {
        name: "Usuários V2",
        description: "Contrato V2 de usuários, com upload de foto",
      },
    ],
    components: {
      parameters: {
        UserId: {
          name: "id",
          in: "path",
          required: true,
          description: "ID numérico do usuário",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 2147483647,
            example: 1,
          },
        },
      },
      schemas: {
        // Espelha o JSON produzido por src/middlewares/errorHandler.js.
        ErrorResponse: {
          type: "object",
          required: ["success", "error", "timestamp", "path"],
          properties: {
            success: { type: "boolean", enum: [false], example: false },
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: { type: "string", example: "VALIDATION_ERROR" },
                message: {
                  type: "string",
                  example: "Dados de entrada inválidos",
                },
                details: {
                  type: "array",
                  description: "Detalhes por campo, quando existirem",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string", example: "email" },
                      message: { type: "string", example: "Email inválido" },
                    },
                  },
                },
                hint: { type: "string", description: "Dica opcional" },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2026-11-03T12:00:00.000Z",
            },
            path: { type: "string", example: "/" },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Dados de entrada inválidos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Dados de entrada inválidos",
                  details: [{ field: "id", message: "ID deve ser positivo" }],
                },
                timestamp: "2026-11-03T12:00:00.000Z",
                path: "/abc",
              },
            },
          },
        },
        NotFound: {
          description: "Recurso não encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                error: {
                  code: "NOT_FOUND",
                  message: "Usuário com ID 999 não encontrado",
                },
                timestamp: "2026-11-03T12:00:00.000Z",
                path: "/999",
              },
            },
          },
        },
        Conflict: {
          description: "Conflito com o estado atual dos dados",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                error: { code: "CONFLICT", message: "E-mail já cadastrado" },
                timestamp: "2026-11-03T12:00:00.000Z",
                path: "/",
              },
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/app.js",
    "./src/api/v1/routes/*.js",
    "./src/api/v2/routes/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
