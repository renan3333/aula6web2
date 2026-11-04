import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

let spec;

beforeAll(async () => {
  const response = await request(app).get("/api-docs.json");
  spec = response.body;
});

describe("Prática — documentação base e V2", () => {
  it("publica a especificação OpenAPI 3.0.3 em /api-docs.json", async () => {
    const response = await request(app).get("/api-docs.json");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/application\/json/);
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.info).toMatchObject({
      title: "API do Gerador de Provas",
      version: "1.0.0",
    });
    expect(spec.servers).toEqual([
      { url: "/", description: "Mesmo servidor que publica esta documentação" },
    ]);
    expect(spec.tags.map((tag) => tag.name)).toEqual([
      "Health",
      "Usuários V1",
      "Usuários V2",
    ]);
  });

  it("publica a Swagger UI em /api-docs com o título configurado", async () => {
    const response = await request(app).get("/api-docs/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("API Gerador de Provas - Documentação");
  });

  it("declara componentes reutilizáveis", () => {
    expect(spec.components.parameters.UserId.schema).toMatchObject({
      type: "integer",
      minimum: 1,
      maximum: 2147483647,
    });
    expect(spec.components.schemas.ErrorResponse.required).toEqual([
      "success",
      "error",
      "timestamp",
      "path",
    ]);
    for (const name of ["BadRequest", "NotFound", "Conflict"]) {
      expect(
        spec.components.responses[name].content["application/json"].schema,
      ).toEqual({ $ref: "#/components/schemas/ErrorResponse" });
    }
  });

  it("documenta /health com 200 e 503", () => {
    const operation = spec.paths["/health"].get;

    expect(operation.tags).toEqual(["Health"]);
    expect(Object.keys(operation.responses).sort()).toEqual(["200", "503"]);
    expect(spec.components.schemas.HealthResponse.properties).toHaveProperty(
      "availableVersions",
    );
  });

  it("documenta todas as rotas de /v2/users", () => {
    const collection = spec.paths["/v2/users"];
    const item = spec.paths["/v2/users/{id}"];

    expect(Object.keys(collection.post.responses).sort()).toEqual(
      ["201", "400", "409", "413", "502", "503"].sort(),
    );
    expect(Object.keys(collection.post.requestBody.content).sort()).toEqual([
      "application/json",
      "multipart/form-data",
    ]);
    expect(Object.keys(collection.get.responses)).toEqual(["200"]);
    expect(Object.keys(item.get.responses).sort()).toEqual([
      "200",
      "400",
      "404",
    ]);
    expect(Object.keys(item.patch.responses).sort()).toEqual(
      ["200", "400", "404", "409", "413", "502", "503"].sort(),
    );
    expect(Object.keys(item.delete.responses).sort()).toEqual([
      "200",
      "400",
      "404",
      "409",
    ]);
    for (const operation of [
      collection.post,
      collection.get,
      item.get,
      item.patch,
      item.delete,
    ]) {
      expect(operation.tags).toEqual(["Usuários V2"]);
    }
  });

  it("usa foto binária nos schemas multipart da V2", () => {
    const { schemas } = spec.components;

    expect(schemas.CreateUserV2Multipart.properties.foto.format).toBe("binary");
    expect(schemas.UpdateUserV2Multipart.properties.foto.format).toBe("binary");
  });
});

describe("Atividade — documentação da V1", () => {
  const collection = () => spec.paths["/v1/users"];
  const item = () => spec.paths["/v1/users/{id}"];
  const statuses = (operation) => Object.keys(operation.responses).sort();

  it("documenta as cinco operações com a tag Usuários V1", () => {
    for (const operation of [
      collection().post,
      collection().get,
      item().get,
      item().patch,
      item().delete,
    ]) {
      expect(operation.tags).toEqual(["Usuários V1"]);
    }
  });

  it("GET /v1/users devolve { success, data, total } com 200", () => {
    const { schemas } = spec.components;

    expect(statuses(collection().get)).toEqual(["200"]);
    expect(schemas.UserV1ListResponse.required).toEqual([
      "success",
      "data",
      "total",
    ]);
    expect(schemas.UserV1ListResponse.properties.data.items).toEqual({
      $ref: "#/components/schemas/UserV1",
    });
  });

  it("GET /v1/users/{id} usa UserId e documenta 200, 400 e 404", () => {
    expect(item().get.parameters).toContainEqual({
      $ref: "#/components/parameters/UserId",
    });
    expect(statuses(item().get)).toEqual(["200", "400", "404"]);
    expect(spec.components.schemas.UserV1Response.required).toEqual([
      "success",
      "data",
    ]);
  });

  it("POST e PATCH têm corpo JSON obrigatório e estrito", () => {
    const { schemas } = spec.components;

    expect(collection().post.requestBody.required).toBe(true);
    expect(item().patch.requestBody.required).toBe(true);
    expect(statuses(collection().post)).toEqual(["201", "400", "409"]);
    expect(statuses(item().patch)).toEqual(["200", "400", "404", "409"]);
    expect(schemas.CreateUserV1.required).toEqual(["nome", "email"]);
    expect(schemas.CreateUserV1.additionalProperties).toBe(false);
    expect(schemas.CreateUserV1.properties.nome).toMatchObject({
      minLength: 3,
      maxLength: 100,
    });
    expect(schemas.CreateUserV1.properties.papel.enum).toEqual([
      "PROFESSOR",
      "ADMIN",
    ]);
    expect(schemas.CreateUserV1.properties.foto).toMatchObject({
      format: "uri",
      nullable: true,
    });
    expect(schemas.UpdateUserV1.additionalProperties).toBe(false);
    expect(schemas.UpdateUserV1.minProperties).toBe(1);
  });

  it("DELETE documenta 200, 400, 404 e 409", () => {
    expect(item().delete.parameters).toContainEqual({
      $ref: "#/components/parameters/UserId",
    });
    expect(statuses(item().delete)).toEqual(["200", "400", "404", "409"]);
  });

  it("o usuário V1 lista exatamente os campos devolvidos e erros usam ErrorResponse", () => {
    const user = spec.components.schemas.UserV1;
    const fields = [
      "id",
      "nome",
      "email",
      "papel",
      "foto",
      "createdAt",
      "updatedAt",
    ];

    expect(Object.keys(user.properties).sort()).toEqual([...fields].sort());
    expect([...user.required].sort()).toEqual([...fields].sort());
    for (const name of ["BadRequest", "NotFound", "Conflict"]) {
      expect(
        spec.components.responses[name].content["application/json"].schema,
      ).toEqual({ $ref: "#/components/schemas/ErrorResponse" });
    }
    expect(item().get.responses["404"]).toEqual({
      $ref: "#/components/responses/NotFound",
    });
    expect(collection().post.responses["409"]).toEqual({
      $ref: "#/components/responses/Conflict",
    });
  });
});
