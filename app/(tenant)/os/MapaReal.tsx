"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Customizando os ícones para não depender das imagens padrão do Leaflet (que quebram no Next.js)
const createIcon = (color: string) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })
}

const iconLivre = createIcon("#4F46E5") // Indigo
const iconDeslocamento = createIcon("#10B981") // Emerald
const iconAtrasado = createIcon("#EF4444") // Red

// Coordenadas base (Curitiba)
const BASE_LAT = -25.4284
const BASE_LNG = -49.2733

export default function MapaReal({ tecnicos, ordens }: { tecnicos: any[], ordens: any[] }) {
  const [markers, setMarkers] = useState<any[]>([])

  useEffect(() => {
    // Vamos gerar mock de posições baseadas no centro para os técnicos
    const gerados = tecnicos.map((t, idx) => {
      // Espalhar num raio de ~5km
      const latOff = (Math.random() - 0.5) * 0.1
      const lngOff = (Math.random() - 0.5) * 0.1
      
      const osAtribuidas = ordens.filter(o => o.tecnicoId === t.id)
      const osAtrasada = osAtribuidas.find(o => o.prioridade === "critica" || o.status === "atrasada")
      const emDeslocamento = osAtribuidas.find(o => o.status === "em_deslocamento")

      let status = "Livre"
      let cor = iconLivre

      if (osAtrasada) {
        status = "Crítico / Atrasado"
        cor = iconAtrasado
      } else if (emDeslocamento) {
        status = "Em Deslocamento"
        cor = iconDeslocamento
      } else if (osAtribuidas.length > 0) {
        status = "Em Execução"
        cor = iconDeslocamento
      }

      return {
        id: t.id,
        nome: t.nome,
        lat: BASE_LAT + latOff,
        lng: BASE_LNG + lngOff,
        status,
        cor,
        osCount: osAtribuidas.length
      }
    })

    setMarkers(gerados)
  }, [tecnicos, ordens])

  return (
    <div className="w-full h-full z-0 relative rounded-2xl overflow-hidden">
      <MapContainer 
        center={[BASE_LAT, BASE_LNG]} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={m.cor}>
            <Popup>
              <div className="font-sans">
                <strong className="text-[14px] text-slate-800">{m.nome}</strong><br />
                <span className="text-[12px] text-slate-500 font-medium">Status: {m.status}</span><br />
                <span className="text-[12px] text-slate-500 font-medium">OS Atribuídas: {m.osCount}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
