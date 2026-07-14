"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, CheckCircle2, Camera, MapPin, PenTool } from "lucide-react"
import Link from "next/link"
import { iniciarAtendimento, finalizarAtendimento } from "@/app/actions/os"
import { toast } from "sonner"

export default function OsExecutionClient({ os }: { os: any }) {
  const router = useRouter()
  const [status, setStatus] = useState(os.status)
  const [loading, setLoading] = useState(false)

  const [obs, setObs] = useState("")
  const [checklist, setChecklist] = useState([
    { task: "Inspeção visual do equipamento", done: false },
    { task: "Limpeza de filtros/peças", done: false },
    { task: "Teste de funcionamento", done: false }
  ])
  const [fotos, setFotos] = useState<string[]>([])
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Canvas Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'
  }, [status])

  const startDrawing = (e: any) => {
    setIsDrawing(true)
    draw(e)
  }
  const stopDrawing = () => {
    setIsDrawing(false)
    setHasSignature(true)
  }
  const draw = (e: any) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }
  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      setHasSignature(false)
    }
  }

  const handleStart = async () => {
    if (!confirm("Confirmar início do atendimento? O tempo começará a contar.")) return
    setLoading(true)
    const res = await iniciarAtendimento(os.id)
    if (res.success) {
      setStatus("em_andamento")
      toast.success("Atendimento iniciado!")
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  const handleFinish = async () => {
    if (!hasSignature) {
      toast.error("A assinatura do cliente é obrigatória!")
      return
    }
    if (checklist.some(c => !c.done)) {
      if (!confirm("Existem itens pendentes no checklist. Deseja finalizar mesmo assim?")) return
    }
    
    setLoading(true)
    const assinaturaBase64 = canvasRef.current?.toDataURL() || ""
    
    const payload = {
      checklistJson: JSON.stringify(checklist),
      observacoesTecnicas: obs,
      materiaisJson: "[]",
      fotosJson: JSON.stringify(fotos),
      assinaturaBase64
    }

    const res = await finalizarAtendimento(os.id, payload)
    if (res.success) {
      setStatus("concluida")
      toast.success("OS Finalizada com sucesso!")
      router.push("/app-tecnico")
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  // Mock photo capture
  const addPhoto = () => {
    setFotos([...fotos, "https://via.placeholder.com/150"])
    toast.success("Foto anexada!")
  }

  return (
    <>
      <div className="bg-white border-b flex items-center p-4 sticky top-0 z-10 shadow-sm shrink-0">
        <Link href="/app-tecnico" className="p-2 -ml-2 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1 text-center font-bold text-slate-800">
          OS #{os.numeroOS}
        </div>
        <div className="w-9" /> {/* spacer */}
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* INFO */}
        <div className="bg-white p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {os.cliente?.razaoSocial || os.cliente?.nome}
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">{os.titulo}</p>
          
          <div className="flex items-start gap-3 mt-4 p-3 bg-slate-50 rounded-xl">
            <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">
              {os.endereco?.logradouro}, {os.endereco?.numero}<br/>
              {os.endereco?.bairro} - {os.endereco?.cidade}
            </span>
          </div>
        </div>

        {status === "agendada" && (
          <div className="p-5 flex flex-col items-center justify-center mt-10">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Play className="w-10 h-10 text-blue-600 ml-1" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Pronto para começar?</h3>
            <p className="text-center text-slate-500 text-sm mb-8">
              Ao iniciar o atendimento, o status da OS será alterado e o tempo de execução começará a ser contabilizado.
            </p>
            <button 
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Iniciando..." : "Iniciar Atendimento"}
            </button>
          </div>
        )}

        {status === "em_andamento" && (
          <div className="p-5 space-y-6">
            
            {/* Checklist */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm uppercase">Checklist de Execução</h3>
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                {checklist.map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-4 border-b last:border-0 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={item.done}
                      onChange={e => {
                        const newC = [...checklist]
                        newC[idx].done = e.target.checked
                        setChecklist(newC)
                      }}
                    />
                    <span className={`text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                      {item.task}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm uppercase">Observações Técnicas</h3>
              <textarea 
                value={obs}
                onChange={e => setObs(e.target.value)}
                placeholder="Detalhes sobre o serviço realizado..."
                className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              />
            </div>

            {/* Fotos */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm uppercase">Evidências (Fotos)</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {fotos.map((f, i) => (
                  <img key={i} src={f} className="w-20 h-20 rounded-xl object-cover shrink-0 border" alt="Evidência" />
                ))}
                <button 
                  onClick={addPhoto}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 shrink-0"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">FOTO</span>
                </button>
              </div>
            </div>

            {/* Assinatura */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-500"/>
                Assinatura do Cliente
              </h3>
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full h-[150px] touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onMouseMove={draw}
                  onTouchStart={startDrawing}
                  onTouchEnd={stopDrawing}
                  onTouchMove={draw}
                />
                {hasSignature && (
                  <button onClick={clearSignature} className="absolute top-2 right-2 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold">
                    Limpar
                  </button>
                )}
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <p className="font-bold text-slate-500 text-sm">Assine aqui</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button 
              onClick={handleFinish}
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-8"
            >
              <CheckCircle2 className="w-5 h-5" />
              {loading ? "Finalizando..." : "Finalizar OS"}
            </button>
            <div className="h-10" />

          </div>
        )}
      </div>
    </>
  )
}
