"use server";

import { getProdutosExecutivo, getClientesExecutivo, getOportunidadesExecutivo } from "@/ai/orchestrator/executive";

export async function getIntelProdutos() {
  return getProdutosExecutivo();
}

export async function getIntelClientes() {
  return getClientesExecutivo();
}

export async function getIntelOportunidades() {
  return getOportunidadesExecutivo();
}
