import { motion } from "framer-motion";
import { CheckCircle2, Trophy } from "lucide-react";

export default function StrengthCard({ result }) {
  if (!result) return null;

  const strengths = result.strengths || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-6 h-6 text-green-600" />

        <h2 className="text-lg font-bold text-slate-800">
          Resume Strengths
        </h2>
      </div>

      {strengths.length > 0 ? (
        <div className="space-y-3">
          {strengths.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />

              <p className="text-sm text-slate-700 leading-6">
                {item}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-50 border p-4 text-center text-slate-500">
          No strengths available.
        </div>
      )}
    </motion.div>
  );
}