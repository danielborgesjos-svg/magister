"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, ArrowRight, Loader2 } from "lucide-react"
import { PasswordInput } from "./PasswordInput"
import GoogleButton from "./GoogleButton"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  remember: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log("Login data:", data)
    setIsLoading(false)
    router.push("/os")
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                {...register("email")}
                type="email"
                placeholder="exemplo@email.com"
                className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-all outline-none 
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400
                  ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm ml-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <PasswordInput
              {...register("password")}
              placeholder="Sua senha"
              error={errors.password?.message}
            />
            {errors.password && (
              <p className="text-red-500 text-sm ml-1">{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                {...register("remember")}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
              <svg
                className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
              Lembrar-me
            </span>
          </label>

          <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
            Esqueci minha senha
          </a>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={isLoading}
          type="submit"
          className="w-full h-14 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1e40af] text-white rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-6 mb-6 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative bg-white px-4 text-sm text-slate-400 font-medium">
          ou continue com
        </div>
      </div>

      <GoogleButton />
    </div>
  )
}
