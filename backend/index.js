require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PDFParse } = require("pdf-parse");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: "10MB" }));
app.use(cors());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.listen(PORT, () => console.log("Server running at", PORT));

app.post("/send", async (req, res) => {
  console.log("Request received");
  console.log(req.body);
  try {
    let { jd, base64 } = req.body;

    base64 = base64.split(",")[1];

    const buffer = Buffer.from(base64, "base64");

    const parser = new PDFParse({ data: buffer });

    const textFromPdf = await parser.getText();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are an expert ATS Resume Analyzer, Career Coach and Senior Technical Recruiter.

Your job is to compare a resume against a job description.

Always return ONLY valid JSON.

Do not use markdown.
Do not use backticks.
Do not explain anything outside JSON.
`,
        },
        {
          role: "user",
          content: `
Compare the following Resume and Job Description.

==========================
RESUME
==========================

${textFromPdf.text}

==========================
JOB DESCRIPTION
==========================

${jd}

Evaluate the resume like an ATS used by top technology companies.

Return ONLY this JSON:

{
  "score": 0,
  "match_level": "",
  "reason": "",
  "matched_keywords": [],
  "missing_keywords": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": {
    "improve": "",
    "skills": "",
    "career": ""
  },
  "interview_probability": "",
  "recommended_projects": [],
  "recommended_certifications": [],
  "experience_match": 0,
  "skills_match": 0,
  "education_match": 0,
  "overall_feedback": ""
}

Rules:

- score must be between 0 and 100
- experience_match between 0 and 100
- skills_match between 0 and 100
- education_match between 0 and 100
- match_level must be one of:
  "Excellent"
  "Good"
  "Average"
  "Poor"

- interview_probability must be one of:
  "Very High"
  "High"
  "Medium"
  "Low"

- strengths should contain 3-5 points.

- weaknesses should contain 3-5 points.

- suggestions.improve should explain how to improve ATS score.

- suggestions.skills should recommend missing technologies.

- suggestions.career should give career advice.

- recommended_projects should suggest 3 portfolio projects.

- recommended_certifications should recommend 3 certifications.

Return ONLY valid JSON.
`,
        },
      ],
      temperature: 0.2,
    });

    const aiResponse = completion.choices[0].message.content;

    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("Invalid AI JSON");
      console.log(cleaned);

      return res.status(500).json({
        error: "AI returned invalid JSON",
      });
    }

    res.status(200).json({
      message: "Working Good",
      response: parsed,
    });
  } catch (err) {
    console.error("Backend Error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});
