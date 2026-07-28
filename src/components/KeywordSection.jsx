import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

function KeywordChip({ keyword, matched }) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition
        ${
          matched
            ? "bg-green-100 text-green-700 border border-green-200"
            : "bg-red-100 text-red-700 border border-red-200"
        }`}
    >
      {matched ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}

      {keyword}
    </motion.span>
  );
}

export default function KeywordSection({ result }) {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      {/* Matched */}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Matched Skills
        </h3>

        {result.matched_keywords?.length ? (
          <div className="flex flex-wrap gap-3">
            {result.matched_keywords.map((keyword, index) => (
              <KeywordChip
                key={index}
                keyword={keyword}
                matched={true}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">
            No matched keywords found.
          </p>
        )}
      </div>

      {/* Missing */}

      <div>
        <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          Missing Skills
        </h3>

        {result.missing_keywords?.length ? (
          <div className="flex flex-wrap gap-3">
            {result.missing_keywords.map((keyword, index) => (
              <KeywordChip
                key={index}
                keyword={keyword}
                matched={false}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">
            No missing keywords 🎉
          </p>
        )}
      </div>
    </motion.div>
  );
}