import { motion } from "framer-motion";
import { FolderGit2, ArrowRight } from "lucide-react";

export default function ProjectCard({ result }) {
  if (!result) return null;

  const projects = result.recommended_projects || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <FolderGit2 className="w-6 h-6 text-indigo-600" />

        <h2 className="text-lg font-bold text-slate-800">
          Recommended Portfolio Projects
        </h2>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project, index) => {
            const projectData =
              typeof project === "string"
                ? {
                    title: project,
                    description:
                      "Build this project to strengthen your portfolio.",
                    difficulty: "Intermediate",
                  }
                : project;

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="border rounded-xl p-4 bg-indigo-50 border-indigo-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-slate-800">
                    {projectData.title}
                  </h3>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                    {projectData.difficulty || "Intermediate"}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-6 mb-3">
                  {projectData.description}
                </p>

                <div className="flex items-center text-indigo-600 font-medium text-sm">
                  Recommended Project

                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-50 border p-4 text-center text-slate-500">
          No project recommendations available.
        </div>
      )}
    </motion.div>
  );
}