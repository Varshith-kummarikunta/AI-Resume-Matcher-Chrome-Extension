import { motion } from "framer-motion";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function getColor(score) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function getLabel(score) {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Average Match";
  return "Needs Improvement";
}

export default function ScoreCard({ result, resumeName }) {
  if (!result) return null;

  const color = getColor(result.score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        ATS Analysis
      </h2>

      <div className="flex flex-col items-center">

        <div className="w-36 h-36">

          <CircularProgressbar
            value={result.score}
            text={`${result.score}%`}
            styles={buildStyles({
              textColor: color,
              pathColor: color,
              trailColor: "#E5E7EB",
              textSize: "18px",
            })}
          />

        </div>

        <h3
          className="mt-4 text-lg font-bold"
          style={{ color }}
        >
          {getLabel(result.score)}
        </h3>

        <p className="text-sm text-slate-500 mt-1 text-center">
          {resumeName}
        </p>

      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 border">

        <h4 className="font-semibold text-slate-700 mb-2">
          AI Analysis
        </h4>

        <p className="text-sm text-slate-600 leading-6">
          {result.reason}
        </p>

      </div>
    </motion.div>
  );
}