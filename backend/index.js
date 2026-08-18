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

    // -----------------------------------------
    // EXTRACT BASE64 FROM DATA URL
    // -----------------------------------------

    const parts = base64.split(",");

    if (parts.length < 2) {
      return res.status(400).json({
        error: "Invalid resume format.",
      });
    }

    base64 = parts[1];

    // -----------------------------------------
    // CONVERT PDF TO BUFFER
    // -----------------------------------------

    const buffer = Buffer.from(base64, "base64");

    // -----------------------------------------
    // EXTRACT RESUME TEXT
    // -----------------------------------------

    const parser = new PDFParse({
      data: buffer,
    });

    const textFromPdf = await parser.getText();

    if (!textFromPdf?.text?.trim()) {
      return res.status(400).json({
        error: "Could not extract text from the resume PDF.",
      });
    }

    console.log("Resume text extracted successfully.");

    // -----------------------------------------
    // AI OPTIMIZATION
    // -----------------------------------------

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",

          content: `
You are an expert ATS resume writer, technical recruiter,
career coach, and resume optimization specialist.

Your task is to rewrite an existing resume so it is better aligned
with a specific job description.

The candidate's factual information is the highest priority.

STRICT FACTUAL ACCURACY RULES:

1. NEVER invent work experience.

2. NEVER invent an employer or company.

3. NEVER invent a job title.

4. NEVER invent employment dates.

5. NEVER invent education.

6. NEVER invent a degree.

7. NEVER invent certifications.

8. NEVER invent projects.

9. NEVER invent technologies.

10. NEVER invent programming languages.

11. NEVER invent tools, frameworks, libraries, databases,
cloud platforms, or AI technologies.

12. NEVER invent achievements.

13. NEVER invent responsibilities.

14. NEVER invent metrics, percentages, numbers, revenue,
performance improvements, users, or other measurable results.

15. NEVER claim that the candidate has a skill merely because
that skill appears in the job description.

16. A job-description keyword may only be used when the existing
resume clearly demonstrates that skill, technology, concept,
responsibility, or experience.

17. If a job requirement is not supported by the resume,
place it in keywords_not_used instead of adding it to the resume.

18. You may rewrite existing information using stronger,
professional language.

19. You may reorder existing skills based on job relevance.

20. You may prioritize the candidate's most relevant existing
projects and experience.

21. You may improve existing bullet points without changing
their factual meaning.

22. Do not keyword stuff.

23. Keep the resume ATS-friendly.

24. Keep the writing concise and professional.

25. Preserve the candidate's actual background exactly.

IMPORTANT:

The optimized resume must remain completely truthful even if that
produces a lower match with the job description.

Do not try to make the candidate appear more qualified than
the original resume supports.

FACTUAL DATE AND EDUCATION RULES:

1. Treat dates in the existing resume as authoritative.

2. If an education program has an end date in the past, do NOT describe
   the candidate as currently pursuing that education.

3. If the resume shows a completed degree with a past graduation date,
   describe it as completed or as a graduate.

4. Never use phrases such as:
   "currently pursuing",
   "currently studying",
   "expected to graduate",
   "final-year student",
   or similar wording when the existing resume shows that the
   education has already been completed.

5. Never change, extend, shorten, or reinterpret education dates.

6. Never change employment dates, project dates, certification dates,
   or other factual dates from the original resume.

7. Never infer current status from the job description.

8. The existing resume always takes priority over the job description
   when determining the candidate's education status, experience,
   skills, projects, certifications, and dates.

FINAL FACTUAL CHECK:

Before returning the JSON, perform a final factual audit against
the EXISTING RESUME.

Every piece of information in the optimized resume must be
traceable to the existing resume.

Verify all of the following:

- candidate's education
- education completion status
- education dates
- employment history
- employment status
- employment dates
- project names
- project ownership
- project technologies
- programming languages
- frameworks
- libraries
- databases
- cloud platforms
- certifications
- achievements
- responsibilities
- measurable results
- tools and technologies

SPECIAL EDUCATION RULE:

If the existing resume contains a completed degree with a past
graduation date, describe the candidate as a graduate.

Never describe a completed degree as:

- currently pursuing
- currently studying
- expected to graduate
- final-year student
- ongoing degree
- or any equivalent wording.

SPECIAL SKILL RULE:

A technology, tool, framework, library, database, cloud platform,
programming language, methodology, or soft skill may appear in the
optimized resume only when the existing resume provides evidence
for it.

The job description must NEVER be treated as evidence that the
candidate possesses a skill.

SPECIAL PROJECT RULE:

Do not create additional project bullets merely to satisfy the job
description.

Every rewritten project bullet must preserve the factual meaning
of the original project.

Do not convert a general project statement into an unsupported
claim about testing, debugging, performance optimization,
teamwork, collaboration, code reviews, or production scale.

SPECIAL METRIC RULE:

Never add:

- percentages
- numbers
- user counts
- performance improvements
- revenue
- rankings
- response times
- traffic
- business impact
- or other measurable achievements

unless the exact information exists in the original resume.

FINAL DECISION:

Truthfulness has higher priority than ATS keyword coverage.

If including a job-description keyword would require inventing,
assuming, exaggerating, or inferring experience, do NOT include it.

Place that keyword in keywords_not_used instead.

Before returning the JSON, silently remove any unsupported claim
you detect.

Return ONLY valid JSON.

Do not use markdown.

Do not use code fences.

Do not write explanations outside the JSON object.
`,
        },

        {
          role: "user",

          content: `
Create an ATS-optimized version of the candidate's existing resume
for the provided job description.

==============================
EXISTING RESUME
==============================

${textFromPdf.text}

==============================
JOB DESCRIPTION
==============================

${jd}

==============================
REQUIRED OUTPUT
==============================

Return exactly this JSON structure:

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

OUTPUT RULES:

- target_job_title should identify the role from the job description.

- professional_summary should contain 3-4 concise sentences.

- The summary must describe the candidate's actual current status
based only on the existing resume.

- If the candidate has already graduated, explicitly use
"graduate" or equivalent completed-degree wording rather than
"currently pursuing".

- The professional summary must only describe experience,
skills, education, and projects supported by the existing resume.

- skills must contain ONLY skills already demonstrated in the resume.

- Do not add skills simply because they appear in the job description.

- experience must contain ONLY experience found in the existing resume.

- Do not create new companies, positions, dates, or responsibilities.

- projects must contain ONLY projects found in the existing resume.

- Do not create new projects.

- education must contain ONLY education found in the existing resume.

- certifications must contain ONLY certifications found in the existing resume.

- Existing information may be rewritten for clarity and stronger
ATS relevance.

- Use strong action verbs when rewriting existing bullets.

- Preserve the original factual meaning.

- Do not create numbers or measurable achievements.

- Do not claim technologies that are not supported by the resume.

- ats_keywords_used must contain only job-description keywords
that are genuinely supported by the existing resume and
naturally included in the optimized resume.

- keywords_not_used must contain important job-description
keywords that cannot honestly be claimed from the resume.

- optimization_notes should briefly explain the major changes
made to improve ATS relevance.

- Do not include unsupported technologies in ats_keywords_used.

- Do not remove important factual information from the original
resume merely to make it shorter.

- Keep the optimized resume suitable for a professional
one-to-two-page resume.

- Return ONLY valid JSON.
`,
        },
      ],

      temperature: 0.1,
    });

    // -----------------------------------------
    // READ AI RESPONSE
    // -----------------------------------------

    const aiResponse =
      completion?.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return res.status(500).json({
        error: "AI returned an empty optimization response.",
      });
    }

    console.log(
      "========== OPTIMIZED RESUME RESPONSE ==========",
    );

    console.log(aiResponse);

    console.log(
      "===============================================",
    );

    // -----------------------------------------
    // CLEAN JSON RESPONSE
    // -----------------------------------------

    const cleaned = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      console.error(
        "Invalid optimized resume JSON:",
        error,
      );

      console.log("Cleaned AI response:");
      console.log(cleaned);

      return res.status(500).json({
        error: "AI returned invalid JSON.",
      });
    }

 // -----------------------------------------
