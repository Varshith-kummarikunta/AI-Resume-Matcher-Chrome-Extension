let storedResume = null;
let storedFileName = null;
let storedResult = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHECK_SCORE") {
    callApi(message, sendResponse);
    return true;
  }

    if (message.type === "OPTIMIZE_RESUME") {
    optimizeResume(message, sendResponse);
    return true;
  }

  if (message.type === "RESUME") {
    storedResume = message.base64;
    storedFileName = message.fileName;
    storedResult = null;

    sendResponse({
      success: true,
    });

    return true;
  }

  if (message.type === "GET_RESULT") {
    sendResponse({
      result: storedResult,
      fileName: storedFileName,
    });

    return true;
  }

  if (message.type === "CLEAR_RESULT") {
    storedResult = null;
    storedResume = null;
    storedFileName = null;

    sendResponse({
      success: true,
    });

    return true;
  }

  if (message.type === "GET_HISTORY") {
    chrome.storage.local.get(["history"], (data) => {
      sendResponse({
        history: data.history || [],
      });
    });

    return true;
  }

  if (message.type === "DELETE_HISTORY") {
    chrome.storage.local.get(["history"], (data) => {
      const history = data.history || [];

      const updatedHistory = history.filter(
        (item) => item.id !== message.id
      );

      chrome.storage.local.set(
        {
          history: updatedHistory,
        },
        () => {
          sendResponse({
            success: true,
          });
        }
      );
    });

    return true;
  }

  if (message.type === "CLEAR_HISTORY") {
    chrome.storage.local.set(
      {
        history: [],
      },
      () => {
        sendResponse({
          success: true,
        });
      }
    );

    return true;
  }
});

async function callApi(message, sendResponse) {
  if (!storedResume) {
    sendResponse({
      error: "Upload the resume first.",
    });

    return;
  }

  try {
    const apiData = await fetch(
      "https://ai-resume-matcher-chrome-extension-production.up.railway.app/send",
      {
        method: "POST",
        body: JSON.stringify({
          jd: message.discription,
          base64: storedResume,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const text = await apiData.text();

    console.log("Raw Response:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      sendResponse({
        error: `Backend returned invalid JSON (HTTP ${apiData.status})`,
      });

      return;
    }

    console.log("API Response:", data);

    if (!apiData.ok) {
      sendResponse({
        error: data.error || `Server error (HTTP ${apiData.status})`,
      });

      return;
    }

    if (!data.response) {
      sendResponse({
        error: "Invalid response format from server.",
      });

      return;
    }

    storedResult = data.response;

    // -----------------------------
    // SAVE ANALYSIS TO HISTORY
    // -----------------------------

    chrome.storage.local.get(["history"], (storage) => {
      const history = storage.history || [];

      const historyItem = {
  id: crypto.randomUUID(),

  // Resume
  resumeName: storedFileName,

  // Main ATS results
  score: data.response.score,
  matchLevel: data.response.match_level || "Unknown",
  reason: data.response.reason || "",

  // Interview
  interviewProbability:
    data.response.interview_probability || null,

  // Keyword analysis
  matchedKeywords:
    data.response.matched_keywords || [],

  missingKeywords:
    data.response.missing_keywords || [],

  // Resume analysis
  strengths:
    data.response.strengths || [],

  weaknesses:
    data.response.weaknesses || [],

  // AI suggestions
  suggestions:
    data.response.suggestions || {},

  // Recommendations
  certifications:
    data.response.recommended_certifications || [],

  projects:
    data.response.recommended_projects || [],

  // Match breakdown
  skillsMatch:
    data.response.skills_match ?? 0,

  experienceMatch:
    data.response.experience_match ?? 0,

  educationMatch:
    data.response.education_match ?? 0,

  // Overall feedback
  overallFeedback:
    data.response.overall_feedback || "",

  // Timestamp
  date: new Date().toISOString(),
};

      history.unshift(historyItem);

      chrome.storage.local.set(
        {
          history: history.slice(0, 20),
        },
        () => {
          console.log("Analysis saved to history.");
        }
      );
    });

    sendResponse({
      score: data.response.score,
    });
  } catch (err) {
    console.error("Fetch Error:", err);

    sendResponse({
      error: err.message || "Network request failed.",
    });
  }
}


async function optimizeResume(message, sendResponse) {
  if (!storedResume) {
    sendResponse({
      error: "Upload the resume first.",
    });

    return;
  }

  if (!message.discription) {
    sendResponse({
      error: "Job description is required.",
    });

    return;
  }

  try {
    const apiData = await fetch(
      "https://ai-resume-matcher-chrome-extension-production.up.railway.app/optimize-resume",
      {
        method: "POST",
        body: JSON.stringify({
          jd: message.discription,
          base64: storedResume,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const text = await apiData.text();

    console.log("Optimize Resume Raw Response:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      sendResponse({
        error: `Backend returned invalid JSON (HTTP ${apiData.status})`,
      });

      return;
    }

    console.log("Optimize Resume API Response:", data);

    if (!apiData.ok) {
      sendResponse({
        error: data.error || `Server error (HTTP ${apiData.status})`,
      });

      return;
    }

    if (!data.response) {
      sendResponse({
        error: "Invalid optimization response from server.",
      });

      return;
    }

    sendResponse({
      success: true,
      result: data.response,
      fileName: storedFileName,
    });
  } catch (err) {
    console.error("Resume Optimization Fetch Error:", err);

    sendResponse({
      error: err.message || "Resume optimization request failed.",
    });
  }
}