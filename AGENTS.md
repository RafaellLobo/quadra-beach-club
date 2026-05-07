# Instruções para Agentes — Quadra Beach Club

## 1. Contexto do Projeto

O **Quadra Beach Club** é um SaaS B2B2C multi-tenant para gestão operacional e financeira de arenas de esportes de areia, como Beach Tennis, Futevôlei e modalidades relacionadas.

O sistema deve atender múltiplas arenas de forma isolada, garantindo que cada tenant acesse somente seus próprios dados.

### Hierarquia principal

- **Arena/Admin da Arena**
  - Tenant principal.
  - Acessa visão global da própria arena.
  - Gerencia professores, turmas, alunos, pagamentos, aulas avulsas e métricas financeiras da própria operação.

- **Professor**
  - Usuário operacional vinculado a uma arena.
  - Acessa apenas suas próprias turmas, alunos e informações permitidas.
  - Não deve acessar dados financeiros globais da arena, salvo regra explícita futura.

- **Aluno/Cliente**
  - Entidade final do domínio.
  - Pode estar vinculada a turmas, mensalidades, pagamentos ou aulas avulsas.
  - Não deve ser assumido como operador principal do sistema sem especificação explícita.

- **Fast-entry**
  - Fluxo operacional usado por usuário autorizado da arena para registrar aula avulsa, presença ou pagamento rápido.
  - Não assumir que o aluno executa esse fluxo por conta própria.

---

## 2. Stack Técnica

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Python conforme runtime real do projeto
- FastAPI
- Pydantic v2
- Uvicorn
- Arquitetura ASGI

### Banco/Auth

- Supabase PostgreSQL
- Supabase Auth / GoTrue
- JWT
- Row Level Security nativo do PostgreSQL

### Infraestrutura futura esperada

- Docker
- CI/CD
- Deploy frontend: Vercel, Cloudflare Pages ou equivalente
- Deploy backend: Render, Railway, Fly.io, AWS ECS ou equivalente
- CORS restritivo em produção

---

## 3. Princípio Arquitetural Central

O frontend é somente camada de apresentação.

O backend é a única **Source of Truth** autorizada a aplicar regras de negócio, validar contratos e intermediar acesso ao banco.

O banco, por meio de RLS, é a barreira final de isolamento multi-tenant.

### Regra obrigatória

Nunca confiar em regra de segurança implementada somente no frontend.

A segurança deve existir em três camadas:

1. Backend
2. RLS/PostgreSQL
3. Contratos de dados bem definidos

---

## 4. Modo Econômico de Contexto para Codex

O agente deve trabalhar com economia máxima de tokens e memória de contexto.

Essa regra vale para a forma de análise e resposta ao usuário, não para a qualidade da implementação.

A implementação deve continuar seguindo padrão de produção.

### Regras principais

1. Não explique o óbvio.
2. Não reescreva arquivos inteiros se apenas um trecho precisa ser alterado.
3. Antes de ler muitos arquivos, identifique os arquivos realmente necessários.
4. Não abra arquivos grandes sem necessidade.
5. Prefira buscar por nomes de funções, classes, rotas, endpoints, tabelas ou mensagens de erro.
6. Quando encontrar o ponto do problema, pare de procurar e foque na correção.
7. Não repita contexto já conhecido.
8. Não faça resumo longo do projeto, salvo pedido explícito.
9. Responda sempre de forma objetiva, contendo:
   - problema encontrado;
   - arquivo/trecho afetado;
   - alteração feita ou sugerida;
   - como testar.
10. Se precisar investigar, faça em etapas curtas e comunique apenas o essencial.

### Fluxo obrigatório antes de alterar código

Antes de qualquer alteração, o agente deve:

1. Entender a tarefa em uma frase.
2. Listar no máximo 3 arquivos que provavelmente precisam ser analisados.
3. Ler apenas esses arquivos primeiro.
4. Fazer a menor alteração possível.
5. Evitar refatorações grandes sem necessidade.
6. Rodar apenas testes ou comandos diretamente relacionados à mudança.
7. Entregar resumo curto ao final.

