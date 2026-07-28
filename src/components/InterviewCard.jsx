import { motion } from "framer-motion";
import { BriefcaseBusiness } from "lucide-react";

function getColor(level) {
  switch (level) {
    case "Very High":
      return "bg-green-600 text-white";
    case "High":
      return "bg-green-500 text-white";
    case "Medium":
      return "bg-yellow-400 text-black";
    case "Low":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function getProgress(level) {
  switch (level) {
    case "Very High":
      return 95;
    case "High":
      return 80;
    case "Medium":
      return 55;
    case "Low":
      return 25;
    default:
      return 0;
  }
}

export default function InterviewCard({ result }) {
  if (!result) return null;

  const level = result.interview_probability || "Medium";
  const progress = getProgress(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <BriefcaseBusiness className="text-blue-600 w-6 h-6" />

        <h2 className="text-lg font-bold text-slate-800">
          Interview Probability
        </h2>
      </div>

      <div className="flex justify-center mb-6">

        <span
          className={`px-6 py-3 rounded-full font-bold text-lg ${getColor(level)}`}
        >
          {level}
        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
          className="bg-blue-600 h-4 rounded-full"
        />

      </div>

      <div className="mt-3 text-center font-semibold text-slate-700">
        {progress}% Interview Readiness
      </div>

      <p className="text-center text-sm text-slate-500 mt-3">
        This estimate is based on your ATS score, keyword alignment,
        experience relevance, and overall resume quality.
      </p>
    </motion.div>
  );
}