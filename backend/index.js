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

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Resume Matcher Backend",
    version: "2.0",
  });
});

app.post("/send", async (req, res) => {
  console.log("Request received");
  console.log(req.body);
  try {
    let { jd, base64 } = req.body;

    if (!jd || !base64) {
      return res.status(400).json({
        error: "Job description and resume are required.",
      });
    }

    const parts = base64.split(",");

    if (parts.length < 2) {
      return res.status(400).json({
        error: "Invalid resume format.",
      });
    }

    base64 = parts[1];

    const buffer = Buffer.from(base64, "base64");

    const parser = new PDFParse({ data: buffer });

    const textFromPdf = await parser.getText();

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
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
  "recommended_projects": [
  {
    "title": "",
    "description": "",
    "difficulty": ""
  }
],
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
- Recommend exactly 3 portfolio projects.
- Each project should help the candidate become a stronger match for the job.
- Difficulty must be one of:
  Beginner
  Intermediate
  Advanced
- Description should be 1–2 sentences explaining why the project is valuable.
Return ONLY valid JSON.
`,
        },
      ],
      temperature: 0.2,
    });

    const aiResponse = completion.choices[0].message.content;

    console.log("========== AI RESPONSE ==========");
    console.log(aiResponse);
    console.log("=================================");

    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Invalid AI JSON");
      console.log(cleaned);

      return res.status(500).json({
        error: "AI returned invalid JSON",
      });
    }

    parsed.skills_match ??= 0;
    parsed.experience_match ??= 0;
    parsed.education_match ??= 0;

    parsed.strengths ??= [];
    parsed.weaknesses ??= [];

    parsed.recommended_projects ??= [];
    parsed.recommended_certifications ??= [];

    parsed.suggestions ??= {
      improve: "",
      skills: "",
      career: "",
    };

    parsed.interview_probability ??= "Medium";
    parsed.match_level ??= "Average";

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

//////////new///////////

app.post("/optimize-resume", async (req, res) => {
  console.log("Resume optimization request received");

  try {
    let { jd, base64 } = req.body;

    if (!jd || !base64) {
      return res.status(400).json({
        error: "Job description and resume are required.",
      });
    }

    const parts = base64.split(",");

    if (parts.length < 2) {
      return res.status(400).json({
        error: "Invalid resume format.",
      });
    }

    base64 = parts[1];

    const buffer = Buffer.from(base64, "base64");

    const parser = new PDFParse({ data: buffer });

    const textFromPdf = await parser.getText();

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `
You are an expert resume writer, ATS optimization specialist,
technical recruiter, and career coach.

Your task is to create a job-targeted resume from an existing resume
and a specific job description.

CRITICAL RULES:

1. NEVER invent experience.
2. NEVER invent employment history.
3. NEVER invent education.
4. NEVER invent certifications.
5. NEVER invent projects.
6. NEVER invent technologies the candidate has not demonstrated.
7. NEVER invent job titles, companies, dates, achievements, metrics,
   responsibilities, or qualifications.
8. You may rewrite existing information professionally.
9. You may improve bullet points using information already present.
10. You may reorder existing skills according to the job description.
11. You may prioritize relevant projects and experience.
12. You may naturally incorporate job-description keywords ONLY when
    the existing resume supports that skill or concept.
13. Do not keyword stuff.
14. Keep the resume ATS-friendly.
15. Use clear professional language.
16. Preserve factual accuracy above everything else.

Return ONLY valid JSON.
Do not use markdown.
Do not use backticks.
Do not explain anything outside JSON.
`,
        },

        {
          role: "user",
          content: `
Create an ATS-optimized version of the candidate's resume for the
following job description.

==========================
CURRENT RESUME
==========================

${textFromPdf.text}

==========================
JOB DESCRIPTION
==========================

${jd}

==========================
OUTPUT
==========================

Return ONLY this JSON structure:

{
  "target_job_title": "",
  "professional_summary": "",
  "skills": [],
  "experience": [
    {
      "company": "",
      "job_title": "",
      "dates": "",
      "bullets": []
    }
  ],
  "projects": [
    {
      "name": "",
      "technologies": "",
      "bullets": []
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "dates": ""
    }
  ],
  "certifications": [],
  "ats_keywords_used": [],
  "keywords_not_used": [],
  "optimization_notes": []
}

Rules for the output:

- target_job_title should match the role being applied for.
- professional_summary should be 3-4 concise sentences.
- skills should contain only skills supported by the existing resume.
- experience must contain only experience present in the original resume.
- projects must contain only projects present in the original resume.
- education must contain only education present in the original resume.
- certifications must contain only certifications present in the original resume.
- Rewrite bullets to emphasize relevance to the job description.
- Use strong action verbs.
- Include measurable results only when they already exist in the resume.
- Do not create fake numbers.
- ats_keywords_used should contain job-description keywords that are
  genuinely supported by the resume and naturally incorporated.
- keywords_not_used should contain important job-description keywords
  that cannot honestly be claimed from the resume.
- optimization_notes should explain the major changes made.
- Keep the resume concise and suitable for a professional one-to-two-page resume.
- Return ONLY valid JSON.
`,
        },
      ],

      temperature: 0.15,
    });

    const aiResponse = completion.choices[0].message.content;

    console.log("========== OPTIMIZED RESUME RESPONSE ==========");
    console.log(aiResponse);
    console.log("===============================================");

    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Invalid optimized resume JSON");
      console.log(cleaned);

      return res.status(500).json({
        error: "AI returned invalid JSON",
      });
    }

    parsed.target_job_title ??= "";
    parsed.professional_summary ??= "";
    parsed.skills ??= [];
    parsed.experience ??= [];
    parsed.projects ??= [];
    parsed.education ??= [];
    parsed.certifications ??= [];
    parsed.ats_keywords_used ??= [];
    parsed.keywords_not_used ??= [];
    parsed.optimization_notes ??= [];

    return res.status(200).json({
      message: "Resume optimized successfully",
      response: parsed,
    });
  } catch (err) {
    console.error("Resume Optimization Error:", err);

    return res.status(500).json({
      error: err.message || "Resume optimization failed.",
    });
  }
});