### Restrições

- Não criar arquitetura nova sem necessidade.
- Não alterar padrão do projeto sem justificativa.
- Não adicionar dependências sem justificativa técnica.
- Não fazer melhorias paralelas fora do escopo.
- Não gerar documentação longa automaticamente.
- Não repetir código inteiro na resposta.
- Não explicar conceitos básicos, salvo pedido explícito.
- Não modificar banco, migrations ou policies sem instrução explícita.

### Quando o contexto ficar grande

Gerar um resumo compacto contendo apenas:

- objetivo da tarefa;
- arquivos importantes;
- decisões tomadas;
- alterações feitas;
- pendências;
- próximos passos.

Depois continuar a partir desse resumo e descartar detalhes irrelevantes.

### Formato preferido de resposta

```md
Resumo:

- ...

Arquivos alterados:

- ...

O que foi feito:

- ...

Como testar:

- ...

Pendências:

- ...
```

---

## 5. Postura Técnica Esperada

O agente deve atuar como Engenheiro Staff/CTO.

### Obrigatório

- Código direto, limpo, modular e pronto para produção.
- Separação rigorosa de responsabilidades.
- Tipagem forte sempre que possível.
- Tratamento explícito de erros.
- Contratos claros entre frontend, backend e banco.
- Atenção constante a multi-tenancy, RBAC e vazamento de dados.
- Explicitar trade-offs quando houver decisão relevante.

### Proibido

- Linguagem motivacional genérica.
- Refatoração ampla sem necessidade.
- Alterar comportamento público sem mapear impacto.
- Criar abstrações prematuras.
- Inserir código didático ou ingênuo.
- Ignorar riscos de segurança.
- Implementar regra crítica somente no frontend.

---

## 6. Modelo Multi-tenant

`arena_id` é o identificador do tenant principal.

Toda tabela de domínio operacional ou financeiro deve possuir `arena_id`, salvo tabela global explicitamente justificada.

### Regras

- O frontend nunca deve enviar `arena_id` em payloads de criação.
- O backend nunca deve confiar em `arena_id` vindo do cliente.
- O tenant deve ser inferido por:
  - JWT autenticado;
  - tabela `usuarios`;
  - trigger segura no PostgreSQL;
  - policy RLS baseada em `auth.uid()`;
  - ou combinação explícita desses mecanismos.

### Garantia obrigatória

A regra de isolamento deve continuar funcionando mesmo se:

- o frontend for manipulado;
- o usuário alterar payloads manualmente;
- a requisição for feita via Postman/cURL;
- filtros da aplicação forem removidos;
- componentes React forem inspecionados ou modificados;
- rotas protegidas forem acessadas diretamente.

---

## 7. Filtros de Aplicação vs Segurança Real

Filtros como:

```ts
.eq("arena_id", user.arena_id)
.eq("professor_id", user.id)
.eq("turma_id", turmaId)
```

podem ser usados para:

- performance;
- redução de payload;
- clareza de query;
- melhoria de UX;
- limitação explícita de escopo operacional.

Porém, nunca devem ser tratados como mecanismo primário de segurança.

### Regra correta

A aplicação pode filtrar.

O banco deve proteger.

Toda query deve continuar segura mesmo se o filtro da aplicação for esquecido, removido ou manipulado.

---

## 8. RBAC

Papéis atuais previstos:

```txt
admin_arena
professor
aluno
```

O papel `aluno` só deve ser implementado como usuário autenticado se houver requisito explícito.

### Regras

- `admin_arena` acessa dados da própria arena.
- `professor` acessa apenas seus próprios dados permitidos.
- `aluno` ou `cliente` não deve receber permissões administrativas por inferência.
- Não criar papéis novos sem justificar impacto no banco, backend, frontend e RLS.

### Frontend

Guards no React são apenas camada de UX.

Eles não substituem validação no backend nem RLS no banco.

### Backend

Toda rota sensível deve validar autenticação e autorização.

### Banco

