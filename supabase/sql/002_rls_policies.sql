-- ============================================================
-- QUADRA BEACH CLUB — RLS POLICIES
-- ============================================================
-- Este bloco:
-- - habilita RLS nas tabelas;
-- - cria funções auxiliares SECURITY DEFINER;
-- - cria policies para admin master, admin da arena e professor.
--
-- Alunos NÃO têm acesso à plataforma.
-- ============================================================


-- ============================================================
-- 1. HABILITAR RLS
-- ============================================================

ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. FUNÇÕES AUXILIARES DE AUTORIZAÇÃO
-- ============================================================

CREATE OR REPLACE FUNCTION current_user_is_master_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM usuarios u
        WHERE u.id = auth.uid()
          AND u.is_master_admin = TRUE
    );
$$;


CREATE OR REPLACE FUNCTION current_user_has_arena_role(
    p_arena_id UUID,
    p_roles TEXT[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT
        current_user_is_master_admin()
        OR EXISTS (
            SELECT 1
            FROM arena_usuarios au
            WHERE au.usuario_id = auth.uid()
              AND au.arena_id = p_arena_id
              AND au.role = ANY(p_roles)
              AND au.status = 'ativo'
        );
$$;


CREATE OR REPLACE FUNCTION current_user_can_access_arena(
    p_arena_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT current_user_has_arena_role(
        p_arena_id,
        ARRAY['admin_arena', 'professor']
    );
$$;


CREATE OR REPLACE FUNCTION current_user_can_admin_arena(
    p_arena_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT current_user_has_arena_role(
        p_arena_id,
        ARRAY['admin_arena']
    );
$$;


CREATE OR REPLACE FUNCTION current_user_owns_arena_professor(
    p_arena_professor_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM arena_professores ap
        INNER JOIN arena_usuarios au
            ON au.arena_id = ap.arena_id
           AND au.usuario_id = ap.professor_id
           AND au.role = 'professor'
        WHERE ap.id = p_arena_professor_id
          AND ap.professor_id = auth.uid()
          AND ap.status = 'ativo'
          AND au.status = 'ativo'
    );
$$;


CREATE OR REPLACE FUNCTION current_user_can_select_usuario(
    p_usuario_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT
        current_user_is_master_admin()
        OR p_usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM arena_usuarios current_au
            INNER JOIN arena_usuarios target_au
                ON target_au.arena_id = current_au.arena_id
            WHERE current_au.usuario_id = auth.uid()
              AND current_au.role = 'admin_arena'
              AND current_au.status = 'ativo'
              AND target_au.usuario_id = p_usuario_id
        );
$$;


CREATE OR REPLACE FUNCTION current_user_can_select_turma(
    p_turma_id UUID,
    p_arena_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT
        current_user_can_admin_arena(p_arena_id)
        OR EXISTS (
            SELECT 1
            FROM turmas t
            INNER JOIN arena_professores ap
                ON ap.id = t.arena_professor_id
            INNER JOIN arena_usuarios au
                ON au.arena_id = t.arena_id
               AND au.usuario_id = ap.professor_id
               AND au.role = 'professor'
            WHERE t.id = p_turma_id
              AND t.arena_id = p_arena_id
              AND ap.professor_id = auth.uid()
              AND ap.status = 'ativo'
              AND au.status = 'ativo'
        );
$$;


CREATE OR REPLACE FUNCTION current_user_can_select_arena_aluno(
    p_arena_aluno_id UUID,
    p_arena_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT
        current_user_can_admin_arena(p_arena_id)
        OR EXISTS (
            SELECT 1
            FROM matriculas m
            INNER JOIN turmas t
                ON t.id = m.turma_id
               AND t.arena_id = m.arena_id
            INNER JOIN arena_professores ap
                ON ap.id = t.arena_professor_id
            INNER JOIN arena_usuarios au
                ON au.arena_id = t.arena_id
               AND au.usuario_id = ap.professor_id
               AND au.role = 'professor'
            WHERE m.arena_aluno_id = p_arena_aluno_id
              AND m.arena_id = p_arena_id
              AND m.status = 'ativa'
              AND ap.professor_id = auth.uid()
              AND ap.status = 'ativo'
              AND au.status = 'ativo'
        );
$$;


CREATE OR REPLACE FUNCTION current_user_can_select_aluno(
    p_aluno_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT
        current_user_is_master_admin()
        OR EXISTS (
            SELECT 1
            FROM arena_alunos aa
            WHERE aa.aluno_id = p_aluno_id
              AND current_user_can_select_arena_aluno(aa.id, aa.arena_id)
        );
$$;


CREATE OR REPLACE FUNCTION current_user_can_select_matricula(
    p_matricula_id UUID,
    p_arena_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT
        current_user_can_admin_arena(p_arena_id)
        OR EXISTS (
            SELECT 1
            FROM matriculas m
            INNER JOIN turmas t
                ON t.id = m.turma_id
               AND t.arena_id = m.arena_id
            INNER JOIN arena_professores ap
                ON ap.id = t.arena_professor_id
            INNER JOIN arena_usuarios au
                ON au.arena_id = t.arena_id
               AND au.usuario_id = ap.professor_id
               AND au.role = 'professor'
            WHERE m.id = p_matricula_id
              AND m.arena_id = p_arena_id
              AND ap.professor_id = auth.uid()
              AND ap.status = 'ativo'
              AND au.status = 'ativo'
        );
$$;


CREATE OR REPLACE FUNCTION current_user_can_select_pagamento(
    p_pagamento_id UUID,
    p_arena_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT
        current_user_can_admin_arena(p_arena_id)
        OR EXISTS (
            SELECT 1
            FROM pagamentos p
            LEFT JOIN turmas t
                ON t.id = p.turma_id
               AND t.arena_id = p.arena_id
            LEFT JOIN arena_professores ap_from_turma
                ON ap_from_turma.id = t.arena_professor_id
            LEFT JOIN arena_professores ap_direct
                ON ap_direct.id = p.arena_professor_id
            WHERE p.id = p_pagamento_id
              AND p.arena_id = p_arena_id
              AND (
                    ap_from_turma.professor_id = auth.uid()
                    OR ap_direct.professor_id = auth.uid()
              )
        );
$$;


-- ============================================================
-- 3. PERMISSÕES DAS FUNÇÕES
-- ============================================================

REVOKE ALL ON FUNCTION current_user_is_master_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_has_arena_role(UUID, TEXT[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_can_access_arena(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_can_admin_arena(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_owns_arena_professor(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_can_select_usuario(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_can_select_turma(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_can_select_arena_aluno(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_can_select_aluno(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_can_select_matricula(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION current_user_can_select_pagamento(UUID, UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION current_user_is_master_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_has_arena_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_can_access_arena(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_can_admin_arena(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_owns_arena_professor(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_can_select_usuario(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_can_select_turma(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_can_select_arena_aluno(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_can_select_aluno(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_can_select_matricula(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_can_select_pagamento(UUID, UUID) TO authenticated;


-- ============================================================
-- 4. LIMPAR POLICIES EXISTENTES
-- ============================================================

DROP POLICY IF EXISTS arenas_select ON arenas;
DROP POLICY IF EXISTS arenas_insert ON arenas;
DROP POLICY IF EXISTS arenas_update ON arenas;
DROP POLICY IF EXISTS arenas_delete ON arenas;

DROP POLICY IF EXISTS usuarios_select ON usuarios;
DROP POLICY IF EXISTS usuarios_insert ON usuarios;
DROP POLICY IF EXISTS usuarios_update ON usuarios;
DROP POLICY IF EXISTS usuarios_delete ON usuarios;

DROP POLICY IF EXISTS arena_usuarios_select ON arena_usuarios;
DROP POLICY IF EXISTS arena_usuarios_insert ON arena_usuarios;
DROP POLICY IF EXISTS arena_usuarios_update ON arena_usuarios;
DROP POLICY IF EXISTS arena_usuarios_delete ON arena_usuarios;

DROP POLICY IF EXISTS professores_select ON professores;
DROP POLICY IF EXISTS professores_insert ON professores;
DROP POLICY IF EXISTS professores_update ON professores;
DROP POLICY IF EXISTS professores_delete ON professores;

DROP POLICY IF EXISTS arena_professores_select ON arena_professores;
DROP POLICY IF EXISTS arena_professores_insert ON arena_professores;
DROP POLICY IF EXISTS arena_professores_update ON arena_professores;
DROP POLICY IF EXISTS arena_professores_delete ON arena_professores;

DROP POLICY IF EXISTS alunos_select ON alunos;
DROP POLICY IF EXISTS alunos_insert ON alunos;
DROP POLICY IF EXISTS alunos_update ON alunos;
DROP POLICY IF EXISTS alunos_delete ON alunos;

DROP POLICY IF EXISTS arena_alunos_select ON arena_alunos;
DROP POLICY IF EXISTS arena_alunos_insert ON arena_alunos;
DROP POLICY IF EXISTS arena_alunos_update ON arena_alunos;
DROP POLICY IF EXISTS arena_alunos_delete ON arena_alunos;

DROP POLICY IF EXISTS turmas_select ON turmas;
DROP POLICY IF EXISTS turmas_insert ON turmas;
DROP POLICY IF EXISTS turmas_update ON turmas;
DROP POLICY IF EXISTS turmas_delete ON turmas;

DROP POLICY IF EXISTS matriculas_select ON matriculas;
DROP POLICY IF EXISTS matriculas_insert ON matriculas;
DROP POLICY IF EXISTS matriculas_update ON matriculas;
DROP POLICY IF EXISTS matriculas_delete ON matriculas;

DROP POLICY IF EXISTS pagamentos_select ON pagamentos;
DROP POLICY IF EXISTS pagamentos_insert ON pagamentos;
DROP POLICY IF EXISTS pagamentos_update ON pagamentos;
DROP POLICY IF EXISTS pagamentos_delete ON pagamentos;


-- ============================================================
-- 5. POLICIES — ARENAS
-- ============================================================

CREATE POLICY arenas_select
ON arenas
FOR SELECT
TO authenticated
USING (
    current_user_can_access_arena(id)
);

CREATE POLICY arenas_insert
ON arenas
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_is_master_admin()
);

CREATE POLICY arenas_update
ON arenas
FOR UPDATE
TO authenticated
USING (
    current_user_can_admin_arena(id)
)
WITH CHECK (
    current_user_can_admin_arena(id)
);

CREATE POLICY arenas_delete
ON arenas
FOR DELETE
TO authenticated
USING (
    current_user_is_master_admin()
);


-- ============================================================
-- 6. POLICIES — USUÁRIOS
-- ============================================================

CREATE POLICY usuarios_select
ON usuarios
FOR SELECT
TO authenticated
USING (
    current_user_can_select_usuario(id)
);

CREATE POLICY usuarios_insert
ON usuarios
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_is_master_admin()
    OR id = auth.uid()
);

CREATE POLICY usuarios_update
ON usuarios
FOR UPDATE
TO authenticated
USING (
    current_user_is_master_admin()
    OR id = auth.uid()
)
WITH CHECK (
    current_user_is_master_admin()
    OR id = auth.uid()
);

CREATE POLICY usuarios_delete
ON usuarios
FOR DELETE
TO authenticated
USING (
    current_user_is_master_admin()
);


-- ============================================================
-- 7. POLICIES — ARENA_USUÁRIOS
-- ============================================================

CREATE POLICY arena_usuarios_select
ON arena_usuarios
FOR SELECT
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
    OR usuario_id = auth.uid()
);

CREATE POLICY arena_usuarios_insert
ON arena_usuarios
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY arena_usuarios_update
ON arena_usuarios
FOR UPDATE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
)
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY arena_usuarios_delete
ON arena_usuarios
FOR DELETE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
);


-- ============================================================
-- 8. POLICIES — PROFESSORES
-- ============================================================

CREATE POLICY professores_select
ON professores
FOR SELECT
TO authenticated
USING (
    current_user_is_master_admin()
    OR usuario_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM arena_professores ap
        WHERE ap.professor_id = professores.usuario_id
          AND current_user_can_admin_arena(ap.arena_id)
    )
);

CREATE POLICY professores_insert
ON professores
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_is_master_admin()
    OR usuario_id = auth.uid()
);

CREATE POLICY professores_update
ON professores
FOR UPDATE
TO authenticated
USING (
    current_user_is_master_admin()
    OR usuario_id = auth.uid()
)
WITH CHECK (
    current_user_is_master_admin()
    OR usuario_id = auth.uid()
);

CREATE POLICY professores_delete
ON professores
FOR DELETE
TO authenticated
USING (
    current_user_is_master_admin()
);


-- ============================================================
-- 9. POLICIES — ARENA_PROFESSORES
-- ============================================================

CREATE POLICY arena_professores_select
ON arena_professores
FOR SELECT
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
    OR current_user_owns_arena_professor(id)
);

CREATE POLICY arena_professores_insert
ON arena_professores
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY arena_professores_update
ON arena_professores
FOR UPDATE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
)
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY arena_professores_delete
ON arena_professores
FOR DELETE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
);


-- ============================================================
-- 10. POLICIES — ALUNOS
-- ============================================================

CREATE POLICY alunos_select
ON alunos
FOR SELECT
TO authenticated
USING (
    current_user_can_select_aluno(id)
);

CREATE POLICY alunos_insert
ON alunos
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_is_master_admin()
    OR EXISTS (
        SELECT 1
        FROM arena_usuarios au
        WHERE au.usuario_id = auth.uid()
          AND au.role = 'admin_arena'
          AND au.status = 'ativo'
    )
);

CREATE POLICY alunos_update
ON alunos
FOR UPDATE
TO authenticated
USING (
    current_user_is_master_admin()
    OR EXISTS (
        SELECT 1
        FROM arena_alunos aa
        WHERE aa.aluno_id = alunos.id
          AND current_user_can_admin_arena(aa.arena_id)
    )
)
WITH CHECK (
    current_user_is_master_admin()
    OR EXISTS (
        SELECT 1
        FROM arena_alunos aa
        WHERE aa.aluno_id = alunos.id
          AND current_user_can_admin_arena(aa.arena_id)
    )
);

CREATE POLICY alunos_delete
ON alunos
FOR DELETE
TO authenticated
USING (
    current_user_is_master_admin()
);


-- ============================================================
-- 11. POLICIES — ARENA_ALUNOS
-- ============================================================

CREATE POLICY arena_alunos_select
ON arena_alunos
FOR SELECT
TO authenticated
USING (
    current_user_can_select_arena_aluno(id, arena_id)
);

CREATE POLICY arena_alunos_insert
ON arena_alunos
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY arena_alunos_update
ON arena_alunos
FOR UPDATE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
)
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY arena_alunos_delete
ON arena_alunos
FOR DELETE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
);


-- ============================================================
-- 12. POLICIES — TURMAS
-- ============================================================

CREATE POLICY turmas_select
ON turmas
FOR SELECT
TO authenticated
USING (
    current_user_can_select_turma(id, arena_id)
);

CREATE POLICY turmas_insert
ON turmas
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY turmas_update
ON turmas
FOR UPDATE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
)
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY turmas_delete
ON turmas
FOR DELETE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
);


-- ============================================================
-- 13. POLICIES — MATRÍCULAS
-- ============================================================

CREATE POLICY matriculas_select
ON matriculas
FOR SELECT
TO authenticated
USING (
    current_user_can_select_matricula(id, arena_id)
);

CREATE POLICY matriculas_insert
ON matriculas
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY matriculas_update
ON matriculas
FOR UPDATE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
)
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY matriculas_delete
ON matriculas
FOR DELETE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
);


-- ============================================================
-- 14. POLICIES — PAGAMENTOS
-- ============================================================

CREATE POLICY pagamentos_select
ON pagamentos
FOR SELECT
TO authenticated
USING (
    current_user_can_select_pagamento(id, arena_id)
);

CREATE POLICY pagamentos_insert
ON pagamentos
FOR INSERT
TO authenticated
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY pagamentos_update
ON pagamentos
FOR UPDATE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
)
WITH CHECK (
    current_user_can_admin_arena(arena_id)
);

CREATE POLICY pagamentos_delete
ON pagamentos
FOR DELETE
TO authenticated
USING (
    current_user_can_admin_arena(arena_id)
);


-- ============================================================
-- 15. VALIDAÇÃO RLS
-- ============================================================

SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
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
ORDER BY tablename;


SELECT
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
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
ORDER BY tablename, policyname;