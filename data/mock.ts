// ============================================================
// MAGISTER ERP IA — Base de Dados Mockada
// ============================================================

// ── TIPOS ────────────────────────────────────────────────────

export type ClienteStatus = 'ativo' | 'inativo' | 'lead'
export type ClienteSegmento = 'varejo' | 'construcao' | 'industria' | 'servicos' | 'atacado'
export type NegociacaoStage = 'novo_lead' | 'em_atendimento' | 'orcamento' | 'negociacao' | 'fechado' | 'perdido'
export type ProdutoRisco = 'ruptura' | 'baixo' | 'ok' | 'excesso'
export type TarefaStatus = 'a_fazer' | 'em_andamento' | 'aguardando' | 'concluido'
export type TarefaPrioridade = 'alta' | 'media' | 'baixa'
export type CampanhaStatus = 'rascunho' | 'pronta' | 'enviada' | 'concluida'
export type ConversaStatus = 'novo' | 'em_atendimento' | 'aguardando' | 'resolvido'
export type AgendaTipo = 'reuniao' | 'followup' | 'apresentacao' | 'visita'
export type AgendaStatus = 'pendente' | 'confirmado' | 'cancelado'

export interface HistoricoCompra {
  data: string
  produto: string
  valor: number
}

export interface Cliente {
  id: string
  nome: string
  empresa: string
  telefone: string
  email: string
  segmento: ClienteSegmento
  cidade: string
  estado: string
  status: ClienteStatus
  ultimaCompra: string
  totalComprado: number
  ticketMedio: number
  vendedorId: string
  scoreRecompra: number
  historicoCompras: HistoricoCompra[]
  canal: string
  diasSemCompra: number
}

export interface Produto {
  id: string
  nome: string
  categoria: string
  preco: number
  custo: number
  margem: number
  estoqueAtual: number
  estoqueMinimo: number
  mediaVendaMensal: number
  scorePotencial: number
  status: 'ativo' | 'inativo' | 'parado'
  risco: ProdutoRisco
  diasParado?: number
}

export interface Negociacao {
  id: string
  clienteId: string
  clienteNome: string
  clienteEmpresa: string
  valor: number
  stage: NegociacaoStage
  vendedorId: string
  vendedorNome: string
  previsaoFechamento: string
  probabilidadeIA: number
  canal: string
  tags: string[]
  diasNaEtapa: number
  descricao: string
}

export interface Tarefa {
  id: string
  titulo: string
  descricao: string
  prioridade: TarefaPrioridade
  status: TarefaStatus
  responsavelId: string
  responsavelNome: string
  prazo: string
  origem: 'ia' | 'manual'
  clienteId?: string
  clienteNome?: string
  campanhaId?: string
}

export interface Campanha {
  id: string
  nome: string
  publico: string
  totalContatos: number
  mensagem: string
  canal: string
  status: CampanhaStatus
  responsavelId: string
  responsavelNome: string
  metaEstimada: number
  criadaPorIA: boolean
  resultado?: number
  envios?: number
  respostas?: number
  createdAt: string
}

export interface LancamentoFinanceiro {
  id: string
  descricao: string
  tipo: 'receita' | 'despesa'
  valor: number
  vencimento: string
  status: 'pendente' | 'pago' | 'vencido'
  categoria: string
}

export interface FinanceiroMensal {
  mes: string
  receita: number
  despesa: number
  resultado: number
}

export interface Mensagem {
  id: string
  conteudo: string
  tipo: 'entrada' | 'saida'
  timestamp: string
  agente?: string
  sugestaoIA?: boolean
}

export interface Conversa {
  id: string
  contatoNome: string
  contatoEmpresa: string
  contatoTelefone: string
  ultimaMensagem: string
  timestamp: string
  status: ConversaStatus
  agenteId?: string
  agenteNome?: string
  tags: string[]
  mensagens: Mensagem[]
  clienteId?: string
  scoreCliente?: number
  tempoEspera: string
  canal: 'whatsapp' | 'instagram' | 'email'
  sugestaoIA?: string
}

export interface FluxoNo {
  id: string
  tipo: 'gatilho' | 'condicao' | 'acao'
  titulo: string
  descricao: string
  proximoId?: string
  alternativaId?: string
}

export interface FluxoIA {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  nos: FluxoNo[]
  disparos: number
  resolucoes: number
  createdAt: string
}

export interface EventoAgenda {
  id: string
  titulo: string
  descricao?: string
  tipo: AgendaTipo
  data: string
  hora: string
  participantes: string[]
  local: string
  status: AgendaStatus
  ia: boolean
  tarefaId?: string
  clienteId?: string
}

// ── EMPRESA ──────────────────────────────────────────────────

export const EMPRESA = {
  id: 'emp-01',
  nome: 'Empresa Demonstração Ltda',
  segmento: 'Varejo B2B',
  cidade: 'Porto Alegre',
  estado: 'RS',
  cnpj: '12.345.678/0001-90',
  metaMensal: 1850000.00,
  telefone: '(51) 9999-0000',
  email: 'contato@magister.com.br',
}

// ── USUÁRIOS ─────────────────────────────────────────────────

export const USUARIOS = [
  { id: 'usr-01', nome: 'Rafael Oliveira', perfil: 'Administrador', email: 'rafael@magister.com', avatar: 'RO' },
  { id: 'usr-02', nome: 'Ana Martins', perfil: 'Comercial', email: 'ana@magister.com', avatar: 'AM' },
  { id: 'usr-03', nome: 'Lucas Pereira', perfil: 'Estoque', email: 'lucas@magister.com', avatar: 'LP' },
  { id: 'usr-04', nome: 'Mariana Souza', perfil: 'Financeiro', email: 'mariana@magister.com', avatar: 'MS' },
  { id: 'usr-05', nome: 'Carlos Mendes', perfil: 'Vendedor', email: 'carlos@magister.com', avatar: 'CM' },
]

// ── CLIENTES (50) ─────────────────────────────────────────────

