import { useState } from "react";
import "./App.css";
import { useEffect } from "react";
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

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [resumeName, setResumeName] = useState();
  const [resumeUploaded, setResumeUploaded] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (window.chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "GET_RESULT" }, (response) => {
        if (response?.result) {
          setResult(response.result);
          setResumeName(response.fileName);
        }
      });
    } else {
      console.log("Running in Vite development mode");
    }
  }, []);

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

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
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

      <HistoryCard />

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
