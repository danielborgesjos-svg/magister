import { getSession } from './session'

/**
 * TENANT CONTEXT — Fase 0
 * Retorna o tenantId baseado no contexto ativo da sessão.
 */

export function getTenantId(): string {
  const session = getSession();
  
  if (session.activeContext === 'TENANT' && session.activeTenantId) {
    return session.activeTenantId;
  }
  
  // Se o contexto for PLATFORM ou MAGISTER, não há tenantId de cliente aplicável
  // As queries nessas áreas não devem usar RLS de tenant de cliente.
  throw new Error("Contexto ativo não possui um tenantId de cliente (ex: você está no Control Center). Use prismaSystem diretamente para rotas globais.");
}