export const CLIENTES: Cliente[] = [
  { id:'cli-01', nome:'Rodrigo Alves', empresa:'Construtora Alves Ltda', telefone:'(51) 99100-0001', email:'rodrigo@alves.com.br', segmento:'construcao', cidade:'Porto Alegre', estado:'RS', status:'ativo', ultimaCompra:'28/04/2025', totalComprado:284500, ticketMedio:8700, vendedorId:'usr-02', scoreRecompra:92, canal:'Indicação', diasSemCompra:5, historicoCompras:[{data:'28/04/2025',produto:'Produto X',valor:12400},{data:'10/03/2025',produto:'Kit Comercial B2B',valor:8900},{data:'15/01/2025',produto:'Linha Premium A',valor:11200}] },
  { id:'cli-02', nome:'Fernanda Costa', empresa:'Casa & Obra Materiais', telefone:'(51) 99100-0002', email:'fcosta@casaobra.com', segmento:'construcao', cidade:'Canoas', estado:'RS', status:'ativo', ultimaCompra:'27/04/2025', totalComprado:198300, ticketMedio:6200, vendedorId:'usr-05', scoreRecompra:89, canal:'Google', diasSemCompra:6, historicoCompras:[{data:'27/04/2025',produto:'Produto Y',valor:9800},{data:'02/03/2025',produto:'Combo Revenda',valor:7600}] },
  { id:'cli-03', nome:'João Mendes', empresa:'João Mendes ME', telefone:'(51) 99100-0003', email:'joao@mendesme.com', segmento:'varejo', cidade:'Porto Alegre', estado:'RS', status:'ativo', ultimaCompra:'25/04/2025', totalComprado:156700, ticketMedio:4800, vendedorId:'usr-02', scoreRecompra:87, canal:'WhatsApp', diasSemCompra:8, historicoCompras:[{data:'25/04/2025',produto:'Produto Z',valor:6200}] },
  { id:'cli-04', nome:'Marcelo Santos', empresa:'Prime Engenharia', telefone:'(51) 99100-0004', email:'marcelo@prime.eng.br', segmento:'construcao', cidade:'São Leopoldo', estado:'RS', status:'ativo', ultimaCompra:'24/04/2025', totalComprado:312800, ticketMedio:9500, vendedorId:'usr-05', scoreRecompra:85, canal:'Indicação', diasSemCompra:9, historicoCompras:[{data:'24/04/2025',produto:'Linha Premium A',valor:14200}] },
  { id:'cli-05', nome:'Carla Ribeiro', empresa:'Depósito São Miguel', telefone:'(51) 99100-0005', email:'carla@deposito.com', segmento:'atacado', cidade:'Novo Hamburgo', estado:'RS', status:'ativo', ultimaCompra:'23/04/2025', totalComprado:87400, ticketMedio:3200, vendedorId:'usr-02', scoreRecompra:83, canal:'Instagram', diasSemCompra:10, historicoCompras:[{data:'23/04/2025',produto:'Combo Revenda',valor:4800}] },
  { id:'cli-06', nome:'Paulo Ferreira', empresa:'Mercado Central B2B', telefone:'(51) 99100-0006', email:'paulo@mercadocentral.com', segmento:'varejo', cidade:'Porto Alegre', estado:'RS', status:'ativo', ultimaCompra:'20/04/2025', totalComprado:145000, ticketMedio:5200, vendedorId:'usr-05', scoreRecompra:79, canal:'Google', diasSemCompra:13, historicoCompras:[{data:'20/04/2025',produto:'Produto X',valor:8100}] },
  { id:'cli-07', nome:'Juliana Lima', empresa:'Loja Comercial Silva', telefone:'(51) 99100-0007', email:'juliana@comercialsilva.com', segmento:'varejo', cidade:'Gramado', estado:'RS', status:'ativo', ultimaCompra:'18/04/2025', totalComprado:98200, ticketMedio:3800, vendedorId:'usr-02', scoreRecompra:75, canal:'Indicação', diasSemCompra:15, historicoCompras:[{data:'18/04/2025',produto:'Item Giro Alto',valor:5600}] },
  { id:'cli-08', nome:'Roberto Nunes', empresa:'Distribuidora Horizonte', telefone:'(51) 99100-0008', email:'roberto@horizonte.com', segmento:'atacado', cidade:'Caxias do Sul', estado:'RS', status:'ativo', ultimaCompra:'15/04/2025', totalComprado:278000, ticketMedio:8200, vendedorId:'usr-05', scoreRecompra:72, canal:'WhatsApp', diasSemCompra:18, historicoCompras:[{data:'15/04/2025',produto:'Kit Comercial B2B',valor:11400}] },
  { id:'cli-09', nome:'Beatriz Oliveira', empresa:'Atacado Nova Era', telefone:'(51) 99100-0009', email:'beatriz@novaera.com', segmento:'atacado', cidade:'Pelotas', estado:'RS', status:'ativo', ultimaCompra:'12/04/2025', totalComprado:189600, ticketMedio:6700, vendedorId:'usr-02', scoreRecompra:68, canal:'Google', diasSemCompra:21, historicoCompras:[{data:'12/04/2025',produto:'Produto Alta Margem',valor:9200}] },
  { id:'cli-10', nome:'Diego Torres', empresa:'Grupo Varejo Sul', telefone:'(51) 99100-0010', email:'diego@grupovarejo.com', segmento:'varejo', cidade:'Santa Maria', estado:'RS', status:'ativo', ultimaCompra:'10/04/2025', totalComprado:432100, ticketMedio:12400, vendedorId:'usr-05', scoreRecompra:65, canal:'Indicação', diasSemCompra:23, historicoCompras:[{data:'10/04/2025',produto:'Linha Premium A',valor:18600}] },
  { id:'cli-11', nome:'Patricia Moreira', empresa:'Comercial Porto Forte', telefone:'(51) 99100-0011', email:'patricia@portoforte.com', segmento:'atacado', cidade:'Porto Alegre', estado:'RS', status:'inativo', ultimaCompra:'15/01/2025', totalComprado:76400, ticketMedio:2800, vendedorId:'usr-02', scoreRecompra:38, canal:'WhatsApp', diasSemCompra:106, historicoCompras:[{data:'15/01/2025',produto:'Combo Revenda',valor:3200}] },
  { id:'cli-12', nome:'Eduardo Campos', empresa:'Rede Max Compras', telefone:'(51) 99100-0012', email:'edu@redemax.com', segmento:'varejo', cidade:'Passo Fundo', estado:'RS', status:'inativo', ultimaCompra:'08/01/2025', totalComprado:54200, ticketMedio:1900, vendedorId:'usr-05', scoreRecompra:32, canal:'Instagram', diasSemCompra:113, historicoCompras:[{data:'08/01/2025',produto:'Produto Sazonal',valor:2400}] },
  { id:'cli-13', nome:'Larissa Fontes', empresa:'Casa Nova Atacado', telefone:'(51) 99100-0013', email:'larissa@casanova.com', segmento:'atacado', cidade:'Canoas', estado:'RS', status:'inativo', ultimaCompra:'22/12/2024', totalComprado:128900, ticketMedio:4200, vendedorId:'usr-02', scoreRecompra:29, canal:'Google', diasSemCompra:130, historicoCompras:[{data:'22/12/2024',produto:'Item Giro Alto',valor:5800}] },
  { id:'cli-14', nome:'Thiago Martins', empresa:'Materiais União', telefone:'(51) 99100-0014', email:'thiago@materiaisuniao.com', segmento:'construcao', cidade:'Porto Alegre', estado:'RS', status:'inativo', ultimaCompra:'10/12/2024', totalComprado:87600, ticketMedio:3100, vendedorId:'usr-05', scoreRecompra:25, canal:'Indicação', diasSemCompra:142, historicoCompras:[{data:'10/12/2024',produto:'Produto Z',valor:3800}] },
  { id:'cli-15', nome:'Camila Souza', empresa:'Sul Distribuidora', telefone:'(51) 99100-0015', email:'camila@suldistrib.com', segmento:'atacado', cidade:'Viamão', estado:'RS', status:'inativo', ultimaCompra:'01/12/2024', totalComprado:43200, ticketMedio:1600, vendedorId:'usr-02', scoreRecompra:22, canal:'WhatsApp', diasSemCompra:151, historicoCompras:[{data:'01/12/2024',produto:'Produto W',valor:2100}] },
  { id:'cli-16', nome:'Felipe Gonçalves', empresa:'Gonçalves & Cia', telefone:'(51) 99100-0016', email:'felipe@goncalvescia.com', segmento:'industria', cidade:'Gravataí', estado:'RS', status:'ativo', ultimaCompra:'22/04/2025', totalComprado:212300, ticketMedio:7800, vendedorId:'usr-05', scoreRecompra:81, canal:'Google', diasSemCompra:11, historicoCompras:[{data:'22/04/2025',produto:'Produto Alta Margem',valor:10200}] },
  { id:'cli-17', nome:'Amanda Xavier', empresa:'Xavier Comércio', telefone:'(51) 99100-0017', email:'amanda@xavier.com', segmento:'varejo', cidade:'Porto Alegre', estado:'RS', status:'ativo', ultimaCompra:'19/04/2025', totalComprado:67400, ticketMedio:2500, vendedorId:'usr-02', scoreRecompra:74, canal:'Instagram', diasSemCompra:14, historicoCompras:[{data:'19/04/2025',produto:'Produto X',valor:3200}] },
  { id:'cli-18', nome:'Gustavo Pires', empresa:'Pires Atacadista', telefone:'(51) 99100-0018', email:'gustavo@piresatac.com', segmento:'atacado', cidade:'Caxias do Sul', estado:'RS', status:'ativo', ultimaCompra:'16/04/2025', totalComprado:389200, ticketMedio:11200, vendedorId:'usr-05', scoreRecompra:77, canal:'Indicação', diasSemCompra:17, historicoCompras:[{data:'16/04/2025',produto:'Kit Comercial B2B',valor:15800}] },
  { id:'cli-19', nome:'Renata Almeida', empresa:'Almeida & Filhos', telefone:'(51) 99100-0019', email:'renata@almeidafilhos.com', segmento:'construcao', cidade:'São Leopoldo', estado:'RS', status:'lead', ultimaCompra:'-', totalComprado:0, ticketMedio:0, vendedorId:'usr-02', scoreRecompra:0, canal:'Google', diasSemCompra:0, historicoCompras:[] },
  { id:'cli-20', nome:'Henrique Castro', empresa:'Castro Materiais', telefone:'(51) 99100-0020', email:'henrique@castromatx.com', segmento:'construcao', cidade:'Porto Alegre', estado:'RS', status:'lead', ultimaCompra:'-', totalComprado:0, ticketMedio:0, vendedorId:'usr-05', scoreRecompra:0, canal:'WhatsApp', diasSemCompra:0, historicoCompras:[] },
  { id:'cli-21', nome:'Isabela Rocha', empresa:'Rocha Comércio Ltda', telefone:'(51) 99100-0021', email:'isa@rochacomercio.com', segmento:'varejo', cidade:'Novo Hamburgo', estado:'RS', status:'ativo', ultimaCompra:'05/04/2025', totalComprado:92100, ticketMedio:3400, vendedorId:'usr-02', scoreRecompra:62, canal:'Google', diasSemCompra:28, historicoCompras:[{data:'05/04/2025',produto:'Produto Y',valor:4100}] },
  { id:'cli-22', nome:'Leonardo Braga', empresa:'Braga Distribuições', telefone:'(51) 99100-0022', email:'leo@bragadistrib.com', segmento:'atacado', cidade:'Porto Alegre', estado:'RS', status:'inativo', ultimaCompra:'14/02/2025', totalComprado:168400, ticketMedio:5600, vendedorId:'usr-05', scoreRecompra:41, canal:'Indicação', diasSemCompra:78, historicoCompras:[{data:'14/02/2025',produto:'Linha Premium A',valor:7200}] },
  { id:'cli-23', nome:'Natalia Freitas', empresa:'Freitas & Associados', telefone:'(51) 99100-0023', email:'natalia@freitasassoc.com', segmento:'servicos', cidade:'Canoas', estado:'RS', status:'inativo', ultimaCompra:'20/01/2025', totalComprado:34800, ticketMedio:1400, vendedorId:'usr-02', scoreRecompra:28, canal:'Instagram', diasSemCompra:101, historicoCompras:[{data:'20/01/2025',produto:'Produto Sazonal',valor:1800}] },
  { id:'cli-24', nome:'Alexandre Ramos', empresa:'Ramos Industrial', telefone:'(51) 99100-0024', email:'alex@ramosindustrial.com', segmento:'industria', cidade:'Gravataí', estado:'RS', status:'ativo', ultimaCompra:'01/04/2025', totalComprado:521000, ticketMedio:14800, vendedorId:'usr-05', scoreRecompra:58, canal:'Google', diasSemCompra:32, historicoCompras:[{data:'01/04/2025',produto:'Kit Comercial B2B',valor:19600}] },
  { id:'cli-25', nome:'Vanessa Teixeira', empresa:'Teixeira Varejo', telefone:'(51) 99100-0025', email:'vanessa@teixeiravarejo.com', segmento:'varejo', cidade:'Pelotas', estado:'RS', status:'ativo', ultimaCompra:'28/03/2025', totalComprado:76200, ticketMedio:2900, vendedorId:'usr-02', scoreRecompra:54, canal:'WhatsApp', diasSemCompra:35, historicoCompras:[{data:'28/03/2025',produto:'Produto V',valor:3500}] },
  { id:'cli-26', nome:'Fábio Cardoso', empresa:'Cardoso Atacadista', telefone:'(51) 99100-0026', email:'fabio@cardosoatac.com', segmento:'atacado', cidade:'Santa Maria', estado:'RS', status:'inativo', ultimaCompra:'10/11/2024', totalComprado:218700, ticketMedio:6900, vendedorId:'usr-05', scoreRecompra:18, canal:'Indicação', diasSemCompra:173, historicoCompras:[{data:'10/11/2024',produto:'Produto Alta Margem',valor:8400}] },
  { id:'cli-27', nome:'Bruna Correia', empresa:'Correia & Irmãos', telefone:'(51) 99100-0027', email:'bruna@correiairmao.com', segmento:'varejo', cidade:'Porto Alegre', estado:'RS', status:'inativo', ultimaCompra:'05/11/2024', totalComprado:45600, ticketMedio:1700, vendedorId:'usr-02', scoreRecompra:15, canal:'Google', diasSemCompra:178, historicoCompras:[{data:'05/11/2024',produto:'Produto Sazonal',valor:2200}] },
  { id:'cli-28', nome:'Danilo Medeiros', empresa:'Medeiros Comércio', telefone:'(51) 99100-0028', email:'danilo@medeiroscomercio.com', segmento:'varejo', cidade:'Caxias do Sul', estado:'RS', status:'ativo', ultimaCompra:'14/04/2025', totalComprado:134700, ticketMedio:4600, vendedorId:'usr-05', scoreRecompra:70, canal:'Instagram', diasSemCompra:19, historicoCompras:[{data:'14/04/2025',produto:'Produto X',valor:5800}] },
  { id:'cli-29', nome:'Luciana Vieira', empresa:'Vieira Atacado', telefone:'(51) 99100-0029', email:'luciana@vieiraatacado.com', segmento:'atacado', cidade:'Porto Alegre', estado:'RS', status:'ativo', ultimaCompra:'11/04/2025', totalComprado:287400, ticketMedio:8900, vendedorId:'usr-02', scoreRecompra:66, canal:'Indicação', diasSemCompra:22, historicoCompras:[{data:'11/04/2025',produto:'Linha Premium A',valor:12800}] },
  { id:'cli-30', nome:'Marcio Barbosa', empresa:'Barbosa & CIA', telefone:'(51) 99100-0030', email:'marcio@barbosacia.com', segmento:'industria', cidade:'Passo Fundo', estado:'RS', status:'inativo', ultimaCompra:'28/02/2025', totalComprado:389100, ticketMedio:11600, vendedorId:'usr-05', scoreRecompra:45, canal:'Google', diasSemCompra:64, historicoCompras:[{data:'28/02/2025',produto:'Kit Comercial B2B',valor:16200}] },
  { id:'cli-31', nome:'Simone Carvalho', empresa:'Carvalho Distribuidora', telefone:'(51) 99100-0031', email:'simone@carvalhod.com', segmento:'atacado', cidade:'Novo Hamburgo', estado:'RS', status:'inativo', ultimaCompra:'12/01/2025', totalComprado:67800, ticketMedio:2300, vendedorId:'usr-02', scoreRecompra:30, canal:'WhatsApp', diasSemCompra:109, historicoCompras:[{data:'12/01/2025',produto:'Produto W',valor:2800}] },
  { id:'cli-32', nome:'Rafael Bento', empresa:'Bento Construções', telefone:'(51) 99100-0032', email:'rafael@bentoconstrucoes.com', segmento:'construcao', cidade:'Canoas', estado:'RS', status:'ativo', ultimaCompra:'08/04/2025', totalComprado:178200, ticketMedio:6100, vendedorId:'usr-05', scoreRecompra:60, canal:'Indicação', diasSemCompra:25, historicoCompras:[{data:'08/04/2025',produto:'Produto Z',valor:7400}] },
  { id:'cli-33', nome:'Carolina Duarte', empresa:'Duarte Varejo', telefone:'(51) 99100-0033', email:'carol@duartevarejo.com', segmento:'varejo', cidade:'Porto Alegre', estado:'RS', status:'lead', ultimaCompra:'-', totalComprado:0, ticketMedio:0, vendedorId:'usr-02', scoreRecompra:0, canal:'Instagram', diasSemCompra:0, historicoCompras:[] },
  { id:'cli-34', nome:'Gabriel Azevedo', empresa:'Azevedo Atacadista', telefone:'(51) 99100-0034', email:'gabriel@azevedoatac.com', segmento:'atacado', cidade:'São Leopoldo', estado:'RS', status:'ativo', ultimaCompra:'04/04/2025', totalComprado:245600, ticketMedio:7600, vendedorId:'usr-05', scoreRecompra:56, canal:'Google', diasSemCompra:29, historicoCompras:[{data:'04/04/2025',produto:'Kit Comercial B2B',valor:10400}] },
  { id:'cli-35', nome:'Leticia Melo', empresa:'Melo & Companhia', telefone:'(51) 99100-0035', email:'leticia@melocia.com', segmento:'servicos', cidade:'Gramado', estado:'RS', status:'inativo', ultimaCompra:'18/12/2024', totalComprado:28900, ticketMedio:1200, vendedorId:'usr-02', scoreRecompra:20, canal:'WhatsApp', diasSemCompra:134, historicoCompras:[{data:'18/12/2024',produto:'Produto Sazonal',valor:1600}] },
  { id:'cli-36', nome:'Marcos Oliveira', empresa:'Oliveira Tech', telefone:'(51) 99100-0036', email:'marcos@oliveiratech.com', segmento:'industria', cidade:'Porto Alegre', estado:'RS', status:'ativo', ultimaCompra:'25/03/2025', totalComprado:412800, ticketMedio:13200, vendedorId:'usr-05', scoreRecompra:51, canal:'Google', diasSemCompra:38, historicoCompras:[{data:'25/03/2025',produto:'Linha Premium A',valor:18400}] },
  { id:'cli-37', nome:'Tatiana Santos', empresa:'Santos Comércio', telefone:'(51) 99100-0037', email:'tati@santoscomercio.com', segmento:'varejo', cidade:'Pelotas', estado:'RS', status:'inativo', ultimaCompra:'05/10/2024', totalComprado:56700, ticketMedio:2100, vendedorId:'usr-02', scoreRecompra:12, canal:'Instagram', diasSemCompra:208, historicoCompras:[{data:'05/10/2024',produto:'Produto V',valor:2600}] },
  { id:'cli-38', nome:'André Cavalcanti', empresa:'Cavalcanti Distribuições', telefone:'(51) 99100-0038', email:'andre@cavalcantidist.com', segmento:'atacado', cidade:'Caxias do Sul', estado:'RS', status:'inativo', ultimaCompra:'20/09/2024', totalComprado:189300, ticketMedio:6400, vendedorId:'usr-05', scoreRecompra:8, canal:'Indicação', diasSemCompra:223, historicoCompras:[{data:'20/09/2024',produto:'Produto Alta Margem',valor:8800}] },
  { id:'cli-39', nome:'Priscila Mendonça', empresa:'Mendonça Varejo', telefone:'(51) 99100-0039', email:'priscila@mendonca.com', segmento:'varejo', cidade:'Porto Alegre', estado:'RS', status:'lead', ultimaCompra:'-', totalComprado:0, ticketMedio:0, vendedorId:'usr-02', scoreRecompra:0, canal:'Google', diasSemCompra:0, historicoCompras:[] },
  { id:'cli-40', nome:'Wesley Nascimento', empresa:'Nascimento & Cia', telefone:'(51) 99100-0040', email:'wesley@nascimentocia.com', segmento:'construcao', cidade:'Gravataí', estado:'RS', status:'ativo', ultimaCompra:'18/03/2025', totalComprado:321400, ticketMedio:9800, vendedorId:'usr-05', scoreRecompra:48, canal:'WhatsApp', diasSemCompra:45, historicoCompras:[{data:'18/03/2025',produto:'Kit Comercial B2B',valor:14600}] },
  { id:'cli-41', nome:'Aline Castro', empresa:'Castro Atacado', telefone:'(51) 99100-0041', email:'aline@castroatacado.com', segmento:'atacado', cidade:'Viamão', estado:'RS', status:'inativo', ultimaCompra:'30/10/2024', totalComprado:78900, ticketMedio:2900, vendedorId:'usr-02', scoreRecompra:14, canal:'Instagram', diasSemCompra:184, historicoCompras:[{data:'30/10/2024',produto:'Produto X',valor:3600}] },
  { id:'cli-42', nome:'Bruno Peixoto', empresa:'Peixoto Indústria', telefone:'(51) 99100-0042', email:'bruno@peixotoind.com', segmento:'industria', cidade:'Porto Alegre', estado:'RS', status:'ativo', ultimaCompra:'10/03/2025', totalComprado:567800, ticketMedio:16400, vendedorId:'usr-05', scoreRecompra:44, canal:'Google', diasSemCompra:53, historicoCompras:[{data:'10/03/2025',produto:'Linha Premium A',valor:22800}] },
  { id:'cli-43', nome:'Daniela Neves', empresa:'Neves Comércio', telefone:'(51) 99100-0043', email:'daniela@nevescomercio.com', segmento:'varejo', cidade:'Novo Hamburgo', estado:'RS', status:'inativo', ultimaCompra:'15/08/2024', totalComprado:34500, ticketMedio:1500, vendedorId:'usr-02', scoreRecompra:6, canal:'WhatsApp', diasSemCompra:258, historicoCompras:[{data:'15/08/2024',produto:'Produto Y',valor:1900}] },
  { id:'cli-44', nome:'Evandro Pinto', empresa:'Pinto Distribuidora', telefone:'(51) 99100-0044', email:'evandro@pintodist.com', segmento:'atacado', cidade:'Canoas', estado:'RS', status:'inativo', ultimaCompra:'20/08/2024', totalComprado:145600, ticketMedio:4800, vendedorId:'usr-05', scoreRecompra:10, canal:'Indicação', diasSemCompra:253, historicoCompras:[{data:'20/08/2024',produto:'Combo Revenda',valor:5800}] },
  { id:'cli-45', nome:'Fernanda Batista', empresa:'Batista Atacado', telefone:'(51) 99100-0045', email:'fer@batistaatacado.com', segmento:'atacado', cidade:'Porto Alegre', estado:'RS', status:'ativo', ultimaCompra:'02/03/2025', totalComprado:198700, ticketMedio:6600, vendedorId:'usr-02', scoreRecompra:42, canal:'Google', diasSemCompra:60, historicoCompras:[{data:'02/03/2025',produto:'Produto Z',valor:8200}] },
  { id:'cli-46', nome:'Caio Rodrigues', empresa:'Rodrigues & Cia Ltda', telefone:'(51) 99100-0046', email:'caio@rodriguescia.com', segmento:'varejo', cidade:'Santa Maria', estado:'RS', status:'lead', ultimaCompra:'-', totalComprado:0, ticketMedio:0, vendedorId:'usr-05', scoreRecompra:0, canal:'Instagram', diasSemCompra:0, historicoCompras:[] },
  { id:'cli-47', nome:'Mônica Figueiredo', empresa:'Figueiredo Varejo', telefone:'(51) 99100-0047', email:'monica@figueiredo.com', segmento:'varejo', cidade:'Porto Alegre', estado:'RS', status:'inativo', ultimaCompra:'10/07/2024', totalComprado:56800, ticketMedio:2100, vendedorId:'usr-02', scoreRecompra:7, canal:'WhatsApp', diasSemCompra:294, historicoCompras:[{data:'10/07/2024',produto:'Produto W',valor:2600}] },
  { id:'cli-48', nome:'Sandro Lopes', empresa:'Lopes Industrial', telefone:'(51) 99100-0048', email:'sandro@lopesindustrial.com', segmento:'industria', cidade:'Gravataí', estado:'RS', status:'ativo', ultimaCompra:'20/02/2025', totalComprado:478200, ticketMedio:14200, vendedorId:'usr-05', scoreRecompra:38, canal:'Google', diasSemCompra:70, historicoCompras:[{data:'20/02/2025',produto:'Kit Comercial B2B',valor:20400}] },
  { id:'cli-49', nome:'Elisa Monteiro', empresa:'Monteiro & Filhos', telefone:'(51) 99100-0049', email:'elisa@monteiro.com', segmento:'construcao', cidade:'Passo Fundo', estado:'RS', status:'inativo', ultimaCompra:'25/06/2024', totalComprado:87600, ticketMedio:3200, vendedorId:'usr-02', scoreRecompra:5, canal:'Indicação', diasSemCompra:309, historicoCompras:[{data:'25/06/2024',produto:'Produto Alta Margem',valor:4200}] },
  { id:'cli-50', nome:'Pedro Henrique Lima', empresa:'Lima Comércio Geral', telefone:'(51) 99100-0050', email:'ph@limacomercio.com', segmento:'varejo', cidade:'Porto Alegre', estado:'RS', status:'ativo', ultimaCompra:'25/04/2025', totalComprado:112400, ticketMedio:4100, vendedorId:'usr-05', scoreRecompra:71, canal:'Google', diasSemCompra:8, historicoCompras:[{data:'25/04/2025',produto:'Produto X',valor:5200}] },
]

