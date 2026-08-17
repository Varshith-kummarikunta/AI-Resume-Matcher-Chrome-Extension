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
import useChromeRuntime from "./hooks/useChromeRuntime";
import { blobToBase64 } from "./utils/helpers";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [resumeName, setResumeName] = useState();
  const [resumeUploaded, setResumeUploaded] = useState("");
  const [loading, setLoading] = useState(false);
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
  }

  function handleViewHistory(item) {
  setResult({
    score: item.score ?? 0,

    match_level: item.matchLevel || "Unknown",

    reason: item.reason || "",

    interview_probability:
      item.interviewProbability || null,

    matched_keywords:
      item.matchedKeywords || [],

    missing_keywords:
      item.missingKeywords || [],

    strengths:
      item.strengths || [],

    weaknesses:
      item.weaknesses || [],

    suggestions:
      item.suggestions || {
        improve: "",
        skills: "",
        career: "",
      },

    recommended_certifications:
      Array.isArray(item.certifications)
        ? item.certifications
        : [],

    recommended_projects:
      Array.isArray(item.projects)
        ? item.projects
        : [],

    skills_match:
      item.skillsMatch ?? 0,

    experience_match:
      item.experienceMatch ?? 0,

    education_match:
      item.educationMatch ?? 0,

    overall_feedback:
      item.overallFeedback || "",
  });

  setResumeName(item.resumeName || "Resume");
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

      <ScoreCard result={result} resumeName={resumeName} />

      <InterviewCard result={result} />

      <MatchBreakdown result={result} />

      <StrengthCard result={result} />

      <WeaknessCard result={result} />

      <KeywordSection result={result} />

      <SuggestionCard result={result} />

      <CertificationCard result={result} />

      <ProjectCard result={result} />

      <ExportReportButton result={result} resumeName={resumeName} />

      <HistoryCard onView={handleViewHistory} />

      {result && (
        <button
          onClick={() => {
            if (window.chrome?.runtime?.sendMessage) {
              chrome.runtime.sendMessage({ type: "CLEAR_RESULT" }, () => {});
            }
            setResult(null);
            setFile(null);
            setResumeUploaded("");
          }}
          className="mt-5 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-200 cursor-pointer"
        >
          Remove resume
        </button>
      )}
    </div>
  );
}

export default App;