Toda tabela sensível deve possuir RLS compatível com o modelo de papéis.

---

## 9. Fluxo Esperado do Backend

Fluxo padrão:

```txt
HTTP Request
-> CORS Middleware
-> Depends(verify_jwt)
-> FastAPI Endpoint
-> get_user_db(token)
-> Supabase Client com JWT do usuário
-> Supabase/PostgREST
-> PostgreSQL RLS
-> Pydantic Response Model
-> HTTP Response
```

### Regras

- A API deve receber o token via `Authorization: Bearer <token>`.
- O token deve ser validado antes da rota executar regra de negócio.
- O cliente Supabase usado na requisição deve carregar o JWT do usuário.
- A resposta deve ser filtrada por `response_model`.
- Não retornar payload bruto do Supabase diretamente para o frontend.

---

## 10. Autenticação JWT

### Modelo atual esperado

- JWT emitido pelo Supabase Auth.
- Validação stateless no backend.
- Algoritmo HS256 quando usando Supabase Legacy JWT Secret.
- Extração de `sub` como identificador do usuário autenticado.

### Regras

- Não consultar o banco apenas para validar sessão se a arquitetura atual for stateless.
- Não registrar JWT em logs.
- Não retornar token em mensagens de erro.
- Não aceitar token ausente, expirado ou inválido.
- Retornar `401 Unauthorized` para falha de autenticação.
- Retornar `403 Forbidden` para usuário autenticado sem permissão.

### Risco conhecido

Validação stateless não permite revogação imediata de acesso até expiração do token.

Mitigações futuras possíveis:

- refresh token rotation;
- blacklist em Redis;
- sessões server-side;
- verificação periódica de status do usuário;
- redução do tempo de vida do access token.

Não implementar essas mitigações sem requisito explícito.

---

## 11. Supabase Client

### Regra crítica

Nunca usar `service_role` em rotas padrão de CRUD.

### Permitido

Usar `anon_key` acoplada ao JWT do usuário.

### Proibido

- Usar `service_role` para contornar RLS em fluxo comum.
- Criar endpoint administrativo com `service_role` sem justificativa formal.
- Expor `service_role` no frontend.
- Versionar secrets reais.
- Logar credenciais.

### Exceções

`service_role` só pode ser considerado em rotinas administrativas internas, scripts controlados ou jobs de manutenção, sempre fora do fluxo normal de usuário e com justificativa explícita.

---

## 12. RLS — Row Level Security

Toda tabela sensível deve possuir RLS habilitado.

### Tabelas sensíveis esperadas

- `arenas`
- `usuarios`
- `turmas`
- `alunos`
- `pagamentos`
- quaisquer tabelas futuras de:
  - aulas;
  - presenças;
  - mensalidades;
  - planos;
  - cobranças;
  - repasses;
  - convites;
  - auditoria operacional.

### Policies obrigatórias

