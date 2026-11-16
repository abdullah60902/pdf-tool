"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tool {
  name: string
  description: string
  icon: LucideIcon
  href: string
  color: string
}

const ToolCard = ({ tool, index }: { tool: Tool, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={tool.href}
        className="group block relative glass p-6 rounded-2xl glass-hover overflow-hidden"
      >
        <div className={cn(
          "absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br opacity-5 blur-2xl transition-all duration-500 group-hover:opacity-20",
          tool.color
        )} />

        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
            tool.color
          )}>
            <tool.icon size={26} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-100 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-400 transition-colors tracking-widest uppercase">
            Start Processing
          </span>
          <div className="p-2 rounded-lg bg-gray-800/50 text-gray-500 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
            <ArrowRight size={18} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default ToolCard
