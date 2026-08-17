import { useCallback } from "react";

export default function useChromeRuntime() {
  const isExtension =
    typeof window !== "undefined" &&
    !!window.chrome?.runtime?.sendMessage;

  const sendMessage = useCallback((message) => {
    return new Promise((resolve, reject) => {
      if (!isExtension) {
        reject(new Error("Chrome Extension API is unavailable"));
        return;
      }

      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve(response);
      });
    });
  }, [isExtension]);

  return {
    isExtension,
    sendMessage,
  };
}