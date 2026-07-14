export default function SuperAdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Magister ERP - Super Admin</h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Painel de controle central para gestão de Tenants (empresas), 
          faturamento do SaaS e monitoramento do Custo de IA (Tokens).
        </p>
      </div>
    </div>
  )
}
