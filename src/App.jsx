import { useState } from "react";
import "./App.css";
import { useEffect } from "react";
import Header from "./components/Header";
import UploadCard from "./components/UploadCard";
import ScoreCard from "./components/ScoreCard";
import KeywordSection from "./components/KeywordSection";
import SuggestionCard from "./components/SuggestionCard";
function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [resumeName, setResumeName] = useState();
  const [resumeUploaded, setResumeUploaded] = useState("");
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

    if (!file) {
      alert("Upload the resume");
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
            return;
          }

          if (response?.success) {
            setResumeUploaded("Resume uploaded successfully");
          }
        },
      );
    } else {
      alert("This feature works only inside the Chrome Extension.");
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
        file={file}
        setFile={setFile}
        handleSubmit={handleSubmit}
        resumeUploaded={resumeUploaded}
        resumeName={resumeName}
      />

      <ScoreCard result={result} resumeName={resumeName} />

      <KeywordSection result={result} />

      <SuggestionCard result={result} />

      {result && (
        <button
          onClick={() => {
            if (window.chrome?.runtime?.sendMessage) {
              chrome.runtime.sendMessage({ type: "CLEAR_RESULT" });
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
