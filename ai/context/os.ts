import prisma from "@/lib/prisma"

export async function buildContextoOS(): Promise<string> {
  const ordens = await prisma.ordemServico.findMany({
    include: {
      cliente: { select: { nome: true } },
      tecnico: { select: { nome: true } },
    },
    orderBy: { dataAgendada: "asc" }
  })

  const tecnicos = await prisma.tecnico.findMany()

  const agendadas = ordens.filter(o => o.status === "agendada")
  const emExecucao = ordens.filter(o => o.status === "em_execucao" || o.status === "em_rota")
  const finalizadas = ordens.filter(o => o.status === "finalizada")
  const atrasadas = ordens.filter(o => ["agendada", "em_rota"].includes(o.status) && o.dataAgendada && new Date(o.dataAgendada) < new Date())

  const preventivas = ordens.filter(o => o.tipoAtendimento === "Preventiva").length
  const corretivas = ordens.filter(o => o.tipoAtendimento === "Corretiva").length
  
  const ordensHoje = ordens.filter(o => {
    if (!o.dataAgendada) return false
    const d = new Date(o.dataAgendada)
    const hoje = new Date()
    return d.toDateString() === hoje.toDateString()
  })

  return `
=== CONTEXTO DE ORDENS DE SERVIÇO (OS) ===
Data: ${new Date().toLocaleDateString("pt-BR")}

--- RESUMO DA OPERAÇÃO TÉCNICA ---
Total de OS registradas: ${ordens.length}
Em execução/rota: ${emExecucao.length}
Agendadas (futuro): ${agendadas.length}
Finalizadas (histórico): ${finalizadas.length}
OS Atrasadas: ${atrasadas.length}${atrasadas.length > 0 ? " ⚠️ REQUER ATENÇÃO" : ""}

Tipos: ${preventivas} Preventivas | ${corretivas} Corretivas

--- PANORAMA DE HOJE ---
OS programadas para hoje: ${ordensHoje.length}
${ordensHoje.length > 0 ? ordensHoje.map(o => `- OS #${o.numeroOS}: ${o.titulo} | Cliente: ${o.cliente.nome} | Téc: ${o.tecnico.nome} | Status: ${o.status}`).join("\n") : "Sem OS para hoje."}

--- ALERTA DE ATRASOS ---
${atrasadas.length > 0 ? atrasadas.map(o => `- OS #${o.numeroOS} (${o.dataAgendada?.toLocaleDateString('pt-BR')}): ${o.cliente.nome} | Téc: ${o.tecnico.nome}`).join("\n") : "Nenhuma OS em atraso crítico."}

--- TÉCNICOS ---
Técnicos ativos na base: ${tecnicos.length}
${tecnicos.map(t => `- ${t.nome} (Status: ${t.status})`).join("\n")}

=== FIM DO CONTEXTO ===
`.trim()
}
