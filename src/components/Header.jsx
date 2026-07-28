import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-5"
    >
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
          <BrainCircuit className="text-white w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-800">
            AI Resume Matcher
          </h1>

          <p className="text-sm text-gray-500">
            ATS Resume Analyzer
          </p>
        </div>
      </div>
    </motion.div>
  );
}