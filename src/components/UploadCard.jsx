import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function UploadCard({
  file,
  setFile,
  handleSubmit,
  resumeUploaded,
  resumeName,
}) {
  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5"
    >
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-6 hover:border-blue-500 transition-all">

        <Upload className="w-12 h-12 text-blue-600 mb-3" />

        <p className="font-semibold text-slate-700">
          Upload your Resume
        </p>

        <p className="text-sm text-slate-500 mb-4">
          PDF files only
        </p>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const selected = e.target.files[0];

            if (selected) {
              setFile(selected);
            }
          }}
          className="block w-full text-sm
          file:mr-4
          file:py-2
          file:px-4
          file:rounded-lg
          file:border-0
          file:bg-blue-600
          file:text-white
          file:cursor-pointer
          file:hover:bg-blue-700"
        />

        {resumeName && (
          <div className="flex items-center gap-2 mt-4 text-green-600">

            <FileText className="w-5 h-5" />

            <span className="text-sm font-medium">
              {resumeName}
            </span>

          </div>
        )}

        {resumeUploaded && (
          <div className="flex items-center gap-2 mt-2 text-green-600">

            <CheckCircle2 className="w-5 h-5" />

            <span className="text-sm">
              {resumeUploaded}
            </span>

          </div>
        )}

        <button
          type="submit"
          disabled={!file}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition"
        >
          Upload Resume
        </button>

      </div>
    </motion.form>
  );
}