Cada tabela sensível deve ter policies explícitas para:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`, quando aplicável

### Proibido

- `USING (true)` em tabela de domínio sensível.
- `WITH CHECK (true)` em tabela de domínio sensível.
- Policy genérica sem vínculo com `auth.uid()`, `arena_id` ou relacionamento autorizado.
- Desativar RLS para resolver bug de aplicação.
- Usar `service_role` para mascarar erro de policy.

### Matriz mínima de validação

Testar policies com:

- admin da arena A;
- admin da arena B;
- professor da arena A;
- professor da arena B;
- aluno/cliente, se houver auth para esse papel;
- usuário autenticado sem linha correspondente em `usuarios`;
- usuário sem token.

---

## 13. Banco de Dados

### Estrutura de domínio atual esperada

Tabelas conhecidas:

```txt
arenas
usuarios
turmas
alunos
pagamentos
```

### Regras

- Não alterar schema sem migration SQL versionada.
- Não assumir que o painel do Supabase é fonte da verdade.
- Não remover constraints sem justificativa.
- Não remover índices sem análise.
- Não alterar enum/roles sem mapear impacto.
- Não criar relacionamento ambíguo entre arenas, professores, turmas e alunos.
- Não aceitar `arena_id` vindo do frontend em inserts sensíveis.

### Toda alteração estrutural deve declarar

- problema identificado;
- risco atual;
- impacto;
- rollback;
- queries afetadas;
- policies afetadas;
- endpoints afetados.

---

## 14. Migrations

### Obrigatório

Toda alteração estrutural deve ser feita por migration SQL versionada.

### Proibido sem autorização explícita

- `DROP TABLE`
- `TRUNCATE`
- `DELETE` sem `WHERE`
- reset de migrations
- recriação completa de schema
- alteração destrutiva em produção
- remoção de foreign keys
- remoção de constraints
- remoção de policies RLS
- alteração de tipo de coluna com perda de dados

### Padrão esperado

A migration deve ser:

- pequena;
- reversível quando possível;
- específica;
- alinhada ao domínio;
- acompanhada de justificativa curta.

---

## 15. Contratos Financeiros

Valores monetários nunca devem ser tratados como `float`.

### Banco

Usar uma das estratégias:

```txt
numeric(10,2)
```

ou

```txt
valor_centavos integer/bigint
```

### Python

Usar `Decimal` para valores monetários.

### TypeScript

Evitar cálculos financeiros críticos no frontend.

Quando exibir valores:

- formatar apenas para UI;
- não tratar formatação como dado de negócio;
- não confiar em valor calculado no cliente para persistência.

### Toda operação financeira deve registrar

- valor;
- tipo;
- status;
- data de competência;
- data de criação;
- arena_id;
- aluno_id ou cliente relacionado;
- usuário responsável;
- origem do lançamento, quando aplicável;
- referência externa, quando aplicável.

### Idempotência

Operações financeiras devem ser idempotentes quando houver risco de duplicidade.

Exemplos:

- retry do frontend;
- clique duplo;
- instabilidade de rede;
- webhook futuro de gateway;
- processamento assíncrono.

### Campos futuros recomendados

```txt
idempotency_key
external_reference
created_by
updated_by
paid_at
cancelled_at
cancellation_reason
```

Não adicionar sem necessidade imediata ou tarefa explícita.

---

## 16. Padrão de API

Toda rota deve possuir:

- schema de entrada;
- schema de saída;
- `response_model`;
- autenticação quando sensível;
- autorização quando aplicável;
- tratamento explícito de erro;
- status code semântico;
- contrato previsível para o frontend.

### Status codes

Usar semanticamente:

```txt
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

### Proibido

- Retornar payload bruto do Supabase diretamente.
- Retornar `dict[str, Any]` em rota pública sem necessidade.
- Expor colunas internas.
- Misturar regra de negócio complexa dentro do endpoint.
- Criar endpoints com nomes genéricos.
- Criar rotas públicas sem autenticação por descuido.

### Colunas que não devem vazar por padrão

- `deleted_at`
- campos internos de auditoria
- flags administrativas
- metadados sensíveis
- chaves externas desnecessárias
- qualquer segredo, token ou hash
- campos que não fazem parte da UI

---

## 17. Paginação, Ordenação e Filtros

Rotas de listagem devem prever:

- `limit`;
- `offset` ou cursor;
- ordenação explícita;
- filtros permitidos por contrato.

### Regras

- Não criar listagem ilimitada para dados operacionais.
- Não ordenar implicitamente.
- Não aceitar filtros arbitrários enviados pelo frontend.
- Validar valores máximos de `limit`.

### Padrão recomendado

```txt
limit padrão: 20 ou 50
limit máximo: 100
ordenação padrão: created_at desc ou campo de domínio explícito
```

---

## 18. Pydantic

Usar Pydantic v2.

### Para objetos com atributos/ORM

```python
from pydantic import BaseModel, ConfigDict

class ExampleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
```

### Para dicionários retornados pelo Supabase

A validação padrão do Pydantic já é suficiente.

Não afirmar que `from_attributes=True` é necessário para mapear dicionários do Supabase.

### Regras