// ── PRODUTOS (50) ─────────────────────────────────────────────

export const PRODUTOS: Produto[] = [
  { id:'prod-01', nome:'Produto X', categoria:'Premium', preco:480, custo:220, margem:54, estoqueAtual:48, estoqueMinimo:20, mediaVendaMensal:32, scorePotencial:95, status:'ativo', risco:'ok' },
  { id:'prod-02', nome:'Produto Y', categoria:'Standard', preco:320, custo:140, margem:56, estoqueAtual:32, estoqueMinimo:15, mediaVendaMensal:28, scorePotencial:89, status:'ativo', risco:'ok' },
  { id:'prod-03', nome:'Produto Z', categoria:'Premium', preco:560, custo:260, margem:54, estoqueAtual:15, estoqueMinimo:20, mediaVendaMensal:18, scorePotencial:85, status:'ativo', risco:'ruptura' },
  { id:'prod-04', nome:'Produto W', categoria:'Basic', preco:180, custo:80, margem:56, estoqueAtual:26, estoqueMinimo:10, mediaVendaMensal:22, scorePotencial:78, status:'ativo', risco:'ok' },
  { id:'prod-05', nome:'Produto V', categoria:'Standard', preco:240, custo:110, margem:54, estoqueAtual:60, estoqueMinimo:15, mediaVendaMensal:12, scorePotencial:74, status:'ativo', risco:'excesso' },
  { id:'prod-06', nome:'Linha Premium A', categoria:'Premium', preco:1240, custo:540, margem:56, estoqueAtual:12, estoqueMinimo:8, mediaVendaMensal:9, scorePotencial:91, status:'ativo', risco:'baixo' },
  { id:'prod-07', nome:'Kit Comercial B2B', categoria:'Kit', preco:890, custo:380, margem:57, estoqueAtual:28, estoqueMinimo:10, mediaVendaMensal:21, scorePotencial:88, status:'ativo', risco:'ok' },
  { id:'prod-08', nome:'Combo Revenda', categoria:'Kit', preco:620, custo:270, margem:56, estoqueAtual:35, estoqueMinimo:12, mediaVendaMensal:18, scorePotencial:82, status:'ativo', risco:'ok' },
  { id:'prod-09', nome:'Item Giro Alto', categoria:'Basic', preco:95, custo:38, margem:60, estoqueAtual:8, estoqueMinimo:30, mediaVendaMensal:45, scorePotencial:96, status:'ativo', risco:'ruptura' },
  { id:'prod-10', nome:'Item Estoque Crítico', categoria:'Standard', preco:280, custo:120, margem:57, estoqueAtual:3, estoqueMinimo:15, mediaVendaMensal:14, scorePotencial:70, status:'ativo', risco:'ruptura' },
  { id:'prod-11', nome:'Produto Parado A', categoria:'Standard', preco:390, custo:180, margem:54, estoqueAtual:82, estoqueMinimo:10, mediaVendaMensal:2, scorePotencial:18, status:'parado', risco:'excesso', diasParado:124 },
  { id:'prod-12', nome:'Produto Alta Margem', categoria:'Premium', preco:1680, custo:520, margem:69, estoqueAtual:14, estoqueMinimo:5, mediaVendaMensal:6, scorePotencial:76, status:'ativo', risco:'ok' },
  { id:'prod-13', nome:'Produto Sazonal', categoria:'Sazonal', preco:340, custo:145, margem:57, estoqueAtual:44, estoqueMinimo:8, mediaVendaMensal:4, scorePotencial:52, status:'ativo', risco:'excesso' },
  { id:'prod-14', nome:'Produto Reposição Rápida', categoria:'Basic', preco:120, custo:48, margem:60, estoqueAtual:6, estoqueMinimo:25, mediaVendaMensal:38, scorePotencial:93, status:'ativo', risco:'ruptura' },
  { id:'prod-15', nome:'Linha Econômica B', categoria:'Econômico', preco:89, custo:36, margem:60, estoqueAtual:156, estoqueMinimo:20, mediaVendaMensal:15, scorePotencial:45, status:'ativo', risco:'excesso' },
  { id:'prod-16', nome:'Kit Industrial X', categoria:'Kit', preco:2400, custo:980, margem:59, estoqueAtual:7, estoqueMinimo:3, mediaVendaMensal:4, scorePotencial:64, status:'ativo', risco:'ok' },
  { id:'prod-17', nome:'Produto Parado B', categoria:'Premium', preco:720, custo:320, margem:56, estoqueAtual:38, estoqueMinimo:5, mediaVendaMensal:1, scorePotencial:12, status:'parado', risco:'excesso', diasParado:186 },
  { id:'prod-18', nome:'Acessório A1', categoria:'Acessório', preco:45, custo:18, margem:60, estoqueAtual:320, estoqueMinimo:50, mediaVendaMensal:65, scorePotencial:72, status:'ativo', risco:'excesso' },
  { id:'prod-19', nome:'Acessório B2', categoria:'Acessório', preco:68, custo:26, margem:62, estoqueAtual:18, estoqueMinimo:40, mediaVendaMensal:52, scorePotencial:87, status:'ativo', risco:'ruptura' },
  { id:'prod-20', nome:'Conjunto Premium X', categoria:'Premium', preco:3200, custo:1240, margem:61, estoqueAtual:4, estoqueMinimo:3, mediaVendaMensal:3, scorePotencial:58, status:'ativo', risco:'ok' },
  { id:'prod-21', nome:'Material Básico C', categoria:'Basic', preco:34, custo:14, margem:59, estoqueAtual:428, estoqueMinimo:100, mediaVendaMensal:180, scorePotencial:80, status:'ativo', risco:'excesso' },
  { id:'prod-22', nome:'Produto Especial D', categoria:'Especial', preco:890, custo:380, margem:57, estoqueAtual:9, estoqueMinimo:5, mediaVendaMensal:8, scorePotencial:77, status:'ativo', risco:'baixo' },
  { id:'prod-23', nome:'Kit Manutenção', categoria:'Kit', preco:480, custo:200, margem:58, estoqueAtual:22, estoqueMinimo:8, mediaVendaMensal:16, scorePotencial:83, status:'ativo', risco:'ok' },
  { id:'prod-24', nome:'Produto Exportação E', categoria:'Exportação', preco:1800, custo:720, margem:60, estoqueAtual:2, estoqueMinimo:2, mediaVendaMensal:2, scorePotencial:35, status:'ativo', risco:'ok' },
  { id:'prod-25', nome:'Parafuso Industrial XL', categoria:'Fixação', preco:12, custo:4, margem:67, estoqueAtual:1840, estoqueMinimo:500, mediaVendaMensal:820, scorePotencial:60, status:'ativo', risco:'ok' },
  { id:'prod-26', nome:'Perfil Metálico A40', categoria:'Metal', preco:280, custo:115, margem:59, estoqueAtual:64, estoqueMinimo:20, mediaVendaMensal:38, scorePotencial:73, status:'ativo', risco:'ok' },
  { id:'prod-27', nome:'Concreto Rápido Premium', categoria:'Construção', preco:48, custo:19, margem:60, estoqueAtual:12, estoqueMinimo:40, mediaVendaMensal:85, scorePotencial:92, status:'ativo', risco:'ruptura' },
  { id:'prod-28', nome:'Tinta Acrílica Pro', categoria:'Acabamento', preco:129, custo:52, margem:60, estoqueAtual:38, estoqueMinimo:15, mediaVendaMensal:24, scorePotencial:68, status:'ativo', risco:'ok' },
  { id:'prod-29', nome:'Impermeabilizante X5', categoria:'Impermeabilização', preco:89, custo:36, margem:60, estoqueAtual:45, estoqueMinimo:12, mediaVendaMensal:18, scorePotencial:65, status:'ativo', risco:'ok' },
  { id:'prod-30', nome:'Produto Parado C', categoria:'Standard', preco:220, custo:95, margem:57, estoqueAtual:95, estoqueMinimo:10, mediaVendaMensal:0, scorePotencial:8, status:'parado', risco:'excesso', diasParado:210 },
  { id:'prod-31', nome:'Cabo Elétrico 4mm', categoria:'Elétrico', preco:6.80, custo:2.70, margem:60, estoqueAtual:2400, estoqueMinimo:500, mediaVendaMensal:1200, scorePotencial:71, status:'ativo', risco:'excesso' },
  { id:'prod-32', nome:'Disjuntor Tripolar 63A', categoria:'Elétrico', preco:89, custo:36, margem:60, estoqueAtual:28, estoqueMinimo:15, mediaVendaMensal:22, scorePotencial:75, status:'ativo', risco:'ok' },
  { id:'prod-33', nome:'Tubo PVC 100mm', categoria:'Hidráulico', preco:42, custo:17, margem:60, estoqueAtual:180, estoqueMinimo:60, mediaVendaMensal:95, scorePotencial:62, status:'ativo', risco:'ok' },
  { id:'prod-34', nome:'Registro Esfera 1/2"', categoria:'Hidráulico', preco:28, custo:11, margem:61, estoqueAtual:320, estoqueMinimo:100, mediaVendaMensal:180, scorePotencial:58, status:'ativo', risco:'ok' },
  { id:'prod-35', nome:'Argamassa AC-II 20kg', categoria:'Construção', preco:38, custo:15, margem:61, estoqueAtual:248, estoqueMinimo:80, mediaVendaMensal:145, scorePotencial:66, status:'ativo', risco:'ok' },
  { id:'prod-36', nome:'Tijolo Cerâmico 9F', categoria:'Construção', preco:1.20, custo:0.48, margem:60, estoqueAtual:8400, estoqueMinimo:2000, mediaVendaMensal:4800, scorePotencial:55, status:'ativo', risco:'ok' },
  { id:'prod-37', nome:'Telha Ondulada Fibro', categoria:'Cobertura', preco:28, custo:11, margem:61, estoqueAtual:680, estoqueMinimo:200, mediaVendaMensal:380, scorePotencial:61, status:'ativo', risco:'ok' },
  { id:'prod-38', nome:'Produto Novo Lançamento', categoria:'Lançamento', preco:580, custo:240, margem:59, estoqueAtual:24, estoqueMinimo:10, mediaVendaMensal:8, scorePotencial:84, status:'ativo', risco:'ok' },
  { id:'prod-39', nome:'Equipamento EPI Básico', categoria:'Segurança', preco:120, custo:48, margem:60, estoqueAtual:86, estoqueMinimo:30, mediaVendaMensal:42, scorePotencial:67, status:'ativo', risco:'ok' },
  { id:'prod-40', nome:'Produto Parado D', categoria:'Especial', preco:1240, custo:520, margem:58, estoqueAtual:18, estoqueMinimo:3, mediaVendaMensal:0, scorePotencial:4, status:'parado', risco:'excesso', diasParado:248 },
  { id:'prod-41', nome:'Cola Epoxi Industrial', categoria:'Adesivos', preco:68, custo:27, margem:60, estoqueAtual:142, estoqueMinimo:40, mediaVendaMensal:68, scorePotencial:53, status:'ativo', risco:'ok' },
  { id:'prod-42', nome:'Serra Circular 7.1/4"', categoria:'Ferramentas', preco:420, custo:168, margem:60, estoqueAtual:12, estoqueMinimo:5, mediaVendaMensal:8, scorePotencial:72, status:'ativo', risco:'ok' },
  { id:'prod-43', nome:'Furadeira 650W', categoria:'Ferramentas', preco:280, custo:112, margem:60, estoqueAtual:18, estoqueMinimo:6, mediaVendaMensal:12, scorePotencial:69, status:'ativo', risco:'ok' },
  { id:'prod-44', nome:'Nível a Laser Profis', categoria:'Ferramentas', preco:380, custo:152, margem:60, estoqueAtual:8, estoqueMinimo:4, mediaVendaMensal:6, scorePotencial:74, status:'ativo', risco:'ok' },
  { id:'prod-45', nome:'Luva de Couro Longa', categoria:'EPI', preco:28, custo:11, margem:61, estoqueAtual:480, estoqueMinimo:100, mediaVendaMensal:220, scorePotencial:57, status:'ativo', risco:'ok' },
  { id:'prod-46', nome:'Capacete MSA 2000', categoria:'EPI', preco:38, custo:15, margem:61, estoqueAtual:240, estoqueMinimo:80, mediaVendaMensal:120, scorePotencial:59, status:'ativo', risco:'ok' },
  { id:'prod-47', nome:'Spray Desmoldante', categoria:'Químicos', preco:24, custo:9.50, margem:60, estoqueAtual:380, estoqueMinimo:100, mediaVendaMensal:185, scorePotencial:56, status:'ativo', risco:'ok' },
  { id:'prod-48', nome:'Rolo Lã 23cm Prof', categoria:'Pintura', preco:18, custo:7.20, margem:60, estoqueAtual:520, estoqueMinimo:150, mediaVendaMensal:280, scorePotencial:54, status:'ativo', risco:'ok' },
  { id:'prod-49', nome:'Grout Cimentício', categoria:'Construção', preco:58, custo:23, margem:60, estoqueAtual:4, estoqueMinimo:20, mediaVendaMensal:32, scorePotencial:90, status:'ativo', risco:'ruptura' },
  { id:'prod-50', nome:'Manta Geotêxtil 4m', categoria:'Impermeabilização', preco:8.50, custo:3.40, margem:60, estoqueAtual:840, estoqueMinimo:200, mediaVendaMensal:380, scorePotencial:63, status:'ativo', risco:'ok' },
]

