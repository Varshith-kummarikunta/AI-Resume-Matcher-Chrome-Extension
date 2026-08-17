let storedResume = null;
let storedFileName = null;
let storedResult = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHECK_SCORE") {
    callApi(message, sendResponse);
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

        resumeName: storedFileName,

        score: data.response.score,

        interviewProbability:
          data.response.interview_probability || null,

        matchedKeywords:
          data.response.matched_keywords || [],

        missingKeywords:
          data.response.missing_keywords || [],

        strengths:
          data.response.strengths || [],

        weaknesses:
          data.response.weaknesses || [],

        suggestions:
          data.response.suggestions || [],

        certifications:
          data.response.recommended_certifications || [],

        projects:
          data.response.recommended_projects || [],

        reason:
          data.response.reason || "",

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