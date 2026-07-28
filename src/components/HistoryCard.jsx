import { motion } from "framer-motion";
import { History } from "lucide-react";
import { useEffect, useState } from "react";

export default function HistoryCard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!window.chrome?.storage?.local) return;

    chrome.storage.local.get(["history"], (data) => {
      setHistory(data.history || []);
    });
  }, []);

  if (!window.chrome?.storage?.local) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <History className="text-indigo-600 w-6 h-6" />

        <h2 className="text-lg font-bold">
          Analysis History
        </h2>
      </div>

      {history.length === 0 ? (
        <p className="text-slate-500 text-sm">
          No previous analyses found.
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={index}
              className="border rounded-xl p-4 bg-slate-50"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">
                  {item.resumeName}
                </h3>

                <span
                  className={`font-bold ${
                    item.score >= 80
                      ? "text-green-600"
                      : item.score >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {item.score}%
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {item.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}