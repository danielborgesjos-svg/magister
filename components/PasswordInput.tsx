"use client"

import { useState, forwardRef } from "react"
import { Lock, Eye, EyeOff } from "lucide-react"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, className = "", ...props }, ref) => {
    const [show, setShow] = useState(false)

    return (
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Lock className="w-5 h-5" />
        </div>
        <input
          {...props}
          ref={ref}
          type={show ? "text" : "password"}
          className={`w-full h-12 pl-12 pr-12 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-all outline-none 
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"}
            ${className}`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"
