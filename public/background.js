let storedResume = null;
let storedFileName = null;

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
});

let storedResult = null;

async function callApi(message, sendResponse) {
  if (!storedResume) {
    sendResponse("Upload the resume");
    return;
  }

  try {
    const apiData = await fetch(
      "https://ai-resume-matcher-chrome-extension-production.up.railway.app/send",
      {
        method: "POST",
        body: JSON.stringify({ jd: message.discription, base64: storedResume }),
        headers: {
          "Content-Type": "application/json",
        },
      },
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
        error: "Invalid response format from server",
      });
      return;
    }

    storedResult = data.response;

    // Save history
    chrome.storage.local.get(["history"], (storage) => {
      const history = storage.history || [];

      history.unshift({
        resumeName: storedFileName,
        score: data.response.score,
        interviewProbability: data.response.interview_probability,
        matchedKeywords: data.response.matched_keywords,
        missingKeywords: data.response.missing_keywords,
        date: new Date().toLocaleString(),
      });

      chrome.storage.local.set({
        history: history.slice(0, 10),
      });
    });

    sendResponse({
      score: data.response.score,
    });
  } catch (err) {
    console.error("Fetch Error:", err);

    sendResponse({
      error: err.message || "Network request failed",
    });
  }
}
