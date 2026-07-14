/**
 * Abstração da Sessão (Multi-Contexto)
 * Preparado para receber JWT / NextAuth futuramente.
 */

export type ContextType = 'PLATFORM' | 'MAGISTER' | 'TENANT';

export interface UserSession {
  id: string;
  nome: string;
  email: string;
  
  // Contexto Ativo 
  activeContext: ContextType;
  activeTenantId: string | null; 
  activeRole: string; // superadmin, admin, manager, viewer

  // Permissões globais do usuário (contextos que ele pode acessar)
  allowedContexts: {
    type: ContextType;
    tenantId?: string;
    tenantName?: string;
    role: string;
  }[];
}

// Mock inicial para a Fase 0 (até conectar NextAuth ou JWT real)
let currentMockSession: UserSession = {
  id: 'user_001',
  nome: 'Danie',
  email: 'admin@magistertech.com.br',
  activeContext: 'TENANT',
  activeTenantId: 'tenant_default_001',
  activeRole: 'admin',
  allowedContexts: [
    { type: 'PLATFORM', role: 'superadmin' },
    { type: 'MAGISTER', role: 'admin' },
    { type: 'TENANT', tenantId: 'tenant_default_001', tenantName: 'JAMPER', role: 'admin' },
    { type: 'TENANT', tenantId: 'tenant_demo', tenantName: 'Cliente Demo', role: 'viewer' },
  ]
};

export function getSession(): UserSession {
  return currentMockSession;
}

export function setActiveContext(type: ContextType, tenantId?: string) {
  const ctx = currentMockSession.allowedContexts.find(c => 
    c.type === type && (type !== 'TENANT' || c.tenantId === tenantId)
  );
  if (ctx) {
    currentMockSession = {
      ...currentMockSession,
      activeContext: ctx.type,
      activeTenantId: ctx.tenantId || null,
      activeRole: ctx.role
    };
  } else {
    throw new Error('Usuário não possui acesso a este contexto.');
  }
}
