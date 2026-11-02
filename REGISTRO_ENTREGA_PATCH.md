# Registro da entrega — PATCH com upload opcional

## Implementação

- PATCH `/v2/users/:id` valida o ID antes do parser de arquivo.
- O parser Multer executa antes da validação do corpo.
- Arquivo no campo `foto` é opcional e tem limite de 5 MiB.
- Arquivos JPEG, PNG, GIF e WebP são aceitos; arquivos vazios, MIME não permitido, campo inesperado/repetido e tamanho excedido são rejeitados.
- O service faz o upload e persiste a URL; o controller não implementa o SDK.
- PATCH sem arquivo preserva a foto quando `foto` é omitida; `foto: null` remove apenas a referência; URL válida substitui a referência.
- Quando arquivo e URL válida são enviados juntos, o arquivo tem prioridade.
- V1 e demais recursos permanecem sem alterações intencionais.

## Resultados informados no terminal

| Comando | Resultado informado |
|---|---|
| `npm run test:pratica` | 3 testes aprovados; 2 ignorados por filtro |
| `npm run test:atividade` | 2 testes aprovados; 3 ignorados por filtro |

## Verificações ainda necessárias antes da entrega

Executar na raiz do projeto, com `.env.test` apontando para banco exclusivo de testes:

```bash
npm run lint
npm run format:check
npx prisma validate
npx prisma migrate status
npm run test:pratica
npm run test:atividade
npm test
```

Depois iniciar `npm run serve:avaliacao` e executar a coleção Bruno inteira conforme o passo 12 do material da aula. Registrar aqui a saída real de cada comando.

> Os testes de integração já informados usam o stub local do Uploadcare. Eles não comprovam, por si só, um upload real com a Public Key do projeto.
