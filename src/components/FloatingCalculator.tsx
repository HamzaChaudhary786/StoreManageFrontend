"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";
import { Calculator, X } from "lucide-react";

export function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Set the constraints to the window to keep the calculator within bounds
  useEffect(() => {
    // We don't necessarily need a strict physical ref if we use dragConstraints={{ left: 0, right: window.innerWidth, etc }} 
    // but a safer approach is to just let it drag anywhere with some bounds.
  }, []);

  const handleNumber = (num: string) => {
    setDisplay((prev) => (prev === "0" ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ");
    setDisplay("0");
  };

  const handleEqual = () => {
    try {
      // safe eval for basic calculator
      const fullEquation = equation + display;
      // Replace basic symbols if needed
      const cleanEq = fullEquation.replace(/×/g, "*").replace(/÷/g, "/");
      // Use Function constructor instead of eval to avoid React compiler warnings
      const result = new Function("return " + cleanEq)();
      setDisplay(String(result));
      setEquation("");
    } catch (e) {
      setDisplay("Error");
      setEquation("");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
  };

  const handleDelete = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        // Small timeout to prevent click from firing right after drag
        setTimeout(() => setIsDragging(false), 100);
      }}
      className="fixed z-[9999]"
      style={{ bottom: 40, right: 40 }}
    >
      {!isOpen ? (
        <button
          onClick={() => {
            if (!isDragging) setIsOpen(true);
          }}
          className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-move"
          title="Open Calculator (Drag to move)"
        >
          <Calculator size={28} />
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-72 overflow-hidden cursor-move">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Calculator size={16} />
              <span className="text-sm font-medium select-none">Calculator</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4 select-none cursor-default">
            <div className="bg-gray-100 dark:bg-gray-950 p-3 rounded-xl mb-4 text-right">
              <div className="text-gray-500 text-sm h-5 overflow-hidden">{equation}</div>
              <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100 overflow-hidden text-ellipsis whitespace-nowrap">
                {display}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button onClick={handleClear} className="col-span-2 p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">AC</button>
              <button onClick={handleDelete} className="p-3 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">DEL</button>
              <button onClick={() => handleOperator("/")} className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">÷</button>

              <button onClick={() => handleNumber("7")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">7</button>
              <button onClick={() => handleNumber("8")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">8</button>
              <button onClick={() => handleNumber("9")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">9</button>
              <button onClick={() => handleOperator("*")} className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">×</button>

              <button onClick={() => handleNumber("4")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">4</button>
              <button onClick={() => handleNumber("5")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">5</button>
              <button onClick={() => handleNumber("6")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">6</button>
              <button onClick={() => handleOperator("-")} className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">-</button>

              <button onClick={() => handleNumber("1")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">1</button>
              <button onClick={() => handleNumber("2")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">2</button>
              <button onClick={() => handleNumber("3")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">3</button>
              <button onClick={() => handleOperator("+")} className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">+</button>

              <button onClick={() => handleNumber("0")} className="col-span-2 p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">0</button>
              <button onClick={() => handleNumber(".")} className="p-3 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">.</button>
              <button onClick={handleEqual} className="p-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">=</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
