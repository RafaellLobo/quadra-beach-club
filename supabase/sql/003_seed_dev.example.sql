-- ============================================================
-- QUADRA BEACH CLUB — SEED DEV EXAMPLE
-- ============================================================
-- Este arquivo é um EXEMPLO versionável.
--
-- Antes de executar em um projeto Supabase real:
--
-- 1. Crie usuários em Authentication > Users.
-- 2. Copie este arquivo para:
--
--      003_seed_dev.local.sql
--
-- 3. Substitua os UUIDs fictícios abaixo pelos UUIDs reais
--    existentes em auth.users.
--
-- NÃO commitar:
-- - 003_seed_dev.local.sql
-- - senhas
-- - JWT secret
-- - service_role key
-- - tokens
--
-- Usuários fictícios deste exemplo:
--
-- MASTER_USER_ID:
-- 00000000-0000-0000-0000-000000000001
--
-- ADMIN_ARENA_USER_ID:
-- 00000000-0000-0000-0000-000000000002
--
-- PROFESSOR_USER_ID:
-- 00000000-0000-0000-0000-000000000003
-- ============================================================

BEGIN;

-- ============================================================
-- 1. USUÁRIOS DA PLATAFORMA
-- ============================================================

INSERT INTO usuarios (
    id,
    nome,
    is_master_admin
)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'Admin Master',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Admin Arena Teste',
        FALSE
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'Professor Teste',
        FALSE
    )
ON CONFLICT (id) DO UPDATE
SET
    nome = EXCLUDED.nome,
    is_master_admin = EXCLUDED.is_master_admin,
    updated_at = NOW();


-- ============================================================
-- 2. ARENAS
-- ============================================================

INSERT INTO arenas (
    id,
    nome,
    status
)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Arena Beach Centro',
        'ativa'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Arena Beach Norte',
        'ativa'
    )
ON CONFLICT (id) DO UPDATE
SET
    nome = EXCLUDED.nome,
    status = EXCLUDED.status,
    updated_at = NOW();


-- ============================================================
-- 3. VÍNCULOS USUÁRIO ↔ ARENA
-- ============================================================
-- Admin da arena fica vinculado somente à Arena Centro.
-- Professor fica vinculado às duas arenas.

INSERT INTO arena_usuarios (
    id,
    arena_id,
    usuario_id,
    role,
    status
)
VALUES
    (
        'aaaaaaaa-0001-0001-0001-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000002',
        'admin_arena',
        'ativo'
    ),
    (
        'aaaaaaaa-0002-0002-0002-000000000002',
        '11111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000003',
        'professor',
        'ativo'
    ),
    (
        'aaaaaaaa-0003-0003-0003-000000000003',
        '22222222-2222-2222-2222-222222222222',
        '00000000-0000-0000-0000-000000000003',
        'professor',
        'ativo'
    )
ON CONFLICT (arena_id, usuario_id) DO UPDATE
SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();


-- ============================================================
-- 4. PERFIL GLOBAL DO PROFESSOR
-- ============================================================

INSERT INTO professores (
    usuario_id,
    telefone,
    documento,
    observacoes
)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '(45) 99999-0000',
    NULL,
    'Professor de teste vinculado a duas arenas.'
)
ON CONFLICT (usuario_id) DO UPDATE
SET
    telefone = EXCLUDED.telefone,
    documento = EXCLUDED.documento,
    observacoes = EXCLUDED.observacoes,
    updated_at = NOW();


-- ============================================================
-- 5. VÍNCULO PROFESSOR ↔ ARENA
-- ============================================================
-- Comissão pode variar por arena.

INSERT INTO arena_professores (
    id,
    arena_id,
    professor_id,
    comissao_percentual,
    status
)
VALUES
    (
        'bbbbbbbb-0001-0001-0001-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000003',
        40.00,
        'ativo'
    ),
    (
        'bbbbbbbb-0002-0002-0002-000000000002',
        '22222222-2222-2222-2222-222222222222',
        '00000000-0000-0000-0000-000000000003',
        50.00,
        'ativo'
    )
