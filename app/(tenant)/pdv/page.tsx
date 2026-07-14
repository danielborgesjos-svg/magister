"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, CreditCard, Banknote, QrCode } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { buscarProdutos, finalizarVenda } from "@/app/actions/pdv"
import { cn } from "@/lib/utils"

type Produto = { id: string, nome: string, preco: number, estoqueAtual: number }
type ItemCarrinho = Produto & { quantidade: number }

export default function PDVPage() {
  const [busca, setBusca] = useState("")
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [metodoPagamento, setMetodoPagamento] = useState<string>("PIX")
  const [isFinalizando, setIsFinalizando] = useState(false)
  const [vendaSucesso, setVendaSucesso] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Buscar produtos do banco
  useEffect(() => {
    async function load() {
      const res = await buscarProdutos(busca)
      setProdutos(res)
    }
    load()
  }, [busca])

  // Focus na busca ao iniciar
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const adicionarProduto = (produto: Produto) => {
    setCarrinho(prev => {
      const existe = prev.find(i => i.id === produto.id)
      if (existe) {
        return prev.map(i => i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i)
      }
      return [...prev, { ...produto, quantidade: 1 }]
    })
    setBusca("")
    searchInputRef.current?.focus()
  }

  const alterarQuantidade = (id: string, delta: number) => {
    setCarrinho(prev => prev.map(i => {
      if (i.id === id) {
        const novaQtd = Math.max(1, i.quantidade + delta)
        return { ...i, quantidade: novaQtd }
      }
      return i
    }))
  }

  const removerItem = (id: string) => {
    setCarrinho(prev => prev.filter(i => i.id !== id))
  }

  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)
  const desconto = 0 // Implementar lógica de desconto futuramente
  const total = subtotal - desconto

  const handleFinalizar = async () => {
    if (carrinho.length === 0) return
    setIsFinalizando(true)
    
    const res = await finalizarVenda(carrinho.map(c => ({ id: c.id, quantidade: c.quantidade, preco: c.preco })), metodoPagamento, total)
    
    setIsFinalizando(false)
    if (res.success) {
      setVendaSucesso(true)
      setTimeout(() => {
        setVendaSucesso(false)
        setCarrinho([])
        searchInputRef.current?.focus()
      }, 3000)
    }
  }

  if (vendaSucesso) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-2xl border border-border">
        <div className="w-24 h-24 bg-green-positive/20 text-green-positive rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Venda Finalizada!</h2>
        <p className="text-muted-foreground mt-2">Estoque e caixa atualizados automaticamente.</p>
        <button 
          onClick={() => { setVendaSucesso(false); setCarrinho([]); searchInputRef.current?.focus() }}
          className="mt-8 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Nova Venda
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Lado Esquerdo: Busca e Carrinho (60%) */}
      <div className="flex-[3] flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar produto por nome ou código..."
            className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-2xl text-lg focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {/* Autocomplete Dropdown */}
          {busca && produtos.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-[300px] overflow-y-auto">
              {produtos.map(p => (
                <button
                  key={p.id}
                  onClick={() => adicionarProduto(p)}
                  className="w-full text-left px-6 py-4 hover:bg-muted/50 border-b border-border/50 flex justify-between items-center transition-colors"
                >
                  <div>
                    <p className="font-bold text-foreground">{p.nome}</p>
                    <p className="text-sm text-muted-foreground">Estoque: {p.estoqueAtual} un</p>
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(p.preco)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Carrinho Atual</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {carrinho.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                <p>Nenhum produto adicionado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {carrinho.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex-1">
                      <p className="font-bold text-foreground line-clamp-1">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.preco)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1">
                        <button onClick={() => alterarQuantidade(item.id, -1)} className="p-1 hover:bg-muted rounded-md"><Minus className="w-4 h-4" /></button>
                        <span className="w-8 text-center font-bold">{item.quantidade}</span>
                        <button onClick={() => alterarQuantidade(item.id, 1)} className="p-1 hover:bg-muted rounded-md"><Plus className="w-4 h-4" /></button>
                      </div>
                      <p className="font-bold w-24 text-right text-foreground">{formatCurrency(item.preco * item.quantidade)}</p>
                      <button onClick={() => removerItem(item.id)} className="p-2 text-red-alert/70 hover:bg-red-alert/10 hover:text-red-alert rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lado Direito: Resumo e Pagamento (40%) */}
      <div className="flex-[2] bg-card border border-border rounded-2xl p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Resumo da Venda</h2>
        
        <div className="space-y-4 mb-8 text-lg">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Desconto</span>
            <span className="text-green-positive">{formatCurrency(desconto)}</span>
          </div>
          <div className="flex justify-between font-black text-3xl text-foreground pt-4 border-t border-border">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        <h3 className="font-bold text-muted-foreground mb-3 uppercase text-xs tracking-wider">Método de Pagamento</h3>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { id: "PIX", icon: QrCode, label: "PIX" },
            { id: "CREDITO", icon: CreditCard, label: "Crédito" },
            { id: "DEBITO", icon: CreditCard, label: "Débito" },
            { id: "DINHEIRO", icon: Banknote, label: "Dinheiro" },
          ].map(metodo => (
            <button
              key={metodo.id}
              onClick={() => setMetodoPagamento(metodo.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-bold",
                metodoPagamento === metodo.id 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              )}
            >
              <metodo.icon className="w-6 h-6" />
              {metodo.label}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={handleFinalizar}
            disabled={carrinho.length === 0 || isFinalizando}
            className="w-full py-5 bg-green-positive hover:bg-green-positive/90 disabled:opacity-50 disabled:hover:bg-green-positive text-white rounded-xl font-black text-xl shadow-xl shadow-green-positive/20 flex items-center justify-center gap-3 transition-all"
          >
            {isFinalizando ? "Processando..." : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                FINALIZAR VENDA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
