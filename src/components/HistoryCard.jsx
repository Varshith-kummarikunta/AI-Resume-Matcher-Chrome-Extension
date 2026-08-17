import { motion } from "framer-motion";
import {
  History,
  Eye,
  Trash2,
  X,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function HistoryCard({ onView }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  function loadHistory() {
    if (!window.chrome?.storage?.local) {
      setLoading(false);
      return;
    }

    chrome.storage.local.get(["history"], (data) => {
      setHistory(data.history || []);
      setLoading(false);
    });
  }

  function deleteHistory(id) {
    if (!window.chrome?.runtime?.sendMessage) return;

    chrome.runtime.sendMessage(
      {
        type: "DELETE_HISTORY",
        id,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }

        if (response?.success) {
          setHistory((prev) =>
            prev.filter((item) => item.id !== id)
          );
        }
      }
    );
  }

  function clearHistory() {
    if (!window.chrome?.runtime?.sendMessage) return;

    chrome.runtime.sendMessage(
      {
        type: "CLEAR_HISTORY",
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }

        if (response?.success) {
          setHistory([]);
        }
      }
    );
  }

  function formatDate(date) {
    if (!date) return "Unknown date";

    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  }

  function getScoreColor(score) {
    if (score >= 80) {
      return "text-green-600";
    }

    if (score >= 60) {
      return "text-yellow-600";
    }

    return "text-red-600";
  }

  function getScoreLabel(score) {
    if (score >= 80) {
      return "Strong Match";
    }

    if (score >= 60) {
      return "Moderate Match";
    }

    return "Weak Match";
  }

  if (!window.chrome?.storage?.local) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      {/* Header */}

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <History className="text-indigo-600 w-6 h-6" />

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Analysis History
            </h2>

            <p className="text-xs text-slate-500">
              {history.length}{" "}
              {history.length === 1
                ? "analysis"
                : "analyses"}{" "}
              saved
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Loading */}

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-20 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}

      {!loading && history.length === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="mx-auto text-slate-300 w-10 h-10 mb-3" />

          <p className="text-slate-600 font-medium">
            No previous analyses
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Your resume analyses will appear here.
          </p>
        </div>
      )}

      {/* History */}

      {!loading && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              className="border rounded-xl p-4 bg-slate-50"
            >
              {/* Top Row */}

              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">
                    {item.resumeName || "Resume"}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(item.date)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-xl font-bold ${getScoreColor(
                      item.score
                    )}`}
                  >
                    {item.score}%
                  </p>

                  <p className="text-[10px] text-slate-500">
                    {getScoreLabel(item.score)}
                  </p>
                </div>
              </div>

              {/* Keywords */}

              <div className="flex gap-3 mt-3 text-xs">
                <span className="text-green-600">
                  ✓{" "}
                  {item.matchedKeywords?.length || 0} matched
                </span>

                <span className="text-red-500">
                  ✕{" "}
                  {item.missingKeywords?.length || 0} missing
                </span>
              </div>

              {/* Actions */}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onView?.(item)}
                  className="flex-1 bg-indigo-600 text-white text-xs py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-1"
                >
                  <Eye size={14} />
                  View Analysis
                </button>

                <button
                  onClick={() => deleteHistory(item.id)}
                  className="px-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                  title="Delete analysis"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}