ON CONFLICT (arena_id, professor_id) DO UPDATE
SET
    comissao_percentual = EXCLUDED.comissao_percentual,
    status = EXCLUDED.status,
    updated_at = NOW();


-- ============================================================
-- 6. ALUNO GLOBAL
-- ============================================================
-- Aluno não tem login na plataforma.
-- O mesmo aluno será vinculado às duas arenas.

INSERT INTO alunos (
    id,
    nome,
    telefone,
    documento
)
VALUES (
    'cccccccc-0001-0001-0001-000000000001',
    'Aluno Teste Multi-Arena',
    '(45) 98888-0000',
    NULL
)
ON CONFLICT (id) DO UPDATE
SET
    nome = EXCLUDED.nome,
    telefone = EXCLUDED.telefone,
    documento = EXCLUDED.documento,
    updated_at = NOW();


-- ============================================================
-- 7. VÍNCULO ALUNO ↔ ARENA
-- ============================================================

INSERT INTO arena_alunos (
    id,
    arena_id,
    aluno_id,
    status
)
VALUES
    (
        'dddddddd-0001-0001-0001-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'cccccccc-0001-0001-0001-000000000001',
        'ativo'
    ),
    (
        'dddddddd-0002-0002-0002-000000000002',
        '22222222-2222-2222-2222-222222222222',
        'cccccccc-0001-0001-0001-000000000001',
        'ativo'
    )
ON CONFLICT (arena_id, aluno_id) DO UPDATE
SET
    status = EXCLUDED.status,
    updated_at = NOW();


-- ============================================================
-- 8. TURMAS
-- ============================================================

INSERT INTO turmas (
    id,
    arena_id,
    arena_professor_id,
    nome,
    valor_mensalidade,
    status
)
VALUES
    (
        'eeeeeeee-0001-0001-0001-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'bbbbbbbb-0001-0001-0001-000000000001',
        'Beach Tennis Iniciante - Centro',
        250.00,
        'ativa'
    ),
    (
        'eeeeeeee-0002-0002-0002-000000000002',
        '22222222-2222-2222-2222-222222222222',
        'bbbbbbbb-0002-0002-0002-000000000002',
        'Beach Tennis Intermediário - Norte',
        300.00,
        'ativa'
    )
ON CONFLICT (id) DO UPDATE
SET
    arena_professor_id = EXCLUDED.arena_professor_id,
    nome = EXCLUDED.nome,
    valor_mensalidade = EXCLUDED.valor_mensalidade,
    status = EXCLUDED.status,
    updated_at = NOW();


-- ============================================================
-- 9. MATRÍCULAS
-- ============================================================

INSERT INTO matriculas (
    id,
    arena_id,
    arena_aluno_id,
    turma_id,
    status,
    data_inicio,
    data_fim
)
VALUES
    (
        'ffffffff-0001-0001-0001-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'dddddddd-0001-0001-0001-000000000001',
        'eeeeeeee-0001-0001-0001-000000000001',
        'ativa',
        CURRENT_DATE,
        NULL
    ),
    (
        'ffffffff-0002-0002-0002-000000000002',
        '22222222-2222-2222-2222-222222222222',
        'dddddddd-0002-0002-0002-000000000002',
        'eeeeeeee-0002-0002-0002-000000000002',
        'ativa',
        CURRENT_DATE,
        NULL
    )
ON CONFLICT (id) DO UPDATE
SET
    status = EXCLUDED.status,
    data_inicio = EXCLUDED.data_inicio,
    data_fim = EXCLUDED.data_fim,
    updated_at = NOW();


-- ============================================================
-- 10. PAGAMENTOS
-- ============================================================

