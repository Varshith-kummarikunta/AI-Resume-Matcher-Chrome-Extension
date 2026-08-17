import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportReportButton({ result, resumeName }) {
  const [exporting, setExporting] = useState(false);

  if (!result) return null;

  const exportPDF = async () => {
    try {
      setExporting(true);

      // Load PDF libraries only when the user requests an export.
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text("AI Resume Matcher Report", 14, 20);

      // Resume
      doc.setFontSize(12);
      doc.text(`Resume: ${resumeName || "Resume"}`, 14, 32);

      // Score
      doc.setFontSize(16);
      doc.text(`ATS Score: ${result.score}%`, 14, 45);

      // Match Level
      doc.setFontSize(12);
      doc.text(`Match Level: ${result.match_level || "N/A"}`, 14, 55);

      // Interview Probability
      doc.text(
        `Interview Probability: ${
          result.interview_probability || "N/A"
        }`,
        14,
        65,
      );

      // AI Analysis
      doc.setFontSize(15);
      doc.text("AI Analysis", 14, 80);

      doc.setFontSize(11);

      const reason = doc.splitTextToSize(result.reason || "", 180);

      doc.text(reason, 14, 90);

      // Keywords
      autoTable(doc, {
        startY: 120,
        head: [["Matched Skills", "Missing Skills"]],
        body: [
          [
            (result.matched_keywords || []).join(", "),
            (result.missing_keywords || []).join(", "),
          ],
        ],
      });

      // Strengths
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Strengths"]],
        body: (result.strengths || []).map((item) => [item]),
      });

      // Weaknesses
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Weaknesses"]],
        body: (result.weaknesses || []).map((item) => [item]),
      });

      // Certifications
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Recommended Certifications"]],
        body: (result.recommended_certifications || []).map((item) => [
          item,
        ]),
      });

      // Projects
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Recommended Projects"]],
        body: (result.recommended_projects || []).map((project) => [
          typeof project === "string"
            ? project
            : project.title || "Recommended Project",
        ]),
      });

      doc.save("ATS_Report.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export the PDF report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={exportPDF}
      disabled={exporting}
      className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
    >
      <Download size={18} />

      {exporting ? "Generating PDF..." : "Export Report as PDF"}
    </button>
  );
}