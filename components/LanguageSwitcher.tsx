"use client"

import { useState } from "react"
import { Globe, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
      >
        <Globe className="w-4 h-4" />
        Português
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50"
          >
            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium bg-slate-50">
              Português
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              English
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Español
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
