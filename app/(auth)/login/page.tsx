"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import LoginCard from "@/components/LoginCard"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white w-full overflow-hidden font-sans">
      
      {/* Left Column - Image */}
      {/* Mobile: hidden (w-0), Tablet: w-[40%], Desktop: w-[48%] */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hidden md:block md:w-[40%] lg:w-[48%] relative h-screen bg-slate-900 shrink-0"
      >
        <Image
          src="https://i.imgur.com/O60Zzzk.png"
          alt="Magister Tech & Jamper Login"
          fill
          priority
          className="object-cover"
          unoptimized
        />
      </motion.div>

      {/* Right Column - Content */}
      {/* Mobile: w-full, Tablet: w-[60%], Desktop: w-[52%] */}
      <div className="w-full md:w-[60%] lg:w-[52%] h-screen flex flex-col relative bg-white">
        
        {/* Header - Language Switcher */}
        <div className="absolute top-6 right-6 z-10 md:top-8 md:right-8">
          <LanguageSwitcher />
        </div>

        {/* Center - Login Card */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 w-full h-full overflow-y-auto custom-scrollbar">
          <div className="w-full flex justify-center items-center py-12 md:py-0">
            <LoginCard />
          </div>
        </div>

      </div>
    </div>
  )
}
