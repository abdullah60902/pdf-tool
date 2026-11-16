"use client"

import React from 'react'
import { motion } from 'framer-motion'
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
  Search,
  ArrowRight,
  Edit3,
  ImageIcon,
  Eraser,
  LucideIcon
} from 'lucide-react'
import ToolCard from '@/components/ToolCard'

interface ToolItem {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

const tools: ToolItem[] = [
  { name: 'PDF Editor', description: 'Full professional editor. Add text, images & drawings.', icon: Edit3, href: '/edit', color: 'from-pink-500 to-rose-500' },
  { name: 'Merge PDF', description: 'Combine multiple PDFs into one document', icon: Combine, href: '/merge', color: 'from-blue-500 to-cyan-500' },
  { name: 'Split PDF', description: 'Extract pages or split into multiple files', icon: Scissors, href: '/split', color: 'from-purple-500 to-pink-500' },
  { name: 'Compress PDF', description: 'Reduce file size while keeping quality', icon: Zap, href: '/compress', color: 'from-amber-500 to-orange-500' },
  { name: 'Rotate PDF', description: 'Turn your PDF pages exactly how you need', icon: RotateCw, href: '/rotate', color: 'from-emerald-500 to-teal-500' },
  { name: 'Delete Pages', description: 'Remove unwanted pages from your PDF', icon: Trash2, href: '/delete', color: 'from-red-500 to-rose-500' },
  { name: 'PDF to Word', description: 'Convert PDF to editable DOCX documents', icon: FileText, href: '/pdf-to-word', color: 'from-blue-600 to-indigo-600' },
  { name: 'Word to PDF', description: 'Create PDF files from Word documents', icon: FileDigit, href: '/word-to-pdf', color: 'from-indigo-500 to-purple-600' },
  { name: 'PDF Watermark', description: 'Add image or text overlay to your PDF', icon: Stamp, href: '/watermark', color: 'from-cyan-500 to-blue-600' },
  { name: 'Image Watermark', description: 'Protect JPG/PNG images with batch watermarking', icon: Stamp, href: '/watermark-image', color: 'from-emerald-500 to-teal-600' },
  { name: 'Signature', description: 'Sign your documents online with ease', icon: PenTool, href: '/signature', color: 'from-violet-500 to-purple-700' },
  { name: 'Image Converter', description: 'Convert images to WebP, PNG, JPG & more.', icon: ImageIcon, href: '/image-converter', color: 'from-cyan-400 to-emerald-500' },
  { name: 'BG Remover', description: 'Remove backgrounds from images with AI instantly.', icon: Eraser, href: '/bg-remover', color: 'from-rose-500 to-orange-500' },
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto py-12">
      <header className="mb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-purple-600 bg-clip-text text-transparent"
        >
          Private PDF Tools
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg mb-8"
        >
          Process your files securely with Cloud Storage. No data is stored permanently.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-2xl mx-auto"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search for a tool..."
            className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
          />
        </motion.div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <ToolCard key={tool.name} tool={tool} index={index} />
        ))}
      </section>

      <footer className="mt-24 pt-12 border-t border-gray-800 text-center text-gray-600 flex justify-between items-center">
        <p>© 2024 PDFToolkit. Built for Security & Privacy.</p>
        <div className="flex gap-6">
          <button className="hover:text-cyan-400 transition-colors">Documentation</button>
          <button className="hover:text-cyan-400 transition-colors">API Keys</button>
          <button className="hover:text-cyan-400 transition-colors">Privacy Policy</button>
        </div>
      </footer>
    </div>
  )
}