// ── NEGOCIAÇÕES (Kanban Vendas) ──────────────────────────────

export const NEGOCIACOES: Negociacao[] = [
  { id:'neg-01', clienteId:'cli-01', clienteNome:'Rodrigo Alves', clienteEmpresa:'Construtora Alves Ltda', valor:84500, stage:'negociacao', vendedorId:'usr-05', vendedorNome:'Carlos Mendes', previsaoFechamento:'10/06/2025', probabilidadeIA:82, canal:'WhatsApp', tags:['B2B','Construção'], diasNaEtapa:3, descricao:'Proposta de fornecimento trimestral de Linha Premium A' },
  { id:'neg-02', clienteId:'cli-04', clienteNome:'Marcelo Santos', clienteEmpresa:'Prime Engenharia', valor:128000, stage:'negociacao', vendedorId:'usr-02', vendedorNome:'Ana Martins', previsaoFechamento:'12/06/2025', probabilidadeIA:76, canal:'Email', tags:['B2B','Engenharia'], diasNaEtapa:7, descricao:'Contrato de fornecimento de Kit Industrial X e acessórios' },
  { id:'neg-03', clienteId:'cli-08', clienteNome:'Roberto Nunes', clienteEmpresa:'Distribuidora Horizonte', valor:56200, stage:'orcamento', vendedorId:'usr-05', vendedorNome:'Carlos Mendes', previsaoFechamento:'15/06/2025', probabilidadeIA:58, canal:'WhatsApp', tags:['Atacado'], diasNaEtapa:5, descricao:'Pedido de cotação para Kit Comercial B2B mensal' },
  { id:'neg-04', clienteId:'cli-18', clienteNome:'Gustavo Pires', clienteEmpresa:'Pires Atacadista', valor:210000, stage:'orcamento', vendedorId:'usr-02', vendedorNome:'Ana Martins', previsaoFechamento:'20/06/2025', probabilidadeIA:64, canal:'Phone', tags:['Atacado','VIP'], diasNaEtapa:2, descricao:'Proposta de parceria anual com desconto progressivo' },
  { id:'neg-05', clienteId:'cli-33', clienteNome:'Carolina Duarte', clienteEmpresa:'Duarte Varejo', valor:28000, stage:'em_atendimento', vendedorId:'usr-05', vendedorNome:'Carlos Mendes', previsaoFechamento:'25/06/2025', probabilidadeIA:45, canal:'WhatsApp', tags:['Lead','Varejo'], diasNaEtapa:1, descricao:'Primeiro contato, solicitou catálogo de produtos' },
  { id:'neg-06', clienteId:'cli-19', clienteNome:'Renata Almeida', clienteEmpresa:'Almeida & Filhos', valor:45000, stage:'em_atendimento', vendedorId:'usr-02', vendedorNome:'Ana Martins', previsaoFechamento:'30/06/2025', probabilidadeIA:40, canal:'Instagram', tags:['Lead','Construção'], diasNaEtapa:3, descricao:'Lead qualificado via Instagram, interesse em Produto X' },
  { id:'neg-07', clienteId:'cli-20', clienteNome:'Henrique Castro', clienteEmpresa:'Castro Materiais', valor:62000, stage:'novo_lead', vendedorId:'usr-05', vendedorNome:'Carlos Mendes', previsaoFechamento:'05/07/2025', probabilidadeIA:25, canal:'Google', tags:['Lead'], diasNaEtapa:0, descricao:'Solicitou contato pelo site, interesse em produtos de construção' },
  { id:'neg-08', clienteId:'cli-39', clienteNome:'Priscila Mendonça', clienteEmpresa:'Mendonça Varejo', valor:18000, stage:'novo_lead', vendedorId:'usr-02', vendedorNome:'Ana Martins', previsaoFechamento:'10/07/2025', probabilidadeIA:20, canal:'WhatsApp', tags:['Lead','Varejo'], diasNaEtapa:0, descricao:'Contato direto via WhatsApp, pediu tabela de preços' },
  { id:'neg-09', clienteId:'cli-46', clienteNome:'Caio Rodrigues', clienteEmpresa:'Rodrigues & Cia Ltda', valor:39000, stage:'novo_lead', vendedorId:'usr-05', vendedorNome:'Carlos Mendes', previsaoFechamento:'08/07/2025', probabilidadeIA:18, canal:'Indicação', tags:['Lead'], diasNaEtapa:1, descricao:'Indicado pelo cliente Rodrigo Alves, quer visita técnica' },
  { id:'neg-10', clienteId:'cli-03', clienteNome:'João Mendes', clienteEmpresa:'João Mendes ME', valor:34800, stage:'fechado', vendedorId:'usr-02', vendedorNome:'Ana Martins', previsaoFechamento:'25/04/2025', probabilidadeIA:100, canal:'WhatsApp', tags:['Varejo'], diasNaEtapa:0, descricao:'Pedido fechado — Produto Z + Produto W' },
  { id:'neg-11', clienteId:'cli-09', clienteNome:'Beatriz Oliveira', clienteEmpresa:'Atacado Nova Era', valor:92400, stage:'fechado', vendedorId:'usr-05', vendedorNome:'Carlos Mendes', previsaoFechamento:'12/04/2025', probabilidadeIA:100, canal:'Email', tags:['Atacado','VIP'], diasNaEtapa:0, descricao:'Contrato mensal firmado — Produto Alta Margem' },
  { id:'neg-12', clienteId:'cli-16', clienteNome:'Felipe Gonçalves', clienteEmpresa:'Gonçalves & Cia', valor:68000, stage:'fechado', vendedorId:'usr-02', vendedorNome:'Ana Martins', previsaoFechamento:'22/04/2025', probabilidadeIA:100, canal:'WhatsApp', tags:['Indústria'], diasNaEtapa:0, descricao:'Fechado com desconto de 8% para pagamento à vista' },
  { id:'neg-13', clienteId:'cli-23', clienteNome:'Natalia Freitas', clienteEmpresa:'Freitas & Associados', valor:12000, stage:'perdido', vendedorId:'usr-05', vendedorNome:'Carlos Mendes', previsaoFechamento:'15/04/2025', probabilidadeIA:0, canal:'Phone', tags:['Serviços'], diasNaEtapa:0, descricao:'Perdido para concorrente — preço 15% inferior' },
  { id:'neg-14', clienteId:'cli-35', clienteNome:'Leticia Melo', clienteEmpresa:'Melo & Companhia', valor:8400, stage:'perdido', vendedorId:'usr-02', vendedorNome:'Ana Martins', previsaoFechamento:'10/04/2025', probabilidadeIA:0, canal:'WhatsApp', tags:['Serviços'], diasNaEtapa:0, descricao:'Cliente não retornou após orçamento enviado' },
  { id:'neg-15', clienteId:'cli-28', clienteNome:'Danilo Medeiros', clienteEmpresa:'Medeiros Comércio', valor:47200, stage:'em_atendimento', vendedorId:'usr-05', vendedorNome:'Carlos Mendes', previsaoFechamento:'18/06/2025', probabilidadeIA:52, canal:'Instagram', tags:['Varejo'], diasNaEtapa:4, descricao:'Interesse em Produto X — aguardando aprovação financeira' },
]