- Não usar `Any` em schemas públicos sem justificativa.
- Não usar `dict` como response pública sem contrato.
- Não aceitar `arena_id` em payloads de criação sensíveis.
- Não aceitar campos de auditoria vindos do frontend.
- Separar schemas de create, update e response.
- Usar `Decimal` para dinheiro.
- Usar enums quando houver domínio fechado.
- Validar strings, datas e valores monetários.

### Exemplo de organização

```txt
schemas/
  turmas.py
  alunos.py
  pagamentos.py
```

Não criar essa estrutura sem necessidade ou sem alinhamento com o estado real do projeto.

---

## 19. Backend — Organização

Manter `main.py` limpo.

À medida que o projeto crescer, usar `APIRouter` por domínio.

### Estrutura sugerida

```txt
app/
  main.py
  core/
    config.py
    security.py
  db/
    supabase.py
  routers/
    turmas.py
    alunos.py
    pagamentos.py
  schemas/
    turmas.py
    alunos.py
    pagamentos.py
  services/
    turmas_service.py
    pagamentos_service.py
```

Essa estrutura é referência, não obrigação imediata.

Não reestruturar o projeto inteiro sem tarefa explícita.

### Regras

- Endpoints finos.
- Serviços para regra de negócio.
- Schemas para contratos.
- Core para configuração e segurança.
- DB layer para criação/injeção de cliente Supabase.
- Não misturar acesso a banco com lógica de UI.
- Não colocar regra financeira complexa diretamente no router.

---

## 20. FastAPI e I/O

O SDK REST do Supabase é síncrono.

### Risco

Chamadas síncronas dentro de endpoints `async def` podem bloquear o event loop.

### Regras

- Evitar chamadas Supabase dentro de loops.
- Evitar N+1 queries.
- Preferir queries agregadas quando possível.
- Considerar endpoint `def` para operações síncronas simples.
- Considerar offload/threadpool apenas quando necessário.
- Não migrar para `asyncpg` sem tarefa explícita.

### Alternativas futuras

- `asyncpg`
- PgBouncer
- SQL direto
- RPC segura
- views seguras
- materialized views para dashboards financeiros

---

## 21. Frontend — Princípios

O frontend apresenta dados.

O frontend não é fonte da verdade.

### Regras

- Não implementar autorização crítica apenas no React.
- Não espalhar token por componentes.
- Não chamar Supabase diretamente para dados de domínio se o backend é a Source of Truth.
- Não duplicar regra financeira crítica no frontend.
- Não persistir estado sensível sem necessidade.
- Não esconder botão como substituto de autorização real.

### Camadas esperadas

```txt
components/
pages/
hooks/
services/
types/
utils/
```

Não criar ou reorganizar pastas sem necessidade.

---

## 22. Frontend — Auth e Sessão

### Regras

- Login pode usar Supabase Auth no frontend.
- Dados de domínio devem passar pelo backend.
- O access token deve ser enviado ao backend via `Authorization: Bearer`.
- Centralizar HTTP client.
- Tratar sessão expirada.
- Tratar 401 e 403 de forma explícita.

### Estados obrigatórios em telas

Toda tela que consome API deve tratar:

- loading;
- empty state;
- error state;
- unauthorized;
- forbidden;
- success;
- retry quando aplicável.

### Armazenamento de token

Evitar espalhar token manualmente.

Se usar armazenamento padrão do Supabase no frontend, reconhecer risco de XSS.

Mitigação futura possível:

- HttpOnly cookies;
- BFF;
- CSP forte;
- sanitização de inputs;
- redução de superfície de scripts externos.

Não migrar para cookies sem tarefa explícita.

---

## 23. Frontend — RBAC e Guards

Guards no React servem para UX.

### Devem fazer

- Redirecionar usuário sem sessão.
- Bloquear visualmente rotas não permitidas.
- Ocultar menus incompatíveis com role.
- Exibir 403 amigável quando necessário.

### Não devem fazer

- Substituir backend.
- Substituir RLS.
- Decidir regra financeira.
- Permitir dados sensíveis no bundle.
- Confiar em role manipulável no client.

