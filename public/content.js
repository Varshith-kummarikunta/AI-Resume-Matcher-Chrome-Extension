let tooltip;

document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length > 50) {
    createTooltip(selectedText);
  }
});

document.addEventListener("mousedown", (e) => {
  if (tooltip && !tooltip.contains(e.target)) {
    tooltip.remove();
  }
});

function createTooltip(selectedText) {
  if (tooltip) {
    tooltip.remove();
  }

  tooltip = document.createElement("div");
  tooltip.innerText = "Check Score";

  tooltip.style.position = "absolute";
  tooltip.style.background = "#1f1f1f";
  tooltip.style.color = "#ffffff";
  tooltip.style.padding = "10px 16px";
  tooltip.style.borderRadius = "8px";
  tooltip.style.fontSize = "14px";
  tooltip.style.fontWeight = "500";
  tooltip.style.fontFamily = "Segoe UI, sans-serif";
  tooltip.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
  tooltip.style.zIndex = "9999";
  tooltip.style.cursor = "pointer";

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  tooltip.style.top = `${rect.bottom + window.scrollY}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(tooltip);

  tooltip.onclick = () => {
    tooltip.style.pointerEvents = "none";
    tooltip.innerHTML = `
<div style="display:flex;align-items:center;gap:8px;">
  <div style="
      width:14px;
      height:14px;
      border:2px solid #ddd;
      border-top:2px solid #3b82f6;
      border-radius:50%;
      animation:spin 0.8s linear infinite;
  "></div>
  <span>Analysing...</span>
</div>
`;

    if (!document.getElementById("spinner-style")) {
      const style = document.createElement("style");
      style.id = "spinner-style";
      style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
      document.head.appendChild(style);
    }

    chrome.runtime.sendMessage(
      {
        type: "CHECK_SCORE",
        discription: selectedText,
      },
      (response) => {
        // Extension error
        if (chrome.runtime.lastError) {
          tooltip.style.pointerEvents = "auto";
          tooltip.innerText = chrome.runtime.lastError.message;
          return;
        }

        if (response && typeof response === "object") {
          if (response.error) {
            tooltip.innerText = response.error;
          } else if (response.score !== undefined) {
            tooltip.innerHTML = `
<div style="
display:flex;
align-items:center;
gap:8px;
font-weight:600;
color:#22c55e;
">
✅ ATS Score: ${response.score}%
</div>
`;
          } else {
            tooltip.innerText = JSON.stringify(response);
          }
        } else {
          tooltip.innerText = response;
        }

        tooltip.style.pointerEvents = "auto";

        setTimeout(() => {
          if (tooltip) {
            tooltip.remove();
          }
        }, 2500);
      },
    );
  };
}
