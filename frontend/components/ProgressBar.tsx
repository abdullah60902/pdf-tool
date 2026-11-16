"use client"

import React from 'react'
import { motion } from 'framer-motion'

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400 font-medium tracking-wide">PROCESSING QUALITY</span>
        <span className="text-cyan-400 font-bold">{progress}%</span>
      </div>
      <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-700/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse">
          <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
          Analyzing PDF structure...
        </div>
      </div>
    </div>
  )
}

export default ProgressBar
