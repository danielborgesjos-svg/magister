import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { notFound } from "next/navigation"
import OsExecutionClient from "./OsExecutionClient"

export default async function OSExecutionPage({ params }: { params: { id: string } }) {
  const tenantId = getTenantId()
  const os = await prisma.ordemServico.findUnique({
    where: { id: params.id, tenantId },
    include: {
      cliente: true,
      endereco: true,
      execucao: true
    }
  })

  if (!os) return notFound()

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 md:bg-slate-200">
      <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl flex flex-col relative">
        <OsExecutionClient os={os} />
      </div>
    </div>
  )
}