---

## 24. UI/UX Operacional

Este produto será usado em ambiente operacional de arena.

### Prioridades

- Fluxo rápido.
- Poucos cliques.
- Estados claros.
- Erros compreensíveis.
- Confirmação para ações financeiras.
- Boa legibilidade em recepção/celular/tablet.
- Inputs robustos para dinheiro, aluno, turma e data.

### Fast-entry

O fluxo de fast-entry deve priorizar:

- velocidade;
- validação mínima obrigatória;
- prevenção de duplicidade;
- feedback imediato;
- possibilidade futura de auditoria.

---

## 25. Variáveis de Ambiente

Nunca hardcode:

- Supabase URL;
- anon key;
- JWT secret;
- service role;
- URLs de produção;
- credenciais de banco;
- tokens;
- chaves privadas.

### Regras

- Toda variável nova deve entrar no `.env.example`.
- Secrets reais nunca devem ser versionados.
- Backend deve falhar rápido se variável crítica estiver ausente.
- Frontend só pode expor variáveis públicas seguras.
- Nunca expor `service_role` no frontend.

### Nomes recomendados

```txt
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_JWT_SECRET
BACKEND_CORS_ORIGINS
```

Não renomear variáveis existentes sem atualizar todo o projeto.

---

## 26. CORS

### Desenvolvimento

Permitir apenas origens locais necessárias.

### Produção

CORS deve ser restritivo.

### Proibido em produção

```txt
allow_origins=["*"]
allow_credentials=True
```

### Regras

- Definir origens por variável de ambiente.
- Não liberar todos os métodos sem necessidade.
- Não liberar todos os headers sem necessidade.
- Não mascarar erro de autenticação como problema de CORS.

---

## 27. Logging e Observabilidade

### Proibido logar

- JWT;
- refresh token;
- senha;
- secrets;
- payload financeiro sensível completo;
- dados pessoais desnecessários.

### Logs mínimos úteis

- request_id;
- user_id;
- arena_id quando disponível;
- rota;
- método HTTP;
- status code;
- tempo de resposta;
- erro resumido.

### Auditoria

Operações financeiras e administrativas críticas devem permitir auditoria futura.

Registrar quando aplicável:

- quem alterou;
- quando alterou;
- entidade afetada;
- valor anterior;
- valor novo;
- motivo;
- origem.

Não criar sistema completo de auditoria sem tarefa explícita.

---

## 28. Segurança

### Princípios

- Menor privilégio.
- Defesa em profundidade.
- Validação na borda.
- RLS como barreira final.
- Nenhum segredo no frontend.
- Nenhum dado cross-tenant.
- Nenhuma autorização baseada apenas em UI.

### OWASP relevante

Atenção especial a:

- broken access control;
- injection;
- insecure design;
- security misconfiguration;
- identification and authentication failures;
- vulnerable and outdated components.

### Proibido

- Montar query dinâmica insegura.
- Confiar em payload do cliente para autorização.
- Expor stack trace em produção.
- Retornar mensagens de erro com detalhes internos.
- Corrigir bug de permissão desabilitando RLS.
- Usar `service_role` como atalho.

---

## 29. Testes Mínimos Obrigatórios

Antes de considerar uma feature pronta, validar:

- usuário sem token recebe 401;
- token inválido recebe 401;
- usuário autenticado sem permissão recebe 403 ou lista vazia por RLS;
- admin da arena A não acessa dados da arena B;
- professor da arena A não acessa dados da arena B;
- professor acessa apenas suas próprias turmas/alunos;
- payload com `arena_id` manual é rejeitado ou ignorado;
- response não vaza colunas internas;
- operação financeira não usa `float`;
- listagem possui paginação quando aplicável;
- frontend trata loading, empty, error, 401 e 403;
- CORS não está aberto indevidamente em produção.

### Quando não houver testes automatizados

Informar objetivamente:

```md
Testes automatizados não encontrados.
Validação manual recomendada:

- ...
```

Não inventar teste executado.