// NORMALIZE RESPONSE
// -----------------------------------------

parsed.target_job_title =
  typeof parsed.target_job_title === "string"
    ? parsed.target_job_title.trim()
    : "";

parsed.professional_summary =
  typeof parsed.professional_summary === "string"
    ? parsed.professional_summary.trim()
    : "";

parsed.skills = Array.isArray(parsed.skills)
  ? parsed.skills.filter(
      (skill) => typeof skill === "string" && skill.trim(),
    )
  : [];

parsed.experience = Array.isArray(parsed.experience)
  ? parsed.experience
  : [];

parsed.projects = Array.isArray(parsed.projects)
  ? parsed.projects
  : [];

parsed.education = Array.isArray(parsed.education)
  ? parsed.education
  : [];

parsed.certifications = Array.isArray(
  parsed.certifications,
)
  ? parsed.certifications.filter(
      (item) => typeof item === "string" && item.trim(),
    )
  : [];

parsed.ats_keywords_used = Array.isArray(
  parsed.ats_keywords_used,
)
  ? parsed.ats_keywords_used.filter(
      (keyword) =>
        typeof keyword === "string" && keyword.trim(),
    )
  : [];

parsed.keywords_not_used = Array.isArray(
  parsed.keywords_not_used,
)
  ? parsed.keywords_not_used.filter(
      (keyword) =>
        typeof keyword === "string" && keyword.trim(),
    )
  : [];

