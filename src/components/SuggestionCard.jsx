import { motion } from "framer-motion";
import {
  Lightbulb,
  TrendingUp,
  Award,
  BookOpen,
} from "lucide-react";

function SuggestionItem({ icon, title, text }) {
  const Icon = icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="rounded-lg bg-blue-100 p-2 h-fit">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>

      <div>
        <h4 className="font-semibold text-slate-800">
          {title}
        </h4>

        <p className="text-sm text-slate-600 mt-1 leading-6">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

export default function SuggestionCard({ result }) {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb className="text-yellow-500" />

        <h2 className="text-lg font-bold text-slate-800">
          AI Resume Suggestions
        </h2>
      </div>

      <div className="space-y-4">

        <SuggestionItem
          icon={TrendingUp}
          title="Improve ATS Score"
          text={
            result.suggestions?.improve ||
            "Improve your resume by adding more job-specific keywords."
          }
        />

        <SuggestionItem
          icon={Award}
          title="Skills to Add"
          text={
            result.suggestions?.skills ||
            "Include missing technical skills mentioned in the job description."
          }
        />

        <SuggestionItem
          icon={BookOpen}
          title="Career Advice"
          text={
            result.suggestions?.career ||
            "Highlight measurable achievements and quantify project impact."
          }
        />

      </div>
    </motion.div>
  );
}