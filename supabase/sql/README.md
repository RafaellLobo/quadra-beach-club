# Supabase SQL Scripts

Scripts versionados do banco do projeto Quadra Beach Club.

## Ordem de execução

1. `001_schema_base.sql`
2. `002_rls_policies.sql`
3. `003_seed_dev.example.sql`

## Descrição

### `001_schema_base.sql`

Cria o schema base do banco:

- arenas
- usuarios
- arena_usuarios
- professores
- arena_professores
- alunos
- arena_alunos
- turmas
- matriculas
- pagamentos

Também cria constraints, foreign keys, índices, triggers e comentários.

### `002_rls_policies.sql`

Habilita Row Level Security e cria as policies para:

- admin master
- admin da arena
- professor

Alunos não acessam a plataforma.

### `003_seed_dev.example.sql`

Arquivo de exemplo para popular dados mínimos de desenvolvimento.

Não deve conter secrets nem IDs reais sensíveis em repositório público.

## Segurança

Nunca commitar:

- `.env`
- JWT secret
- service_role key
- senhas
- tokens
- seed local com dados sensíveis

Para seeds locais com IDs reais, use arquivos terminados em `.local.sql`.
