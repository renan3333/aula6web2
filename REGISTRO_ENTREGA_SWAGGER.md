# Registro da entrega — Atividade 10: documentação Swagger da V1

## Alterações

- `src/api/v1/routes/userRoutes.js`: componentes da V1 e uma anotação `@swagger` imediatamente acima de cada `router.*`.
- Componentes declarados: `UserV1`, `UserV1Response`, `UserV1ListResponse`, `CreateUserV1` e `UpdateUserV1`.
- Operações documentadas (tag `Usuários V1`): `GET /v1/users`, `POST /v1/users`, `GET /v1/users/{id}`, `PATCH /v1/users/{id}` e `DELETE /v1/users/{id}`.
- Reuso de `#/components/parameters/UserId` e das respostas `BadRequest`, `NotFound` e `Conflict`.
- Nenhuma alteração em controllers, services, schemas Zod, `src/config/swagger.js` ou na coleção Bruno.

## Contrato documentado

| Operação                | Respostas                                                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/users`         | 200 `{ success, data, total }`                                                                                                                |
| `POST /v1/users`        | 201, 400, 409; corpo estrito com `nome` (3 a 100) e `email` obrigatórios, `papel` (`PROFESSOR` ou `ADMIN`) e `foto` (URL ou `null`) opcionais |
| `GET /v1/users/{id}`    | 200 `{ success, data }`, 400, 404                                                                                                             |
| `PATCH /v1/users/{id}`  | 200, 400, 404, 409; corpo estrito com ao menos um campo                                                                                       |
| `DELETE /v1/users/{id}` | 200, 400, 404, 409                                                                                                                            |

O usuário devolvido lista em `properties` e em `required` exatamente: `id`, `nome`, `email`, `papel`, `foto`, `createdAt` e `updatedAt`.

## Comandos executados e resultados

Ambiente: PostgreSQL 16 local com as três migrations aplicadas por `psql` (o download do schema-engine do Prisma não estava acessível). Banco exclusivo de testes em `.env.test`.

| Comando                                                              | Resultado                                                                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`                                                       | 1 erro em `.vscode/launch.json` (comentário em JSON), arquivo que já existia e não foi alterado                                      |
| `npm run format:check`                                               | 2 avisos em arquivos que já existiam e não foram alterados: `REGISTRO_ENTREGA_PATCH.md` e `src/api/v2/controllers/userController.js` |
| `npm run test:pratica`                                               | 204 testes aprovados em 8 arquivos; `tests/swagger.test.js` com 6 aprovados e 6 ignorados por filtro                                 |
| `npm run test:atividade`                                             | 6 aprovados, 6 ignorados por filtro                                                                                                  |
| `npm test`                                                           | 9 arquivos, 216 testes aprovados                                                                                                     |
| `npm run test:coverage`                                              | 9 arquivos, 216 testes aprovados; cobertura total de linhas 90,93%                                                                   |
| `npm run serve:avaliacao` + Bruno CLI (`bru run --env Avaliacao -r`) | 320 requisições: 315 aprovadas e 5 reprovadas                                                                                        |
| `GET /api-docs/` e `GET /api-docs.json`                              | HTTP 200 nos dois                                                                                                                    |

### Sobre as 5 requisições reprovadas no Bruno

Todas são requisições `DELETE ... livre` das pastas de usuários V2, matérias e questões. O erro é `Post-Response Script Error` (HTTP 404 dentro de `bru.sendRequest`, no script de limpeza). A mesma coleção foi executada contra o código original, sem as alterações desta entrega, e deu o mesmo resultado: 315 aprovadas e as mesmas 5 reprovadas. Portanto a falha não vem da documentação.

### Limitações desta verificação

- A coleção Bruno recebida tem 320 requisições e não contém o grupo `10 Atividade - Swagger`, então a contagem de 335 do enunciado não pôde ser conferida.
- `tests/swagger.test.js` não veio no material. O arquivo usado é um teste equivalente escrito durante a atividade; substitua pelo teste oficial da aula e rode `npm run test:atividade` de novo.
- A conferência visual em `http://localhost:3000/api-docs/` (grupo Usuários V1 com cinco operações) deve ser feita no navegador.