// ── TAREFAS ──────────────────────────────────────────────────

export const TAREFAS: Tarefa[] = [
  { id:'task-01', titulo:'Reativar 32 clientes inativos', descricao:'Executar campanha de reativação via WhatsApp com oferta especial do Produto X', prioridade:'alta', status:'a_fazer', responsavelId:'usr-02', responsavelNome:'Ana Martins', prazo:'Hoje', origem:'ia', clienteId:'cli-11', clienteNome:'Patricia Moreira' },
  { id:'task-02', titulo:'Reforçar oferta do Produto X', descricao:'Criar campanha de promoção e enviar para lista de clientes B2B com interesse histórico', prioridade:'alta', status:'a_fazer', responsavelId:'usr-02', responsavelNome:'Ana Martins', prazo:'Hoje', origem:'ia' },
  { id:'task-03', titulo:'Repor 4 itens com alta saída', descricao:'Produto Z, Item Giro Alto, Item Estoque Crítico e Produto Reposição Rápida estão com ruptura', prioridade:'media', status:'a_fazer', responsavelId:'usr-03', responsavelNome:'Lucas Pereira', prazo:'Amanhã', origem:'ia' },
  { id:'task-04', titulo:'Follow-up Prime Engenharia', descricao:'Negociação aberta há 7 dias — retomar contato e verificar objeções', prioridade:'alta', status:'em_andamento', responsavelId:'usr-02', responsavelNome:'Ana Martins', prazo:'Hoje', origem:'manual', clienteId:'cli-04', clienteNome:'Prime Engenharia' },
  { id:'task-05', titulo:'Enviar proposta Distribuidora Horizonte', descricao:'Preparar proposta personalizada com condição especial para Kit Comercial B2B', prioridade:'alta', status:'em_andamento', responsavelId:'usr-05', responsavelNome:'Carlos Mendes', prazo:'Hoje', origem:'manual', clienteId:'cli-08' },
  { id:'task-06', titulo:'Ligar para Grupo Varejo Sul', descricao:'Cliente com ticket médio de R$12.400 sem compra há 23 dias — oportunidade de recompra', prioridade:'media', status:'a_fazer', responsavelId:'usr-05', responsavelNome:'Carlos Mendes', prazo:'Hoje', origem:'ia', clienteId:'cli-10', clienteNome:'Grupo Varejo Sul' },
  { id:'task-07', titulo:'Auditar estoque de EPI', descricao:'Verificar validade e condição dos equipamentos de segurança no depósito B', prioridade:'baixa', status:'a_fazer', responsavelId:'usr-03', responsavelNome:'Lucas Pereira', prazo:'Esta semana', origem:'manual' },
  { id:'task-08', titulo:'Fechar contrato Pires Atacadista', descricao:'Proposta enviada — aguardar retorno do financeiro para assinatura', prioridade:'alta', status:'aguardando', responsavelId:'usr-02', responsavelNome:'Ana Martins', prazo:'Amanhã', origem:'manual', clienteId:'cli-18' },
  { id:'task-09', titulo:'Lançar recebimentos de abril', descricao:'Registrar no sistema os recebimentos pendentes de abril: R$184.200', prioridade:'alta', status:'aguardando', responsavelId:'usr-04', responsavelNome:'Mariana Souza', prazo:'Hoje', origem:'manual' },
  { id:'task-10', titulo:'Criar relatório mensal de vendas', descricao:'Compilar dados de maio para apresentação à diretoria na sexta-feira', prioridade:'media', status:'em_andamento', responsavelId:'usr-01', responsavelNome:'Rafael Oliveira', prazo:'Sexta-feira', origem:'manual' },
  { id:'task-11', titulo:'Campanha de reativação enviada', descricao:'Campanha WhatsApp para clientes inativos de Q1/2025 — 28 respostas positivas', prioridade:'alta', status:'concluido', responsavelId:'usr-02', responsavelNome:'Ana Martins', prazo:'02/05/2025', origem:'ia' },
  { id:'task-12', titulo:'Reposição Produto Alta Margem', descricao:'Pedido de compra emitido ao fornecedor — prazo de entrega 5 dias', prioridade:'media', status:'concluido', responsavelId:'usr-03', responsavelNome:'Lucas Pereira', prazo:'28/04/2025', origem:'ia' },
  { id:'task-13', titulo:'Negociação Construtora Alves', descricao:'Acordo fechado com R$84.500 em fornecimento — contrato assinado', prioridade:'alta', status:'concluido', responsavelId:'usr-05', responsavelNome:'Carlos Mendes', prazo:'28/04/2025', origem:'manual', clienteId:'cli-01' },
  { id:'task-14', titulo:'Atualizar ficha de produto Parado C', descricao:'Verificar se produto pode ser vendido com desconto ou descontinuado', prioridade:'baixa', status:'a_fazer', responsavelId:'usr-03', responsavelNome:'Lucas Pereira', prazo:'Esta semana', origem:'ia' },
  { id:'task-15', titulo:'Ligar para Atacado Nova Era', descricao:'Renovar contrato mensal vencendo em 10 dias', prioridade:'media', status:'a_fazer', responsavelId:'usr-05', responsavelNome:'Carlos Mendes', prazo:'Amanhã', origem:'ia', clienteId:'cli-09' },
]

