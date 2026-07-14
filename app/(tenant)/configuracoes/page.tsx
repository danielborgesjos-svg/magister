"use client"

import { useState, useEffect } from "react"
import { Settings, User, Bell, Lock, Database, Globe, Palette, Users, Target, Save, CheckCircle2, Key, Info, Sparkles, Plus, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { buscarConfiguracoes, atualizarTenant } from "@/app/actions/configuracoes"
import { toast } from "sonner"

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<'geral' | 'usuarios' | 'metas' | 'ia' | 'canais' | 'agentes' | 'seguranca'>('geral')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [usuariosList, setUsuariosList] = useState<any[]>([])
  
  // States do formulário da empresa
  const [empresaNome, setEmpresaNome] = useState("")
  const [empresaCNPJ, setEmpresaCNPJ] = useState("")
  const [empresaSegmento, setEmpresaSegmento] = useState("")
  const [empresaEmail, setEmpresaEmail] = useState("")

  // States do financeiro/metas
  const [metaMensal, setMetaMensal] = useState(50000)

  // States da IA
  const [ativarProativo, setAtivarProativo] = useState(true)
  const [ativarWA, setAtivarWA] = useState(true)
  const [tomVoz, setTomVoz] = useState("Profissional")
  const [modeloIA, setModeloIA] = useState("Gemini 1.5 Pro")
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••••••••••")

  // States de Agentes IA
  const [agentesIA, setAgentesIA] = useState([
    { id: 'ag-01', icon: '🏆', nome: 'Agente Comercial Sênior', descricao: 'Especialista em reativação de clientes inativos e fechamento de deals no pipeline', modulo: 'vendas', tom: 'Consultivo', ativo: true, arquivosConhecimento: 3 },
    { id: 'ag-02', icon: '📦', nome: 'Agente de Estoque', descricao: 'Monitora ruptura, sugere reposição e alerta sobre produtos parados automaticamente', modulo: 'estoque', tom: 'Direto', ativo: true, arquivosConhecimento: 1 },
    { id: 'ag-03', icon: '💬', nome: 'Agente de Atendimento', descricao: 'Responde mensagens de WhatsApp fora do horário comercial e qualifica leads automaticamente', modulo: 'atendimento', tom: 'Profissional', ativo: false, arquivosConhecimento: 2 },
    { id: 'ag-04', icon: '📊', nome: 'Agente Financeiro', descricao: 'Analisa fluxo de caixa, alerta sobre inadimplência e projeta resultado do mês', modulo: 'financeiro', tom: 'Formal', ativo: true, arquivosConhecimento: 0 },
  ])
  const [showNovoAgente, setShowNovoAgente] = useState(false)
  const [novoAgentNome, setNovoAgentNome] = useState('')
  const [novoAgentDesc, setNovoAgentDesc] = useState('')
  const [novoAgentModulo, setNovoAgentModulo] = useState('vendas')
  const [novoAgentTom, setNovoAgentTom] = useState('Profissional')

  useEffect(() => {
    async function loadData() {
      const data = await buscarConfiguracoes()
      if (data.tenant) {
        setEmpresaNome(data.tenant.nome || "")
        setEmpresaCNPJ(data.tenant.documento || "")
        setEmpresaSegmento(data.tenant.plano === "mvp" ? "Tecnologia" : "")
        
        // Carrega configurações em JSON
        if (data.tenant.configJson) {
          try {
            const config = JSON.parse(data.tenant.configJson)
            if (config.metaMensal) setMetaMensal(config.metaMensal)
            if (config.ativarProativo !== undefined) setAtivarProativo(config.ativarProativo)
            if (config.ativarWA !== undefined) setAtivarWA(config.ativarWA)
            if (config.tomVoz) setTomVoz(config.tomVoz)
            if (config.modeloIA) setModeloIA(config.modeloIA)
            if (config.apiKey) setApiKey(config.apiKey)
            if (config.agentesIA && Array.isArray(config.agentesIA)) setAgentesIA(config.agentesIA)
          } catch (e) {
            console.error("Erro ao fazer parse de configJson", e)
          }
        }
      }
      if (data.usuarios) {
        setUsuariosList(data.usuarios)
      }
    }
    loadData()
  }, [])

  async function handleSave() {
    setIsSaving(true)
    
    // Preparar objeto de configurações
    const configData = {
      metaMensal,
      ativarProativo,
      ativarWA,
      tomVoz,
      modeloIA,
      apiKey,
      agentesIA
    }

    const res = await atualizarTenant({ 
      nome: empresaNome, 
      documento: empresaCNPJ,
      configJson: JSON.stringify(configData)
    })
    if (res.success) {
      setSavedSuccess(true)
      toast.success("Configurações salvas com sucesso.")
      setTimeout(() => setSavedSuccess(false), 3000)
    } else {
      toast.error(res.error || "Erro ao salvar as configurações.")
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h1>
          <p className="text-sm text-muted-foreground">Gerencie a identidade corporativa, usuários comerciais e a Magis IA</p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-2 bg-green-positive/10 border border-green-positive/20 text-green-positive text-xs font-bold px-4 py-2 rounded-lg animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" /> Alterações salvas com sucesso!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start flex-1 min-h-0">
        {/* SIDE BAR NAVIGATION */}
        <div className="space-y-1 bg-card border border-border rounded-xl p-3 shadow-sm md:col-span-1 shrink-0">
          {[
            { id: 'geral', label: 'Geral e Empresa', icon: Settings },
            { id: 'usuarios', label: 'Equipe e Acessos', icon: Users },
            { id: 'metas', label: 'Metas Comerciais', icon: Target },
            { id: 'ia', label: 'Magis IA Preferências', icon: Database },
            { id: 'canais', label: 'Canais e Integrações', icon: Globe },
            { id: 'agentes', label: 'Agentes de IA', icon: Sparkles },
            { id: 'seguranca', label: 'Segurança e Chaves', icon: Lock },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-colors text-left",
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </div>

        {/* DETAILS SECTION */}
        <div className="md:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar max-h-full">
          
          {/* TAB 1: GERAL E EMPRESA */}
          {activeTab === 'geral' && (
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-3 border-b border-border mb-4">
                <CardTitle className="text-base">Geral e Empresa</CardTitle>
                <CardDescription className="text-xs">Dados corporativos para faturamento e automação de mensagens.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Razão Social</label>
                    <Input value={empresaNome} onChange={e => setEmpresaNome(e.target.value)} className="bg-muted/30 text-sm border-border" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">CNPJ</label>
                    <Input value={empresaCNPJ} onChange={e => setEmpresaCNPJ(e.target.value)} className="bg-muted/30 text-sm border-border" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Nicho / Segmento</label>
                    <Input value={empresaSegmento} onChange={e => setEmpresaSegmento(e.target.value)} className="bg-muted/30 text-sm border-border" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">E-mail de Contato</label>
                    <Input value={empresaEmail} onChange={e => setEmpresaEmail(e.target.value)} className="bg-muted/30 text-sm border-border" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: EQUIPE E ACESSOS */}
          {activeTab === 'usuarios' && (
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-3 border-b border-border mb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Equipe e Acessos</CardTitle>
                  <CardDescription className="text-xs">Gerencie os acessos comerciais dos atendentes ao ERP.</CardDescription>
                </div>
                <button 
                  onClick={() => {
                    const novo = { id: `usr-${Date.now()}`, nome: "Novo Vendedor", role: "user", email: "vendedor@magister.com" }
                    setUsuariosList(prev => [...prev, novo])
                  }}
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  + Convidar
                </button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold">
                      <tr>
                        <th className="px-5 py-3">Nome</th>
                        <th className="px-5 py-3">E-mail</th>
                        <th className="px-5 py-3">Perfil</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {usuariosList.map(u => (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] uppercase">
                              {u.nome.substring(0, 2)}
                            </div>
                            <span className="font-bold text-foreground">{u.nome}</span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                          <td className="px-5 py-3.5 font-semibold">{u.role === "admin" ? "Administrador" : "Usuário"}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-green-positive/10 border border-green-positive/20 text-green-positive text-[10px] font-bold uppercase">
                              Ativo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: METAS COMERCIAIS */}
          {activeTab === 'metas' && (
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-3 border-b border-border mb-4">
                <CardTitle className="text-base">Metas Comerciais</CardTitle>
                <CardDescription className="text-xs">Defina o alvo de faturamento mensal para os relatórios e IA.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-sm">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Meta Mensal da Empresa (R$)</label>
                  <Input 
                    type="number" 
                    value={metaMensal} 
                    onChange={e => setMetaMensal(Number(e.target.value))} 
                    className="bg-muted/30 text-sm border-border font-bold text-primary" 
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                    <Info className="w-3.5 h-3.5" /> A meta atual é usada como linha base no gráfico financeiro.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: IA E PREFERÊNCIAS */}
          {activeTab === 'ia' && (
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-3 border-b border-border mb-4">
                <CardTitle className="text-base">Preferências da Magis IA</CardTitle>
                <CardDescription className="text-xs">Configurações avançadas de autonomia, tom de voz e regras de negócios.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                
                {/* Autonomy Level */}
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground">Nível de Autonomia da IA</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { level: 1, title: '1. Apenas sugerir', desc: 'A IA apenas sugere insights na tela, sem preparar rascunhos.' },
                      { level: 2, title: '2. Sugerir e preparar ações', desc: 'A IA sugere e deixa as mensagens/tarefas prontas para envio.' },
                      { level: 3, title: '3. Criar ações com aprovação', desc: 'A IA cria campanhas e tarefas ativamente, pedindo sua aprovação.' },
                      { level: 4, title: '4. Executar ações automaticamente', desc: 'A IA toma decisões, envia mensagens e cria tarefas 100% sozinha.' },
                    ].map((opt) => (
                      <div key={opt.level} className="flex items-start gap-3 p-3 border border-border rounded-xl bg-muted/20 cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-muted-foreground flex items-center justify-center shrink-0">
                          {opt.level === 3 && <div className="w-2 h-2 bg-primary rounded-full" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/60 my-6" />

                {/* Handover Rules */}
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground">Pontos de Encaminhamento (Handover)</h3>
                  <p className="text-xs text-muted-foreground">Quando o atendimento automático da IA deve ser repassado para um humano?</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { label: 'Quando pedir preço', active: false },
                      { label: 'Quando o lead estiver quente', active: true },
                      { label: 'Quando pedir orçamento', active: true },
                      { label: 'Quando pedir humano', active: true },
                      { label: 'Etapa de fechamento', active: false },
                      { label: 'Reclamação/Suporte', active: true },
                    ].map((rule, idx) => (
                      <label key={idx} className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/10 cursor-pointer hover:bg-muted/30">
                        <input type="checkbox" defaultChecked={rule.active} className="rounded text-primary focus:ring-primary bg-background border-border" />
                        <span className="text-xs font-medium">{rule.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/60 my-6" />

                {/* Toggles */}
                <div className="space-y-4">
                  <h3 className="font-bold text-foreground">Permissões e Proatividade</h3>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-semibold text-foreground text-sm">Sugestões Proativas da IA</p>
                      <p className="text-xs text-muted-foreground mt-0.5">A IA calcula oportunidades de recompra em background e notifica no dashboard.</p>
                    </div>
                    <button 
                      onClick={() => setAtivarProativo(!ativarProativo)}
                      className={cn("w-10 h-5.5 rounded-full relative flex items-center px-1 transition-colors cursor-pointer", ativarProativo ? "bg-primary" : "bg-muted")}
                    >
                      <div className={cn("w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm", ativarProativo ? "ml-auto" : "mr-auto")} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-semibold text-foreground text-sm">Autoresposta WhatsApp</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Permite a IA responder e qualificar mensagens simples de forma autônoma.</p>
                    </div>
                    <button 
                      onClick={() => setAtivarWA(!ativarWA)}
                      className={cn("w-10 h-5.5 rounded-full relative flex items-center px-1 transition-colors cursor-pointer", ativarWA ? "bg-primary" : "bg-muted")}
                    >
                      <div className={cn("w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm", ativarWA ? "ml-auto" : "mr-auto")} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/60">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Tom de Voz Oficial da IA</label>
                    <select 
                      className="w-full bg-muted/30 border border-border rounded-lg text-xs font-semibold px-3 py-2.5 outline-none"
                      value={tomVoz}
                      onChange={e => setTomVoz(e.target.value)}
                    >
                      <option>Profissional e Objetivo</option>
                      <option>Descontraído e Amigável</option>
                      <option>Formal e Corporativo</option>
                      <option>Persuasivo e Vendedor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Modelo de Linguagem (Engine)</label>
                    <select 
                      className="w-full bg-muted/30 border border-border rounded-lg text-xs font-semibold px-3 py-2.5 outline-none"
                      value={modeloIA}
                      onChange={e => setModeloIA(e.target.value)}
                    >
                      <option>Ollama (Llama 3 8B) - Offline</option>
                      <option>Ollama (Qwen 2.5) - Offline</option>
                      <option>Groq (Llama 3 70B) - Rápido</option>
                      <option>Gemini 1.5 Pro</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 5: CANAIS E INTEGRAÇÕES */}
          {activeTab === 'canais' && (
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-3 border-b border-border mb-4">
                <CardTitle className="text-base">Canais e Integrações</CardTitle>
                <CardDescription className="text-xs">Conecte APIs externas e canais de mensageria à base.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border bg-muted/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">WhatsApp Cloud API</p>
                      <p className="text-[10px] text-green-positive font-bold uppercase mt-1">Conectado</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-positive" />
                  </div>
                  <div className="p-4 border border-border bg-muted/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Instagram Graph API</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Desconectado</p>
                    </div>
                    <button className="px-3 py-1 bg-primary text-white rounded text-xs font-bold hover:bg-primary/90 transition-colors">Conectar</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 6: AGENTES DE IA E CONHECIMENTO */}
          {activeTab === 'agentes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">Agentes de IA e Conhecimento</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Configure agentes autônomos para atendimento, vendas e análise.</p>
                </div>
                <button 
                  onClick={() => setShowNovoAgente(true)}
                  className="px-3.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Novo Agente
                </button>
              </div>
              
              <div className="space-y-3">
                {agentesIA.map(agente => (
                  <Card key={agente.id} className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl shrink-0">
                          {agente.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{agente.nome}</p>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              agente.ativo ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'
                            )}>{agente.ativo ? 'Ativo' : 'Inativo'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{agente.descricao}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-muted-foreground">Tom: {agente.tom}</span>
                            <span className="text-[10px] text-muted-foreground">Módulo: {agente.modulo}</span>
                            <span className="text-[10px] text-muted-foreground">{agente.arquivosConhecimento} arquivo(s) de conhecimento</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setAgentesIA(prev => prev.map(a => a.id === agente.id ? {...a, ativo: !a.ativo} : a))}
                          className={cn("w-10 h-5 rounded-full relative flex items-center px-0.5 transition-colors cursor-pointer", agente.ativo ? "bg-green-500" : "bg-muted")}
                        >
                          <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-sm", agente.ativo ? "ml-auto" : "")} />
                        </button>
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {showNovoAgente && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <div className="bg-background/80 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_0_80px_rgba(139,92,246,0.15)] w-full max-w-lg p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Novo Agente Magis</h3>
                        <p className="text-[13px] text-muted-foreground font-medium mt-1">Configure um novo especialista autônomo.</p>
                      </div>
                      <button onClick={() => setShowNovoAgente(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Nome do Agente</label>
                          <input 
                            className="w-full bg-background border border-border/50 shadow-sm rounded-xl text-sm font-semibold px-4 py-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            placeholder="Ex: Closer de Vendas"
                            value={novoAgentNome}
                            onChange={e => setNovoAgentNome(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Módulo Principal</label>
                          <select 
                            className="w-full bg-background border border-border/50 shadow-sm rounded-xl text-sm font-semibold px-4 py-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                            value={novoAgentModulo}
                            onChange={e => setNovoAgentModulo(e.target.value)}
                          >
                            <option value="vendas">Vendas</option>
                            <option value="atendimento">Atendimento</option>
                            <option value="estoque">Estoque</option>
                            <option value="financeiro">Financeiro</option>
                            <option value="marketing">Marketing</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Descrição e Objetivo</label>
                        <textarea 
                          className="w-full bg-background border border-border/50 shadow-sm rounded-xl text-sm font-semibold px-4 py-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all h-24 resize-none leading-relaxed"
                          placeholder="Descreva o objetivo e o comportamento deste agente..."
                          value={novoAgentDesc}
                          onChange={e => setNovoAgentDesc(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Tom de Voz</label>
                        <select 
                          className="w-full bg-background border border-border/50 shadow-sm rounded-xl text-sm font-semibold px-4 py-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                          value={novoAgentTom}
                          onChange={e => setNovoAgentTom(e.target.value)}
                        >
                          <option value="Profissional">Profissional</option>
                          <option value="Consultivo">Consultivo e Empático</option>
                          <option value="Direto">Direto e Objetivo</option>
                          <option value="Formal">Formal e Corporativo</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setShowNovoAgente(false)} className="flex-1 px-4 py-3 border border-border/60 text-foreground bg-background hover:bg-muted shadow-sm rounded-xl text-[13px] font-bold transition-all">Cancelar</button>
                      <button 
                        onClick={() => {
                          if (!novoAgentNome.trim()) return
                          const novo = {
                            id: `ag-${Date.now()}`,
                            icon: '🤖',
                            nome: novoAgentNome,
                            descricao: novoAgentDesc || `Agente especializado em ${novoAgentModulo}`,
                            modulo: novoAgentModulo,
                            tom: novoAgentTom,
                            ativo: true,
                            arquivosConhecimento: 0
                          }
                          setAgentesIA(prev => [...prev, novo])
                          setShowNovoAgente(false)
                          setNovoAgentNome('')
                          setNovoAgentDesc('')
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 transition-all"
                      >
                        <Sparkles className="w-4 h-4" /> Finalizar Agente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SEGURANÇA E CHAVES */}
          {activeTab === 'seguranca' && (
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-3 border-b border-border mb-4">
                <CardTitle className="text-base">Segurança e Chaves de API</CardTitle>
                <CardDescription className="text-xs">Gerencie credenciais de segurança e chaves de acesso externas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-md">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-muted-foreground" /> Gemini API Key
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      type="password" 
                      value={apiKey} 
                      onChange={e => setApiKey(e.target.value)} 
                      className="bg-muted/30 text-sm border-border" 
                    />
                    <button className="px-4 py-2 border border-border bg-card hover:bg-muted rounded-lg text-xs font-semibold transition-all">Testar</button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Sua chave é criptografada e armazenada no servidor local.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SAVE BUTTONS FOOTER */}
          <div className="flex justify-end gap-3 shrink-0 pt-4 border-t border-border/60">
            <button className="px-5 py-2.5 border border-border bg-card text-foreground hover:bg-muted rounded-lg text-xs font-bold transition-colors">Cancelar</button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
