import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import UploadCard from "./components/UploadCard";
import ScoreCard from "./components/ScoreCard";
import KeywordSection from "./components/KeywordSection";
import SuggestionCard from "./components/SuggestionCard";
import MatchBreakdown from "./components/MatchBreakdown";
import StrengthCard from "./components/StrengthCard";
import WeaknessCard from "./components/WeaknessCard";
import InterviewCard from "./components/InterviewCard";
import CertificationCard from "./components/CertificationCard";
import ProjectCard from "./components/ProjectCard";
import ExportReportButton from "./components/ExportReportButton";
import HistoryCard from "./components/HistoryCard";
import OptimizedResumeCard from "./components/OptimizedResumeCard";
import useChromeRuntime from "./hooks/useChromeRuntime";
import { blobToBase64 } from "./utils/helpers";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [resumeName, setResumeName] = useState();
  const [resumeUploaded, setResumeUploaded] = useState("");
  const [loading, setLoading] = useState(false);

  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const { isExtension, sendMessage } = useChromeRuntime();

  useEffect(() => {
    if (!isExtension) {
      console.log("Running in Vite development mode");
      return;
    }

    sendMessage({ type: "GET_RESULT" })
      .then((response) => {
        if (response?.result) {
          setResult(response.result);
          setResumeName(response.fileName);
        }
      })
      .catch((error) => {
        console.error("Failed to load stored result:", error);
      });
  }, [isExtension, sendMessage]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!file) {
      alert("Upload the resume");
      setLoading(false);
      return;
    }

    const base64 = await blobToBase64(file);

    if (window.chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
        {
          type: "RESUME",
          base64,
          fileName: file.name,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            setLoading(false);
            return;
          }

          if (response?.success) {
            setResumeUploaded("Resume uploaded successfully");
            setLoading(false);
          }
        },
      );
    } else {
      alert("This feature works only inside the Chrome Extension.");
      setLoading(false);
    }

    setResult(null);
    setOptimizedResume(null);
  }

  function handleViewHistory(item) {
    if (!item) return;

    const suggestions =
      item.suggestions && typeof item.suggestions === "object"
        ? {
            improve: item.suggestions.improve || "",
            skills: item.suggestions.skills || "",
            career: item.suggestions.career || "",
          }
        : {
            improve: "",
            skills: "",
            career: "",
          };

    const certifications = Array.isArray(item.certifications)
      ? item.certifications
      : [];

    const projects = Array.isArray(item.projects) ? item.projects : [];

    setResult({
      score: item.score ?? 0,
      match_level: item.matchLevel || "Unknown",
      reason: item.reason || "",

      interview_probability: item.interviewProbability || null,

      matched_keywords: Array.isArray(item.matchedKeywords)
        ? item.matchedKeywords
        : [],

      missing_keywords: Array.isArray(item.missingKeywords)
        ? item.missingKeywords
        : [],

      strengths: Array.isArray(item.strengths) ? item.strengths : [],

      weaknesses: Array.isArray(item.weaknesses) ? item.weaknesses : [],

      suggestions,

      recommended_certifications: certifications,

      recommended_projects: projects,

      skills_match: item.skillsMatch ?? 0,
      experience_match: item.experienceMatch ?? 0,
      education_match: item.educationMatch ?? 0,

      overall_feedback: item.overallFeedback || "",
    });

    setResumeName(item.resumeName || "Resume");
    setResumeUploaded("");
    setOptimizedResume(null);
  }

  async function handleOptimizeResume() {
    if (!jobDescription.trim()) {
      alert("Job description is required.");
      return;
    }

    if (!isExtension) {
      alert("This feature works only inside the Chrome Extension.");
      return;
    }

    setOptimizeLoading(true);
    setOptimizedResume(null);

    try {
      const response = await sendMessage({
        type: "OPTIMIZE_RESUME",
        discription: jobDescription,
      });

      if (response?.error) {
        alert(response.error);
        return;
      }

      if (!response?.result) {
        alert("Invalid optimization response.");
        return;
      }

      setOptimizedResume(response.result);
    } catch (error) {
      console.error("Resume optimization failed:", error);

      alert(error.message || "Resume optimization failed.");
    } finally {
      setOptimizeLoading(false);
    }
  }

  function handleRemoveResume() {
    if (window.chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
        { type: "CLEAR_RESULT" },
        () => {},
      );
    }

    setResult(null);
    setOptimizedResume(null);
    setFile(null);
    setResumeName("");
    setResumeUploaded("");
    setJobDescription("");
  }

  return (
    <div className="w-[390px] min-h-screen bg-slate-100 p-5">
      <Header />

      <UploadCard
        setFile={setFile}
        handleSubmit={handleSubmit}
        resumeUploaded={resumeUploaded}
        resumeName={resumeName}
        loading={loading}
      />

      {/* Optimize Resume */}
      <div className="mt-5 bg-white rounded-xl p-4 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-800">
            Optimize Resume for this Job
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Paste a job description and AI will tailor your existing resume
            without inventing experience.
          </p>
        </div>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the Job Description here..."
          className="mt-3 w-full min-h-[140px] border border-slate-300 rounded-lg p-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleOptimizeResume}
          disabled={optimizeLoading}
          className="mt-3 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
        >
          {optimizeLoading
            ? "Optimizing Resume..."
            : "Optimize Resume"}
        </button>
      </div>

      {/* Optimized Resume */}
      <OptimizedResumeCard result={optimizedResume} />

      {/* ATS Analysis */}
      <ScoreCard result={result} resumeName={resumeName} />

      <InterviewCard result={result} />

      <MatchBreakdown result={result} />

      <StrengthCard result={result} />

      <WeaknessCard result={result} />

      <KeywordSection result={result} />

      <SuggestionCard result={result} />

      <CertificationCard result={result} />

      <ProjectCard result={result} />

      <ExportReportButton
        result={result}
        resumeName={resumeName}
      />

      <HistoryCard onView={handleViewHistory} />

      {result && (
        <button
          onClick={handleRemoveResume}
          className="mt-5 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-200 cursor-pointer"
        >
          Remove resume
        </button>
      )}
    </div>
  );
}

export default App;