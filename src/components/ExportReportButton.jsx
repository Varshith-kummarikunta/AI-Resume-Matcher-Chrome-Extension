import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportReportButton({ result, resumeName }) {
  const [exporting, setExporting] = useState(false);

  if (!result) return null;

  const exportPDF = async () => {
    try {
      setExporting(true);

      // Load PDF libraries only when the user requests an export.
      const [{ default: jsPDF }, { default: autoTable }] =
        await Promise.all([
          import("jspdf"),
          import("jspdf-autotable"),
        ]);

      const doc = new jsPDF();

      // --------------------------------------------------
      // HELPERS
      // --------------------------------------------------

      const cleanText = (value) => {
        if (value === null || value === undefined) {
          return "";
        }

        return String(value)
          .replace(/[-–—]/g, "-")
          .replace(/[’‘]/g, "'")
          .replace(/[“”]/g, '"')
          .replace(/•/g, "-")
          .replace(/[^\x20-\x7E\n\r]/g, "");
      };

      const safeArray = (value) => {
        return Array.isArray(value) ? value : [];
      };

      const addSectionTitle = (title, y) => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(cleanText(title), 14, y);

        doc.setFont("helvetica", "normal");

        return y + 8;
      };

      const getNextY = () => {
        return doc.lastAutoTable?.finalY
          ? doc.lastAutoTable.finalY + 10
          : 20;
      };

      // --------------------------------------------------
      // HEADER
      // --------------------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("AI Resume Matcher", 14, 20);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("ATS Resume Analysis Report", 14, 27);

      doc.setDrawColor(180, 180, 180);
      doc.line(14, 31, 196, 31);

      // --------------------------------------------------
      // RESUME INFORMATION
      // --------------------------------------------------

      doc.setFontSize(11);

      doc.text(
        `Resume: ${cleanText(resumeName || "Resume")}`,
        14,
        40,
      );

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        47,
      );

      // --------------------------------------------------
      // ATS SCORE
      // --------------------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);

      doc.text(
        `ATS Score: ${cleanText(result.score ?? 0)}%`,
        14,
        61,
      );

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      doc.text(
        `Match Level: ${cleanText(result.match_level || "N/A")}`,
        14,
        69,
      );

      doc.text(
        `Interview Probability: ${cleanText(
          result.interview_probability || "N/A",
        )}`,
        14,
        76,
      );

      // --------------------------------------------------
      // AI ANALYSIS
      // --------------------------------------------------

      let y = 88;

      y = addSectionTitle("AI Analysis", y);

      doc.setFontSize(10);

      const reason = doc.splitTextToSize(
        cleanText(result.reason || "No analysis available."),
        180,
      );

      doc.text(reason, 14, y);

      y += reason.length * 5 + 5;

      // --------------------------------------------------
      // MATCH BREAKDOWN
      // --------------------------------------------------

      autoTable(doc, {
        startY: y,
        head: [["Match Breakdown", "Score"]],
        body: [
          [
            "Skills",
            `${cleanText(result.skills_match ?? 0)}%`,
          ],
          [
            "Experience",
            `${cleanText(result.experience_match ?? 0)}%`,
          ],
          [
            "Education",
            `${cleanText(result.education_match ?? 0)}%`,
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });

      // --------------------------------------------------
      // MATCHED / MISSING SKILLS
      // --------------------------------------------------

      autoTable(doc, {
        startY: getNextY(),
        head: [["Matched Skills", "Missing Skills"]],
        body: [
          [
            cleanText(
              safeArray(result.matched_keywords).join(", ") ||
                "None",
            ),
            cleanText(
              safeArray(result.missing_keywords).join(", ") ||
                "None",
            ),
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          overflow: "linebreak",
        },
        headStyles: {
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 88 },
          1: { cellWidth: 88 },
        },
      });

      // --------------------------------------------------
      // STRENGTHS
      // --------------------------------------------------

      const strengths = safeArray(result.strengths);

      if (strengths.length > 0) {
        autoTable(doc, {
          startY: getNextY(),
          head: [["Resume Strengths"]],
          body: strengths.map((item) => [
            cleanText(`- ${item}`),
          ]),
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 4,
            overflow: "linebreak",
          },
          headStyles: {
            fontStyle: "bold",
          },
        });
      }

      // --------------------------------------------------
      // WEAKNESSES
      // --------------------------------------------------

      const weaknesses = safeArray(result.weaknesses);

      if (weaknesses.length > 0) {
        autoTable(doc, {
          startY: getNextY(),
          head: [["Resume Weaknesses"]],
          body: weaknesses.map((item) => [
            cleanText(`- ${item}`),
          ]),
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 4,
            overflow: "linebreak",
          },
          headStyles: {
            fontStyle: "bold",
          },
        });
      }

      // --------------------------------------------------
      // AI SUGGESTIONS
      // --------------------------------------------------

      const suggestions = result.suggestions || {};

      const suggestionRows = [];

      if (suggestions.improve) {
        suggestionRows.push([
          "Improve ATS Score",
          cleanText(suggestions.improve),
        ]);
      }

      if (suggestions.skills) {
        suggestionRows.push([
          "Skills to Add",
          cleanText(suggestions.skills),
        ]);
      }

      if (suggestions.career) {
        suggestionRows.push([
          "Career Advice",
          cleanText(suggestions.career),
        ]);
      }

      if (suggestionRows.length > 0) {
        autoTable(doc, {
          startY: getNextY(),
          head: [["AI Recommendation", "Details"]],
          body: suggestionRows,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 4,
            overflow: "linebreak",
          },
          headStyles: {
            fontStyle: "bold",
          },
          columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 135 },
          },
        });
      }

      // --------------------------------------------------
      // CERTIFICATIONS
      // --------------------------------------------------

      const certifications = safeArray(
        result.recommended_certifications,
      );

      if (certifications.length > 0) {
        autoTable(doc, {
          startY: getNextY(),
          head: [["Recommended Certifications"]],
          body: certifications.map((item) => [
            cleanText(`- ${item}`),
          ]),
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 4,
            overflow: "linebreak",
          },
          headStyles: {
            fontStyle: "bold",
          },
        });
      }

      // --------------------------------------------------
      // RECOMMENDED PROJECTS
      // --------------------------------------------------

      const projects = safeArray(
        result.recommended_projects,
      );

      if (projects.length > 0) {
        autoTable(doc, {
          startY: getNextY(),
          head: [["Recommended Projects"]],
          body: projects.map((project) => {
            if (typeof project === "string") {
              return [cleanText(project)];
            }

            const title = cleanText(
              project?.title || "Recommended Project",
            );

            const description = cleanText(
              project?.description || "",
            );

            const difficulty = cleanText(
              project?.difficulty || "",
            );

            let text = title;

            if (difficulty) {
              text += ` (${difficulty})`;
            }

            if (description) {
              text += `\n${description}`;
            }

            return [text];
          }),
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 4,
            overflow: "linebreak",
          },
          headStyles: {
            fontStyle: "bold",
          },
        });
      }

      // --------------------------------------------------
      // OVERALL FEEDBACK
      // --------------------------------------------------

      if (result.overall_feedback) {
        autoTable(doc, {
          startY: getNextY(),
          head: [["Overall Feedback"]],
          body: [[cleanText(result.overall_feedback)]],
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 4,
            overflow: "linebreak",
          },
          headStyles: {
            fontStyle: "bold",
          },
        });
      }

      // --------------------------------------------------
      // FOOTER ON EVERY PAGE
      // --------------------------------------------------

      const pageCount = doc.getNumberOfPages();

      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        doc.text(
          `AI Resume Matcher | Page ${page} of ${pageCount}`,
          14,
          290,
        );
      }

      // --------------------------------------------------
      // DOWNLOAD
      // --------------------------------------------------

      const safeResumeName = cleanText(
        resumeName || "Resume",
      )
        .replace(/\.pdf$/i, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      doc.save(`${safeResumeName}_ATS_Report.pdf`);
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

      {exporting
        ? "Generating PDF..."
        : "Export Report as PDF"}
    </button>
  );
}