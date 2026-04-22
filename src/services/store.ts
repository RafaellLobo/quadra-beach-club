import { useSyncExternalStore } from "react";
import type { Aluno, Pagamento, Turma } from "@/types";
import {
  CURRENT_TENANT,
  seedAlunos,
  seedPagamentos,
  seedTurmas,
} from "./mockData";

interface State {
  alunos: Aluno[];
  turmas: Turma[];
  pagamentos: Pagamento[];
}

let state: State = {
  alunos: [...seedAlunos],
  turmas: [...seedTurmas],
  pagamentos: [...seedPagamentos],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export const useAlunos = () =>
  useSyncExternalStore(
    subscribe,
    () => state.alunos,
    () => state.alunos,
  );
export const useTurmas = () =>
  useSyncExternalStore(
    subscribe,
    () => state.turmas,
    () => state.turmas,
  );
export const usePagamentos = () =>
  useSyncExternalStore(
    subscribe,
    () => state.pagamentos,
    () => state.pagamentos,
  );

// Alunos
export const createAluno = (
  data: Omit<Aluno, "id" | "tenant_id" | "created_at">,
) => {
  const aluno: Aluno = {
    ...data,
    id: uid("aln"),
    tenant_id: CURRENT_TENANT,
    created_at: new Date().toISOString(),
  };
  state = { ...state, alunos: [aluno, ...state.alunos] };
  emit();
  return aluno;
};

export const updateAluno = (id: string, patch: Partial<Aluno>) => {
  state = {
    ...state,
    alunos: state.alunos.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  };
  emit();
};

export const deleteAluno = (id: string) => {
  state = {
    ...state,
    alunos: state.alunos.filter((a) => a.id !== id),
    pagamentos: state.pagamentos.filter((p) => p.aluno_id !== id),
  };
  emit();
};

// Turmas
export const createTurma = (
  data: Omit<Turma, "id" | "tenant_id" | "created_at">,
) => {
  const turma: Turma = {
    ...data,
    id: uid("turma"),
    tenant_id: CURRENT_TENANT,
    created_at: new Date().toISOString(),
  };
  state = { ...state, turmas: [turma, ...state.turmas] };
  emit();
  return turma;
};

export const updateTurma = (id: string, patch: Partial<Turma>) => {
  state = {
    ...state,
    turmas: state.turmas.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  };
  emit();
};

export const deleteTurma = (id: string) => {
  state = {
    ...state,
    turmas: state.turmas.filter((t) => t.id !== id),
    alunos: state.alunos.map((a) =>
      a.turma_id === id ? { ...a, turma_id: null } : a,
    ),
  };
  emit();
};

// Pagamentos
export const createPagamento = (
  data: Omit<Pagamento, "id" | "tenant_id" | "created_at">,
) => {
  const pagamento: Pagamento = {
    ...data,
    id: uid("pag"),
    tenant_id: CURRENT_TENANT,
    created_at: new Date().toISOString(),
  };
  state = { ...state, pagamentos: [pagamento, ...state.pagamentos] };
  emit();
  return pagamento;
};

export const updatePagamento = (id: string, patch: Partial<Pagamento>) => {
  state = {
    ...state,
    pagamentos: state.pagamentos.map((p) =>
      p.id === id ? { ...p, ...patch } : p,
    ),
  };
  emit();
};

export const marcarComoPago = (id: string) => {
  updatePagamento(id, {
    status: "pago",
    data_pagamento: new Date().toISOString(),
  });
};