parsed.optimization_notes = Array.isArray(
  parsed.optimization_notes,
)
  ? parsed.optimization_notes.filter(
      (note) =>
        typeof note === "string" && note.trim(),
    )
  : [];

// -----------------------------------------
// VERIFY ATS KEYWORDS AGAINST RESUME
// -----------------------------------------

const resumeTextLower =
  textFromPdf.text.toLowerCase();

const keywordAliases = {
  "mern stack": ["mern"],
  "react.js": ["react", "react.js"],
  "node.js": ["node", "node.js"],
  "express.js": ["express", "express.js"],
  "mongodb": ["mongodb"],
  "rest apis": ["rest api", "rest apis", "restful api", "restful apis"],
  "javascript": ["javascript"],
  "html": ["html", "html5"],
  "css": ["css", "css3"],
  "git": ["git"],
  "github": ["github"],
  "responsive design": ["responsive", "responsive design"],
  "jwt authentication": ["jwt"],
  "socket.io": ["socket.io"],
  "websockets": ["websocket", "websockets"],
  "cloud deployment": [
    "railway",
    "render",
    "vercel",
    "cloud deployment",
    "deployed",
  ],
};

const verifiedKeywords = [];
const rejectedKeywords = [];

for (const keyword of parsed.ats_keywords_used) {
  const normalizedKeyword = keyword
    .toLowerCase()
    .trim();

  const aliases = keywordAliases[normalizedKeyword];

  const isSupported = aliases
    ? aliases.some((alias) =>
        resumeTextLower.includes(alias),
      )
    : resumeTextLower.includes(normalizedKeyword);

  if (isSupported) {
    verifiedKeywords.push(keyword);
  } else {
    rejectedKeywords.push(keyword);
  }
}

parsed.ats_keywords_used = [
  ...new Set(verifiedKeywords),
];

parsed.keywords_not_used = [
  ...new Set([
    ...parsed.keywords_not_used,
    ...rejectedKeywords,
  ]),
];
    // -----------------------------------------
    // SEND OPTIMIZED RESUME
    // -----------------------------------------

    return res.status(200).json({
      message: "Resume optimized successfully",
      response: parsed,
    });
  } catch (err) {
    console.error(
      "Resume Optimization Error:",
      err,
    );

    return res.status(500).json({
      error:
        err.message ||
        "Resume optimization failed.",
    });
  }
});