INSERT INTO pagamentos (
    id,
    arena_id,
    arena_aluno_id,
    matricula_id,
    turma_id,
    arena_professor_id,
    registrado_por,
    tipo,
    valor,
    status,
    competencia,
    data_vencimento,
    data_pagamento,
    observacoes
)
VALUES
    (
        '99999999-0001-0001-0001-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'dddddddd-0001-0001-0001-000000000001',
        'ffffffff-0001-0001-0001-000000000001',
        'eeeeeeee-0001-0001-0001-000000000001',
        'bbbbbbbb-0001-0001-0001-000000000001',
        '00000000-0000-0000-0000-000000000002',
        'mensalidade',
        250.00,
        'pago',
        DATE_TRUNC('month', CURRENT_DATE)::DATE,
        CURRENT_DATE,
        CURRENT_DATE,
        'Pagamento de teste da Arena Centro.'
    ),
    (
        '99999999-0002-0002-0002-000000000002',
        '22222222-2222-2222-2222-222222222222',
        'dddddddd-0002-0002-0002-000000000002',
        'ffffffff-0002-0002-0002-000000000002',
        'eeeeeeee-0002-0002-0002-000000000002',
        'bbbbbbbb-0002-0002-0002-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'mensalidade',
        300.00,
        'pendente',
        DATE_TRUNC('month', CURRENT_DATE)::DATE,
        CURRENT_DATE + INTERVAL '7 days',
        NULL,
        'Pagamento de teste da Arena Norte.'
    )
ON CONFLICT (id) DO UPDATE
SET
    status = EXCLUDED.status,
    valor = EXCLUDED.valor,
    competencia = EXCLUDED.competencia,
    data_vencimento = EXCLUDED.data_vencimento,
    data_pagamento = EXCLUDED.data_pagamento,
    observacoes = EXCLUDED.observacoes,
    updated_at = NOW();

COMMIT;


-- ============================================================
-- 11. VALIDAÇÃO DO SEED
-- ============================================================

SELECT
    'arenas' AS tabela,
    COUNT(*) AS total
FROM arenas

UNION ALL

SELECT
    'usuarios',
    COUNT(*)
FROM usuarios

UNION ALL

SELECT
    'arena_usuarios',
    COUNT(*)
FROM arena_usuarios

UNION ALL

SELECT
    'professores',
    COUNT(*)
FROM professores

UNION ALL

SELECT
    'arena_professores',
    COUNT(*)
FROM arena_professores

UNION ALL

SELECT
    'alunos',
    COUNT(*)
FROM alunos

UNION ALL

SELECT
    'arena_alunos',
    COUNT(*)
FROM arena_alunos

UNION ALL

SELECT
    'turmas',
    COUNT(*)
FROM turmas

UNION ALL

SELECT
    'matriculas',
    COUNT(*)
FROM matriculas

UNION ALL

SELECT
    'pagamentos',
    COUNT(*)
FROM pagamentos
ORDER BY tabela;


-- ============================================================
-- 12. VALIDAÇÃO DO PROFESSOR MULTI-ARENA
-- ============================================================

SELECT
    u.nome AS professor,
    a.nome AS arena,
    ap.comissao_percentual,
    ap.status
FROM arena_professores ap
INNER JOIN professores p
    ON p.usuario_id = ap.professor_id
INNER JOIN usuarios u
    ON u.id = p.usuario_id
INNER JOIN arenas a
    ON a.id = ap.arena_id
WHERE ap.professor_id = '00000000-0000-0000-0000-000000000003'
ORDER BY a.nome;


-- ============================================================
-- 13. VALIDAÇÃO DO ALUNO MULTI-ARENA
-- ============================================================

SELECT
    al.nome AS aluno,
    a.nome AS arena,
    aa.status
FROM arena_alunos aa
INNER JOIN alunos al
    ON al.id = aa.aluno_id
INNER JOIN arenas a
    ON a.id = aa.arena_id
WHERE al.id = 'cccccccc-0001-0001-0001-000000000001'
ORDER BY a.nome;