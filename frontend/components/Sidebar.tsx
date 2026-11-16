"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Combine,
  Scissors,
  Zap,
  RotateCw,
  Trash2,
  FileText,
  FileDigit,
  Stamp,
  PenTool,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eraser
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const menuItems = [
  { name: 'Merge PDF', icon: Combine, href: '/merge' },
  { name: 'Split PDF', icon: Scissors, href: '/split' },
  { name: 'Compress PDF', icon: Zap, href: '/compress' },
  { name: 'Rotate PDF', icon: RotateCw, href: '/rotate' },
  { name: 'Delete Pages', icon: Trash2, href: '/delete' },
  { name: 'PDF to Word', icon: FileText, href: '/pdf-to-word' },
  { name: 'Word to PDF', icon: FileDigit, href: '/word-to-pdf' },
  { name: 'Watermark', icon: Stamp, href: '/watermark' },
  { name: 'Signature', icon: PenTool, href: '/signature' },
  { name: 'BG Remover', icon: Eraser, href: '/bg-remover' },
]

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen glass flex flex-col sticky top-0 border-r border-gray-800"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
          >
            <ShieldCheck className="text-cyan-500" />
            <span>PDFToolkit</span>
          </motion.div>
        )}
        {isCollapsed && <ShieldCheck className="text-cyan-500 mx-auto" />}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group",
              pathname === item.href
                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            )}
          >
            <item.icon size={22} className={cn(
              "transition-colors",
              pathname === item.href ? "text-cyan-400" : "group-hover:text-cyan-400"
            )} />
            {!isCollapsed && <span className="font-medium">{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 p-3 w-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-xl transition-all">
          <Settings size={22} />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </button>
      </div>
    </motion.aside>
  )
}

export default Sidebar
