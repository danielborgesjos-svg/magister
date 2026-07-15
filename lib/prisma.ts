import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prismaSystem = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prismaSystem
}

/**
 * Retorna uma instância do Prisma Client estendida com injeção automática de `tenantId`.
 * Essa é a nossa camada de abstração de RLS (Row Level Security) na aplicação.
 */
export function getTenantPrisma(tenantId: string) {
  if (!tenantId) {
    throw new Error("tenantId é obrigatório para queries com isolamento (RLS).");
  }

  return prismaSystem.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Modelos que pertencem à plataforma inteira (não possuem tenantId)
          const nonTenantModels = ['Tenant', 'Plano', 'ModuloSaaS'];
          if (nonTenantModels.includes(model)) {
            return query(args);
          }

          // Garantir injeção segura de args se não existir
          args = args || {};

          // Injeta tenantId no data para criações
          if (operation === 'create') {
            (args as any).data = { ...(args as any).data, tenantId };
          } else if (operation === 'createMany') {
            if (Array.isArray((args as any).data)) {
              (args as any).data = (args as any).data.map((d: any) => ({ ...d, tenantId }));
            } else {
              (args as any).data = { ...(args as any).data, tenantId };
            }
          } 
          // Injeta tenantId no where para buscas e atualizações em massa
          else if (['findFirst', 'findMany', 'count', 'updateMany', 'deleteMany', 'aggregate', 'groupBy'].includes(operation)) {
            (args as any).where = { ...(args as any).where, tenantId };
          }
          // Para findUnique, update e delete (operações singulares com ID)
          // O Prisma exige a chave única exata, então fazemos a query e bloqueamos o vazamento pós-query.
          else if (['findUnique', 'findUniqueOrThrow', 'update', 'delete'].includes(operation)) {
            const result: any = await query(args);
            if (result && result.tenantId && result.tenantId !== tenantId) {
               throw new Error(`Acesso negado: Tentativa de acessar registro do modelo ${model} pertencente a outro Tenant.`);
            }
            return result;
          }

          return query(args);
        },
      },
    },
  });
}

// O prisma padrão continua sendo exportado para usos em Control Center ou background jobs,
// mas deve ser usado com extremo cuidado nas rotas das aplicações (/api/[tenant-slug]/...)
export default prismaSystem;