// ── CAMPANHAS ────────────────────────────────────────────────

export const CAMPANHAS: Campanha[] = [
  { id:'camp-01', nome:'Reativação Produto X — Clientes Inativos', publico:'Clientes inativos com histórico de compra em produtos similares (>60 dias sem comprar)', totalContatos:32, mensagem:'Olá, {nome}! Tudo bem? Percebemos que faz um tempo desde sua última compra e separamos uma condição especial para o Produto X. Posso te enviar as opções disponíveis?', canal:'WhatsApp', status:'pronta', responsavelId:'usr-02', responsavelNome:'Ana Martins', metaEstimada:86000, criadaPorIA:true, createdAt:'03/06/2025' },
  { id:'camp-02', nome:'Ruptura de Estoque — Produto Z', publico:'Clientes que compraram Produto Z nos últimos 6 meses (estoque crítico)', totalContatos:18, mensagem:'Olá, {nome}! 👋 Temos condições especiais para você hoje no Produto X, um dos mais vendidos por aqui. Aproveite e garanta já o seu! 🚀', canal:'WhatsApp', status:'pronta', responsavelId:'usr-05', responsavelNome:'Carlos Mendes', metaEstimada:48000, criadaPorIA:true, createdAt:'03/06/2025' },
  { id:'camp-03', nome:'Produto Alta Margem — Foco Junho', publico:'Clientes de construção e indústria com ticket médio acima de R$5.000', totalContatos:24, mensagem:'Olá, {nome}! Junho chegou com oportunidade especial no Produto Alta Margem. Qualidade superior com condição exclusiva para clientes como você. Posso enviar detalhes?', canal:'WhatsApp', status:'rascunho', responsavelId:'usr-02', responsavelNome:'Ana Martins', metaEstimada:124000, criadaPorIA:true, createdAt:'02/06/2025' },
  { id:'camp-04', nome:'Promoção Kit Comercial B2B', publico:'Distribuidoras e atacadistas com pedidos acima de R$50.000/mês', totalContatos:12, mensagem:'Olá, {nome}! Preparamos uma condição especial no Kit Comercial B2B para você. Margem exclusiva para revendedores selecionados. Vamos conversar?', canal:'WhatsApp', status:'enviada', responsavelId:'usr-05', responsavelNome:'Carlos Mendes', metaEstimada:210000, criadaPorIA:false, envios:12, respostas:8, resultado:148000, createdAt:'28/05/2025' },
  { id:'camp-05', nome:'Aniversário de Clientes VIP', publico:'Clientes com total comprado acima de R$200.000 — aniversário no mês', totalContatos:6, mensagem:'Olá, {nome}! 🎉 Hoje é um dia especial e queremos comemorar com você! Preparamos uma surpresa exclusiva. Pode entrar em contato?', canal:'WhatsApp', status:'concluida', responsavelId:'usr-01', responsavelNome:'Rafael Oliveira', metaEstimada:80000, criadaPorIA:false, envios:6, respostas:6, resultado:96000, createdAt:'15/05/2025' },
  { id:'camp-06', nome:'Liquidação Produtos Parados', publico:'Clientes que demonstraram interesse em categorias com produtos parados', totalContatos:45, mensagem:'Olá, {nome}! Temos uma liquidação especial com produtos selecionados com até 40% de desconto! Ofertas por tempo limitado. Quer ver as opções?', canal:'WhatsApp', status:'rascunho', responsavelId:'usr-02', responsavelNome:'Ana Martins', metaEstimada:65000, criadaPorIA:true, createdAt:'03/06/2025' },
]

