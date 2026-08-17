export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = reject;

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
}

export function getScoreLevel(score) {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

export function getScoreColor(score) {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}

export function formatDate(date) {
  return new Date(date).toLocaleString();
}