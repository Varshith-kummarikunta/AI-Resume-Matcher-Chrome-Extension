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
    const apiData = await fetch("http://localhost:5000/send", {
      method: "POST",
      body: JSON.stringify({ jd: message.discription, base64: storedResume }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await apiData.json();

    console.log("API Response:", data);

    if (!apiData.ok || !data.response) {
      sendResponse({
        error: data.error || "Invalid response from server",
      });
      return;
    }

    storedResult = data.response;

    sendResponse({
      score: data.response.score,
    });
  } catch (err) {
    console.error(err);

    sendResponse({
      error: "API request failed",
    });
  }
}