// ── FINANCEIRO ───────────────────────────────────────────────

export const FINANCEIRO_MENSAL: FinanceiroMensal[] = [
  { mes:'Jun/24', receita:820000, despesa:328000, resultado:492000 },
  { mes:'Jul/24', receita:780000, despesa:312000, resultado:468000 },
  { mes:'Ago/24', receita:920000, despesa:368000, resultado:552000 },
  { mes:'Set/24', receita:1040000, despesa:416000, resultado:624000 },
  { mes:'Out/24', receita:1180000, despesa:472000, resultado:708000 },
  { mes:'Nov/24', receita:1420000, despesa:568000, resultado:852000 },
  { mes:'Dez/24', receita:1680000, despesa:672000, resultado:1008000 },
  { mes:'Jan/25', receita:980000, despesa:392000, resultado:588000 },
  { mes:'Fev/25', receita:1020000, despesa:408000, resultado:612000 },
  { mes:'Mar/25', receita:1140000, despesa:456000, resultado:684000 },
  { mes:'Abr/25', receita:1210000, despesa:484000, resultado:726000 },
  { mes:'Mai/25', receita:1287450, despesa:412120, resultado:690180 },
]

export const LANCAMENTOS: LancamentoFinanceiro[] = [
  { id:'lan-01', descricao:'Pagamento Construtora Alves', tipo:'receita', valor:84500, vencimento:'28/05/2025', status:'pago', categoria:'Venda' },
  { id:'lan-02', descricao:'Pagamento Atacado Nova Era', tipo:'receita', valor:92400, vencimento:'30/05/2025', status:'pago', categoria:'Venda' },
  { id:'lan-03', descricao:'Pagamento Prime Engenharia', tipo:'receita', valor:128000, vencimento:'15/06/2025', status:'pendente', categoria:'Venda' },
  { id:'lan-04', descricao:'Pagamento Pires Atacadista', tipo:'receita', valor:210000, vencimento:'20/06/2025', status:'pendente', categoria:'Venda' },
  { id:'lan-05', descricao:'NF Fornecedor Principal', tipo:'despesa', valor:186000, vencimento:'10/06/2025', status:'pendente', categoria:'Estoque' },
  { id:'lan-06', descricao:'Folha de Pagamento', tipo:'despesa', valor:68400, vencimento:'05/06/2025', status:'pago', categoria:'RH' },
  { id:'lan-07', descricao:'Aluguel Depósito', tipo:'despesa', valor:12800, vencimento:'05/06/2025', status:'pago', categoria:'Aluguel' },
  { id:'lan-08', descricao:'Conta de Energia', tipo:'despesa', valor:4200, vencimento:'15/06/2025', status:'pendente', categoria:'Utilidades' },
  { id:'lan-09', descricao:'Distribuidora Horizonte', tipo:'receita', valor:56200, vencimento:'28/06/2025', status:'pendente', categoria:'Venda' },
  { id:'lan-10', descricao:'Software ERP e Sistemas', tipo:'despesa', valor:2400, vencimento:'01/06/2025', status:'pago', categoria:'TI' },
  { id:'lan-11', descricao:'Comissão Vendedores', tipo:'despesa', valor:38600, vencimento:'10/06/2025', status:'pendente', categoria:'Comercial' },
  { id:'lan-12', descricao:'Frete e Logística', tipo:'despesa', valor:14800, vencimento:'30/05/2025', status:'pago', categoria:'Logística' },
]

// ── WHATSAPP CONVERSAS ───────────────────────────────────────

