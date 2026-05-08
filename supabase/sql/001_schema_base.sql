-- ============================================================
-- QUADRA BEACH CLUB — HARD RESET DO SCHEMA BASE
-- ============================================================
-- ATENÇÃO:
-- Este script remove as tabelas operacionais atuais e recria
-- o modelo correto para SaaS multi-tenant B2B2C.
--
-- Este bloco NÃO cria RLS ainda.
-- RLS será aplicado no próximo bloco.
-- ============================================================


-- ============================================================
-- 0. EXTENSÕES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 1. DROP CONTROLADO DAS TABELAS ANTIGAS
-- ============================================================

DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS matriculas CASCADE;
DROP TABLE IF EXISTS turmas CASCADE;
DROP TABLE IF EXISTS arena_alunos CASCADE;
DROP TABLE IF EXISTS alunos CASCADE;
DROP TABLE IF EXISTS arena_professores CASCADE;
DROP TABLE IF EXISTS professores CASCADE;
DROP TABLE IF EXISTS arena_usuarios CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS arenas CASCADE;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;


-- ============================================================
-- 2. FUNÇÃO AUXILIAR PARA updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 3. ARENAS
-- ============================================================
-- Tenant principal do SaaS.
-- Cada arena representa um cliente B2B.

CREATE TABLE arenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(255) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ativa'
        CHECK (status IN ('ativa', 'inativa')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TRIGGER trg_arenas_set_updated_at
BEFORE UPDATE ON arenas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 4. USUÁRIOS
-- ============================================================
-- Usuários que acessam a plataforma.
-- Alunos NÃO entram aqui.
--
-- id referencia auth.users(id) do Supabase.

CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    nome VARCHAR(255) NOT NULL,

    is_master_admin BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TRIGGER trg_usuarios_set_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 5. VÍNCULO USUÁRIO ↔ ARENA
-- ============================================================
-- Define o papel de um usuário dentro de uma arena.
--
-- Um mesmo usuário pode:
-- - ser admin_arena na Arena A;
-- - ser professor na Arena B;
-- - ser professor na Arena C.
--
-- Admin master não precisa estar vinculado a todas as arenas.

CREATE TABLE arena_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    arena_id UUID NOT NULL REFERENCES arenas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin_arena', 'professor')),

    status VARCHAR(20) NOT NULL DEFAULT 'ativo'
        CHECK (status IN ('ativo', 'inativo')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT uq_arena_usuarios_arena_usuario
        UNIQUE (arena_id, usuario_id),

    CONSTRAINT uq_arena_usuarios_arena_usuario_role
        UNIQUE (arena_id, usuario_id, role)
);

CREATE TRIGGER trg_arena_usuarios_set_updated_at
BEFORE UPDATE ON arena_usuarios
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 6. PROFESSORES
-- ============================================================
-- Perfil global do professor.
--
-- Professor é um usuário do sistema.
-- Dados específicos por arena ficam em arena_professores.

CREATE TABLE professores (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,

    telefone VARCHAR(20),
    documento VARCHAR(30),
    observacoes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TRIGGER trg_professores_set_updated_at
BEFORE UPDATE ON professores
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 7. VÍNCULO PROFESSOR ↔ ARENA
-- ============================================================
-- Define o professor atuando em uma arena específica.
--
-- A comissão pertence a este vínculo, porque o mesmo professor
-- pode ter percentuais diferentes em arenas diferentes.

CREATE TABLE arena_professores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    arena_id UUID NOT NULL,
    professor_id UUID NOT NULL,

    -- coluna técnica para garantir via FK que o vínculo em arena_usuarios
    -- possui role = 'professor'
    role VARCHAR(20) NOT NULL DEFAULT 'professor'
        CHECK (role = 'professor'),

    comissao_percentual NUMERIC(5, 2)
        CHECK (
            comissao_percentual IS NULL
            OR (comissao_percentual >= 0 AND comissao_percentual <= 100)
        ),

    status VARCHAR(20) NOT NULL DEFAULT 'ativo'
        CHECK (status IN ('ativo', 'inativo')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT fk_arena_professores_professor
        FOREIGN KEY (professor_id)
        REFERENCES professores(usuario_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_arena_professores_arena_usuario_professor
        FOREIGN KEY (arena_id, professor_id, role)
        REFERENCES arena_usuarios(arena_id, usuario_id, role)
        ON DELETE CASCADE,

    CONSTRAINT uq_arena_professor
        UNIQUE (arena_id, professor_id),

    CONSTRAINT uq_arena_professores_id_arena
        UNIQUE (id, arena_id)
);

CREATE TRIGGER trg_arena_professores_set_updated_at
BEFORE UPDATE ON arena_professores
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 8. ALUNOS
-- ============================================================
-- Alunos são entidades operacionais.
-- Eles NÃO acessam a plataforma neste MVP.
--
-- Um aluno pode estar em várias arenas por meio de arena_alunos.

CREATE TABLE alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    documento VARCHAR(30),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TRIGGER trg_alunos_set_updated_at
BEFORE UPDATE ON alunos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 9. VÍNCULO ALUNO ↔ ARENA
-- ============================================================
-- Permite que o mesmo aluno esteja cadastrado em várias arenas.

CREATE TABLE arena_alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    arena_id UUID NOT NULL REFERENCES arenas(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'ativo'
        CHECK (status IN ('ativo', 'inativo')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT uq_arena_aluno
        UNIQUE (arena_id, aluno_id),

    CONSTRAINT uq_arena_alunos_id_arena
        UNIQUE (id, arena_id)
);

CREATE TRIGGER trg_arena_alunos_set_updated_at
BEFORE UPDATE ON arena_alunos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 10. TURMAS
-- ============================================================
-- Turma pertence a uma arena e a um professor vinculado àquela arena.
--
-- arena_professor_id evita o erro de vincular turma de uma arena
-- a um professor de outra arena.

CREATE TABLE turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    arena_id UUID NOT NULL,
    arena_professor_id UUID NOT NULL,

    nome VARCHAR(255) NOT NULL,
    valor_mensalidade NUMERIC(10, 2) NOT NULL
        CHECK (valor_mensalidade >= 0),

    status VARCHAR(20) NOT NULL DEFAULT 'ativa'
        CHECK (status IN ('ativa', 'inativa', 'encerrada')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT fk_turmas_arena
        FOREIGN KEY (arena_id)
        REFERENCES arenas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_turmas_arena_professor_mesma_arena
        FOREIGN KEY (arena_professor_id, arena_id)
        REFERENCES arena_professores(id, arena_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_turmas_id_arena
        UNIQUE (id, arena_id)
);

CREATE TRIGGER trg_turmas_set_updated_at
BEFORE UPDATE ON turmas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 11. MATRÍCULAS
-- ============================================================
-- Representa o vínculo histórico do aluno com uma turma.
--
-- Substitui o antigo alunos.turma_id.
-- Isso permite histórico e evita que pagamentos antigos mudem
-- de contexto quando o aluno troca de turma.

CREATE TABLE matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    arena_id UUID NOT NULL,
    arena_aluno_id UUID NOT NULL,
    turma_id UUID NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ativa'
        CHECK (status IN ('ativa', 'inativa', 'encerrada', 'cancelada')),

    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT fk_matriculas_arena
        FOREIGN KEY (arena_id)
        REFERENCES arenas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_matriculas_arena_aluno_mesma_arena
        FOREIGN KEY (arena_aluno_id, arena_id)
        REFERENCES arena_alunos(id, arena_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_matriculas_turma_mesma_arena
        FOREIGN KEY (turma_id, arena_id)
        REFERENCES turmas(id, arena_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_matriculas_id_arena
        UNIQUE (id, arena_id),

    CONSTRAINT chk_matriculas_datas
        CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

CREATE TRIGGER trg_matriculas_set_updated_at
BEFORE UPDATE ON matriculas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE UNIQUE INDEX uq_matricula_ativa_por_aluno_turma
ON matriculas (arena_aluno_id, turma_id)
WHERE status = 'ativa';


-- ============================================================
-- 12. PAGAMENTOS
-- ============================================================
-- Principal tabela fato financeira.
--
-- Guarda snapshots de contexto:
-- - arena;
-- - aluno vinculado à arena;
-- - matrícula, quando aplicável;
-- - turma, quando aplicável;
-- - professor vinculado à arena, quando aplicável.
--
-- Isso evita erro histórico caso aluno/professor/turma mudem depois.

CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    arena_id UUID NOT NULL,
    arena_aluno_id UUID NOT NULL,

    matricula_id UUID,
    turma_id UUID,
    arena_professor_id UUID,

    registrado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('mensalidade', 'avulso')),

    valor NUMERIC(10, 2) NOT NULL
        CHECK (valor >= 0),

    status VARCHAR(20) NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),

    competencia DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,

    observacoes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT fk_pagamentos_arena
        FOREIGN KEY (arena_id)
        REFERENCES arenas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pagamentos_arena_aluno_mesma_arena
        FOREIGN KEY (arena_aluno_id, arena_id)
        REFERENCES arena_alunos(id, arena_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_pagamentos_matricula_mesma_arena
        FOREIGN KEY (matricula_id, arena_id)
        REFERENCES matriculas(id, arena_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_pagamentos_turma_mesma_arena
        FOREIGN KEY (turma_id, arena_id)
        REFERENCES turmas(id, arena_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_pagamentos_arena_professor_mesma_arena
        FOREIGN KEY (arena_professor_id, arena_id)
        REFERENCES arena_professores(id, arena_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_pagamentos_data_pagamento
        CHECK (
            data_pagamento IS NULL
            OR status IN ('pago', 'cancelado')
        )
);

CREATE TRIGGER trg_pagamentos_set_updated_at
BEFORE UPDATE ON pagamentos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 13. ÍNDICES CRÍTICOS
-- ============================================================

-- Arenas
CREATE INDEX idx_arenas_status
ON arenas(status);

-- Usuários
CREATE INDEX idx_usuarios_master_admin
ON usuarios(is_master_admin);

-- Arena usuários
CREATE INDEX idx_arena_usuarios_arena
ON arena_usuarios(arena_id);

CREATE INDEX idx_arena_usuarios_usuario
ON arena_usuarios(usuario_id);

CREATE INDEX idx_arena_usuarios_role_status
ON arena_usuarios(role, status);

-- Professores
CREATE INDEX idx_arena_professores_arena
ON arena_professores(arena_id);

CREATE INDEX idx_arena_professores_professor
ON arena_professores(professor_id);

CREATE INDEX idx_arena_professores_status
ON arena_professores(status);

-- Alunos
CREATE INDEX idx_arena_alunos_arena
ON arena_alunos(arena_id);

CREATE INDEX idx_arena_alunos_aluno
ON arena_alunos(aluno_id);

CREATE INDEX idx_arena_alunos_status
ON arena_alunos(status);

-- Turmas
CREATE INDEX idx_turmas_arena
ON turmas(arena_id);

CREATE INDEX idx_turmas_arena_professor
ON turmas(arena_professor_id);

CREATE INDEX idx_turmas_status
ON turmas(status);

-- Matrículas
CREATE INDEX idx_matriculas_arena
ON matriculas(arena_id);

CREATE INDEX idx_matriculas_arena_aluno
ON matriculas(arena_aluno_id);

CREATE INDEX idx_matriculas_turma
ON matriculas(turma_id);

CREATE INDEX idx_matriculas_status
ON matriculas(status);

-- Pagamentos
CREATE INDEX idx_pagamentos_arena_status
ON pagamentos(arena_id, status);

CREATE INDEX idx_pagamentos_arena_aluno
ON pagamentos(arena_aluno_id);

CREATE INDEX idx_pagamentos_matricula
ON pagamentos(matricula_id);

CREATE INDEX idx_pagamentos_turma
ON pagamentos(turma_id);

CREATE INDEX idx_pagamentos_arena_professor
ON pagamentos(arena_professor_id);

CREATE INDEX idx_pagamentos_competencia
ON pagamentos(competencia);

CREATE INDEX idx_pagamentos_vencimento
ON pagamentos(data_vencimento);


-- ============================================================
-- 14. COMENTÁRIOS DE DOCUMENTAÇÃO
-- ============================================================

COMMENT ON TABLE arenas IS
'Tenant principal do SaaS. Cada registro representa uma arena/cliente.';

COMMENT ON TABLE usuarios IS
'Usuários autenticados que acessam a plataforma. Referencia auth.users. Alunos não entram nesta tabela.';

COMMENT ON TABLE arena_usuarios IS
'Vínculo entre usuário e arena, definindo role operacional por arena.';

COMMENT ON TABLE professores IS
'Perfil global de professor. Todo professor é um usuário do sistema.';

COMMENT ON TABLE arena_professores IS
'Vínculo professor-arena com comissão percentual específica por arena.';

COMMENT ON TABLE alunos IS
'Cadastro global de alunos/clientes. Não possui login no MVP.';

COMMENT ON TABLE arena_alunos IS
'Vínculo aluno-arena, permitindo aluno em múltiplas arenas.';

COMMENT ON TABLE turmas IS
'Turmas de uma arena, vinculadas a um professor atuando naquela arena.';

COMMENT ON TABLE matriculas IS
'Vínculo histórico entre aluno da arena e turma.';

COMMENT ON TABLE pagamentos IS
'Tabela fato financeira, preservando contexto histórico de arena, aluno, turma e professor.';


-- ============================================================
-- 15. VALIDAÇÃO RÁPIDA
-- ============================================================

SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'arenas',
      'usuarios',
      'arena_usuarios',
      'professores',
      'arena_professores',
      'alunos',
      'arena_alunos',
      'turmas',
      'matriculas',
      'pagamentos'
  )
ORDER BY table_name;