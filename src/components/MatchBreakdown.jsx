import { motion } from "framer-motion";
import CountUp from "react-countup";

function ProgressBar({ title, value, color }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-1">

        <span className="font-medium text-slate-700">
          {title}
        </span>

        <span className="font-bold">
          <CountUp
            end={value}
            duration={1.5}
          />
          %
        </span>

      </div>

      <div className="h-3 rounded-full bg-slate-200 overflow-hidden">

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1 }}
          className={`h-full rounded-full ${color}`}
        />

      </div>
    </div>
  );
}

export default function MatchBreakdown({ result }) {

  if (!result) return null;

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg border p-6 mt-6"
    >

      <h2 className="text-lg font-bold mb-6">
        Match Breakdown
      </h2>

      <ProgressBar
        title="Skills"
        value={result.skills_match}
        color="bg-green-500"
      />

      <ProgressBar
        title="Experience"
        value={result.experience_match}
        color="bg-blue-500"
      />

      <ProgressBar
        title="Education"
        value={result.education_match}
        color="bg-purple-500"
      />

    </motion.div>
  );
}