export const CONVERSAS: Conversa[] = [
  {
    id:'conv-01', contatoNome:'João Mendes', contatoEmpresa:'João Mendes ME', contatoTelefone:'(51) 99100-0003',
    ultimaMensagem:'Preciso de um orçamento para o Produto X, vocês têm disponível?',
    timestamp:'Agora há 3 min', status:'novo', tags:['Vendas','B2B'], tempoEspera:'3 min',
    clienteId:'cli-03', scoreCliente:87, canal:'whatsapp',
    mensagens:[
      { id:'m1', conteudo:'Oi! Preciso de um orçamento para o Produto X, vocês têm disponível?', tipo:'entrada', timestamp:'14:22' },
    ]
  },
  {
    id:'conv-02', contatoNome:'Construtora Alves', contatoEmpresa:'Construtora Alves Ltda', contatoTelefone:'(51) 99100-0001',
    ultimaMensagem:'Quando chega o próximo lote da Linha Premium A?',
    timestamp:'Há 15 min', status:'em_atendimento', agenteId:'usr-02', agenteNome:'Ana Martins', tags:['Reposição','VIP'], tempoEspera:'15 min',
    clienteId:'cli-01', scoreCliente:92, canal:'whatsapp',
    mensagens:[
      { id:'m1', conteudo:'Bom dia! Quando chega o próximo lote da Linha Premium A?', tipo:'entrada', timestamp:'14:10' },
      { id:'m2', conteudo:'Bom dia, Rodrigo! Estamos aguardando a entrega do fornecedor para sexta-feira. Posso já separar uma quantidade para vocês?', tipo:'saida', timestamp:'14:11', agente:'Ana Martins' },
      { id:'m3', conteudo:'Sim, pode separar 20 unidades!', tipo:'entrada', timestamp:'14:12' },
      { id:'m4', conteudo:'Perfeito! Já lancei a reserva. Vou confirmar o pedido assim que o estoque chegar.', tipo:'saida', timestamp:'14:13', agente:'Ana Martins' },
    ]
  },
  {
    id:'conv-03', contatoNome:'Casa & Obra Materiais', contatoEmpresa:'Casa & Obra Materiais', contatoTelefone:'(51) 99100-0002',
    ultimaMensagem:'Ok, obrigado! Aguardo a confirmação.',
    timestamp:'Há 1h', status:'aguardando', agenteId:'usr-05', agenteNome:'Carlos Mendes', tags:['Aguardando','Orçamento'], tempoEspera:'1h',
    clienteId:'cli-02', scoreCliente:89, canal:'whatsapp',
    mensagens:[
      { id:'m1', conteudo:'Boa tarde! Preciso de um orçamento para 50 unidades do Kit Comercial B2B.', tipo:'entrada', timestamp:'13:00' },
      { id:'m2', conteudo:'Boa tarde, Fernanda! Vou preparar o orçamento e te envio ainda hoje.', tipo:'saida', timestamp:'13:05', agente:'Carlos Mendes' },
      { id:'m3', conteudo:'Ok, obrigado! Aguardo a confirmação.', tipo:'entrada', timestamp:'13:06' },
    ]
  },
  {
    id:'conv-04', contatoNome:'Prime Engenharia', contatoEmpresa:'Prime Engenharia', contatoTelefone:'(51) 99100-0004',
    ultimaMensagem:'Pode me mandar a tabela de preços atualizada?',
    timestamp:'Há 2h', status:'novo', tags:['Vendas','Construção'], tempoEspera:'2h',
    clienteId:'cli-04', scoreCliente:85, canal:'whatsapp',
    mensagens:[
      { id:'m1', conteudo:'Oi! Pode me mandar a tabela de preços atualizada? Preciso para fazer um pedido grande', tipo:'entrada', timestamp:'12:00' },
    ]
  },
  {
    id:'conv-05', contatoNome:'Depósito São Miguel', contatoEmpresa:'Depósito São Miguel', contatoTelefone:'(51) 99100-0005',
    ultimaMensagem:'Problema resolvido! Valeu pela atenção.',
    timestamp:'Há 3h', status:'resolvido', agenteId:'usr-02', agenteNome:'Ana Martins', tags:['Resolvido','Suporte'], tempoEspera:'0',
    clienteId:'cli-05', scoreCliente:83, canal:'whatsapp',
    mensagens:[
      { id:'m1', conteudo:'Meu pedido chegou incompleto, faltaram 5 unidades.', tipo:'entrada', timestamp:'10:00' },
      { id:'m2', conteudo:'Carla, me desculpe pelo transtorno! Já estou verificando o seu pedido.', tipo:'saida', timestamp:'10:05', agente:'Ana Martins' },
      { id:'m3', conteudo:'Confirmamos a pendência. Vou enviar as 5 unidades por motoboy ainda hoje.', tipo:'saida', timestamp:'10:20', agente:'Ana Martins' },
      { id:'m4', conteudo:'Problema resolvido! Valeu pela atenção.', tipo:'entrada', timestamp:'11:00' },
    ]
  },
  {
    id:'conv-06', contatoNome:'Distribuidora Horizonte', contatoEmpresa:'Distribuidora Horizonte', contatoTelefone:'(51) 99100-0008',
    ultimaMensagem:'Vou verificar o estoque aqui e já te retorno.',
    timestamp:'Há 30 min', status:'em_atendimento', agenteId:'usr-05', agenteNome:'Carlos Mendes', tags:['Atacado','Negociação'], tempoEspera:'30 min',
    clienteId:'cli-08', scoreCliente:72, canal:'whatsapp',
    mensagens:[
      { id:'m1', conteudo:'Roberto, tudo bem? Sobre o pedido de março, quando vocês fecham o pedido deste mês?', tipo:'saida', timestamp:'13:45', agente:'Carlos Mendes' },
      { id:'m2', conteudo:'Oi Carlos! Tô verificando aqui. Pode me mandar a proposta de novo?', tipo:'entrada', timestamp:'13:50' },
      { id:'m3', conteudo:'Claro, te mando agora!', tipo:'saida', timestamp:'13:51', agente:'Carlos Mendes' },
      { id:'m4', conteudo:'Vou verificar o estoque aqui e já te retorno.', tipo:'entrada', timestamp:'13:52' },
    ]
  },
]

// ── FLUXOS DE IA ─────────────────────────────────────────────

export const FLUXOS_IA: FluxoIA[] = [
  {
    id:'fluxo-01', nome:'Boas-vindas Automático', descricao:'Responde automaticamente ao primeiro contato e direciona para o atendente correto', ativo:true, disparos:284, resolucoes:198, createdAt:'15/05/2025',
    nos:[
      { id:'n1', tipo:'gatilho', titulo:'Primeira Mensagem', descricao:'Quando cliente envia primeira mensagem', proximoId:'n2' },
      { id:'n2', tipo:'condicao', titulo:'Horário Comercial?', descricao:'Entre 8h e 18h, seg–sex', proximoId:'n3', alternativaId:'n4' },
      { id:'n3', tipo:'acao', titulo:'Transferir p/ Atendente', descricao:'Direciona para a fila de atendimento humano' },
      { id:'n4', tipo:'acao', titulo:'Resposta Automática', descricao:'Informa horário de atendimento e registra contato' },
    ]
  },
  {
    id:'fluxo-02', nome:'Qualificação de Lead', descricao:'Coleta informações básicas do lead antes de transferir para o vendedor', ativo:true, disparos:142, resolucoes:118, createdAt:'20/05/2025',
    nos:[
      { id:'n1', tipo:'gatilho', titulo:'Palavra: "orçamento"', descricao:'Quando cliente mencionar orçamento, preço ou valor', proximoId:'n2' },
      { id:'n2', tipo:'acao', titulo:'Perguntar Empresa', descricao:'Mensagem: Qual o nome da sua empresa?' },
      { id:'n3', tipo:'acao', titulo:'Criar Lead', descricao:'Cadastrar no CRM e notificar vendedor' },
    ]
  },
  {
    id:'fluxo-03', nome:'Reativação Inativa', descricao:'IA entra em contato com clientes inativos com oferta personalizada', ativo:false, disparos:48, resolucoes:32, createdAt:'01/06/2025',
    nos:[
      { id:'n1', tipo:'gatilho', titulo:'Sem compra há 60 dias', descricao:'Score de inatividade ativado pelo sistema', proximoId:'n2' },
      { id:'n2', tipo:'acao', titulo:'Enviar Oferta Personalizada', descricao:'Mensagem com base no histórico de compras do cliente' },
    ]
  },
]

// ── KPI E DASHBOARD ──────────────────────────────────────────

export const KPI_DATA = {
  vendasDoMes: 1287450.00,
  vendasTendencia: 18.6,
  leadsQuentes: 127,
  leadsTendencia: 12.4,
  estoqueAtencao: 23,
  estoqueTendencia: 9.1,
  clientesInativos: 542,
  clientesTendencia: 8.3,
  percentualMeta: 72,
  metaMensal: 1850000.00,
}

export const FINANCEIRO = {
  faturamento: 1287450.00,
  recebimentos: 1102300.00,
  despesas: 412120.00,
  resultado: 690180.00,
}

export const CLIENTES_DESTAQUE = CLIENTES.filter(c => c.status === 'ativo').sort((a,b) => b.scoreRecompra - a.scoreRecompra).slice(0,5).map(c => ({ id:c.id, nome:c.empresa, score:c.scoreRecompra, ultimaCompra:c.ultimaCompra }))

export const PRODUTOS_DESTAQUE = PRODUTOS.filter(p => p.status === 'ativo').sort((a,b) => b.scorePotencial - a.scorePotencial).slice(0,5).map(p => ({ id:p.id, nome:p.nome, potencial:p.scorePotencial, estoque:p.estoqueAtual }))

export const PREVISAO_VENDAS_CHART = [
  { data:'01/05', realizado:200000, previsao:210000 },
  { data:'08/05', realizado:450000, previsao:480000 },
  { data:'15/05', realizado:800000, previsao:850000 },
  { data:'22/05', realizado:1287450, previsao:1350000 },
  { data:'31/05', realizado:null, previsao:1920000 },
]

// ── HELPERS ──────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(value)
}

export function formatCurrencyShort(value: number): string {
  if (value >= 1000000) return `R$ ${(value/1000000).toFixed(1)}M`
  if (value >= 1000) return `R$ ${(value/1000).toFixed(0)}k`
  return formatCurrency(value)
}

export const CLIENTES_INATIVOS = CLIENTES.filter(c => c.status === 'inativo')
export const PRODUTOS_EM_RUPTURA = PRODUTOS.filter(p => p.risco === 'ruptura')
export const PRODUTOS_PARADOS = PRODUTOS.filter(p => p.status === 'parado')

export const AGENDA: EventoAgenda[] = [
  {
    id: 'evt-01',
    titulo: 'Reuni�o de Fechamento (Cliente XYZ)',
    tipo: 'reuniao',
    data: 'Hoje',
    hora: '14:00 - 15:00',
    participantes: ['Jo�o', 'Maria (Cliente)'],
    local: 'Google Meet',
    status: 'confirmado',
    ia: true,
    tarefaId: 'tar-02',
    clienteId: 'cli-01'
  },
  {
    id: 'evt-02',
    titulo: 'Follow-up Oportunidade #492',
    tipo: 'followup',
    data: 'Hoje',
    hora: '16:30 - 17:00',
    participantes: ['Ana'],
    local: 'Telefone',
    status: 'pendente',
    ia: true,
    tarefaId: 'tar-03'
  },
  {
    id: 'evt-03',
    titulo: 'Apresenta��o de Proposta',
    tipo: 'apresentacao',
    data: 'Amanh�',
    hora: '10:00 - 11:30',
    participantes: ['Carlos', 'Equipe Cliente'],
    local: 'Zoom',
    status: 'confirmado',
    ia: false,
    clienteId: 'cli-03'
  }
]