---

## 30. Git e Edição

### Regras

- Não reestruturar diretórios inteiros sem necessidade.
- Não renomear arquivos públicos sem mapear impacto.
- Não alterar variáveis de ambiente sem atualizar `.env.example`.
- Não misturar refatoração ampla com feature de negócio.
- Não fazer mudanças paralelas fora do escopo.
- Não formatar projeto inteiro sem necessidade.
- Não alterar lockfile sem dependência real.

### Commits

Quando solicitado, commits devem ser:

- pequenos;
- rastreáveis;
- orientados a domínio;
- com mensagem clara.

Exemplos:

```txt
feat(auth): add protected login flow
fix(api): prevent raw supabase payload leak
refactor(turmas): isolate router schema contracts
```

---

## 31. Dependências

### Regras

- Não adicionar dependência sem justificar.
- Preferir dependências já presentes.
- Verificar lockfile antes de assumir gerenciador de pacotes.
- Não trocar biblioteca principal sem tarefa explícita.

### Frontend

Antes de instalar, verificar:

- `package.json`;
- lockfile existente;
- padrões já usados.

### Backend

Antes de instalar, verificar:

- `requirements.txt`;
- `pyproject.toml`;
- `poetry.lock`;
- `uv.lock`;
- ambiente real do projeto.

---

## 32. Comandos

Não assumir comandos sem verificar scripts existentes.

### Frontend

Verificar `package.json`.

Comandos comuns possíveis:

```bash
npm run dev
npm run build
npm run lint
```

### Backend

Verificar estrutura real antes.

Comandos comuns possíveis:

```bash
uvicorn app.main:app --reload
python -m pytest
```

Não afirmar que comando foi executado se não foi.

---

## 33. Regras para Alterações Grandes

Se a tarefa pedir “estruturar o projeto inteiro”, o agente deve primeiro fazer plano curto.

### Plano máximo

- objetivo;
- arquivos/pastas impactadas;
- ordem de execução;
- riscos;
- comandos de validação.

Depois executar em etapas pequenas.

### Proibido

- Reescrever projeto inteiro de uma vez.
- Criar arquitetura incompatível com a atual.
- Misturar backend, frontend, banco e deploy no mesmo patch sem necessidade.
- Criar código especulativo sem uso imediato.

---

## 34. Critério de Pronto

Uma entrega só pode ser considerada pronta quando:

- compila sem erros;
- não quebra contratos públicos;
- preserva RLS;
- não expõe dados cross-tenant;
- possui tratamento de erro adequado;
- mantém separação frontend/backend;
- usa schemas de entrada e saída;
- não vaza colunas internas;
- não adiciona dependências injustificadas;
- atualiza `.env.example` quando necessário;
- respeita o modelo SaaS B2B2C multi-tenant;
- informa como testar;
- informa limitações ou pendências reais.

---

## 35. Formato Final de Resposta do Agente

Toda resposta final após alteração deve seguir este formato compacto:

```md
Resumo:

- ...

Arquivos alterados:

- ...

O que foi feito:

- ...

Como testar:

- ...

Pendências:

- ...
```

### Se nenhum arquivo foi alterado

```md
Resumo:

- ...

Arquivos analisados:

- ...

Conclusão:

- ...

Próximo passo:

- ...
```

### Se houver erro

```md
Resumo:

- Não foi possível concluir a alteração.

Problema:

- ...

Arquivo/trecho afetado:

- ...

Causa provável:

- ...

Correção recomendada:

- ...

Como validar:

- ...
```

---

## 36. Regra Final

Em caso de conflito entre velocidade e segurança, priorizar segurança.

Em caso de conflito entre UX do frontend e autorização real, priorizar backend/RLS.

Em caso de conflito entre simplicidade e isolamento multi-tenant, priorizar isolamento.

Em caso de incerteza sobre banco, auth, RLS ou dados financeiros, interromper a alteração e solicitar o parâmetro mínimo necessário.

Não assumir permissões, tabelas, policies ou regras financeiras não especificadas.
