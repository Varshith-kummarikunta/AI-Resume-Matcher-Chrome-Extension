import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function WeaknessCard({ result }) {
  if (!result) return null;

  const weaknesses = result.weaknesses || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle className="w-6 h-6 text-red-500" />

        <h2 className="text-lg font-bold text-slate-800">
          Resume Weaknesses
        </h2>
      </div>

      {weaknesses.length > 0 ? (
        <div className="space-y-3">
          {weaknesses.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />

              <p className="text-sm text-slate-700 leading-6">
                {item}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-50 border p-4 text-center text-slate-500">
          No major weaknesses detected 🎉
        </div>
      )}
    </motion.div>
  );
}