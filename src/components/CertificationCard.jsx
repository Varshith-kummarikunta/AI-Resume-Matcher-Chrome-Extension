import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";

export default function CertificationCard({ result }) {
  if (!result) return null;

  const certifications = result.recommended_certifications || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Award className="w-6 h-6 text-yellow-500" />

        <h2 className="text-lg font-bold text-slate-800">
          Recommended Certifications
        </h2>
      </div>

      {certifications.length > 0 ? (
        <div className="space-y-3">
          {certifications.map((certification, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 p-4"
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-600" />

                <span className="text-sm font-medium text-slate-700">
                  {certification}
                </span>
              </div>

              <ExternalLink className="w-4 h-4 text-slate-400" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-50 border p-4 text-center text-slate-500">
          No certification recommendations available.
        </div>
      )}
    </motion.div>
  );
}