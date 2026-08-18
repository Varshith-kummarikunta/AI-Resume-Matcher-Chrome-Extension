import { useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  Clipboard,
  GraduationCap,
  KeyRound,
  Lightbulb,
  ScrollText,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

export default function OptimizedResumeCard({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const skills = Array.isArray(result.skills) ? result.skills : [];
  const experience = Array.isArray(result.experience)
    ? result.experience
    : [];
  const projects = Array.isArray(result.projects) ? result.projects : [];
  const education = Array.isArray(result.education) ? result.education : [];
  const certifications = Array.isArray(result.certifications)
    ? result.certifications
    : [];
  const keywordsUsed = Array.isArray(result.ats_keywords_used)
    ? result.ats_keywords_used
    : [];
  const keywordsNotUsed = Array.isArray(result.keywords_not_used)
    ? result.keywords_not_used
    : [];
  const notes = Array.isArray(result.optimization_notes)
    ? result.optimization_notes
    : [];

  function buildResumeText() {
    let text = "";

    text += `${result.target_job_title || "Optimized Resume"}\n\n`;

    if (result.professional_summary) {
      text += `PROFESSIONAL SUMMARY\n${result.professional_summary}\n\n`;
    }

    if (skills.length) {
      text += `SKILLS\n${skills.join(", ")}\n\n`;
    }

    if (experience.length) {
      text += `EXPERIENCE\n`;
      experience.forEach((item) => {
        text += `${item.job_title || ""} — ${item.company || ""}\n`;
        if (item.dates) text += `${item.dates}\n`;
        (item.bullets || []).forEach((bullet) => {
          text += `• ${bullet}\n`;
        });
        text += "\n";
      });
    }

    if (projects.length) {
      text += `PROJECTS\n`;
      projects.forEach((project) => {
        text += `${project.name || ""}\n`;
        if (project.technologies) {
          text += `Technologies: ${project.technologies}\n`;
        }
        (project.bullets || []).forEach((bullet) => {
          text += `• ${bullet}\n`;
        });
        text += "\n";
      });
    }

    if (education.length) {
      text += `EDUCATION\n`;
      education.forEach((item) => {
        text += `${item.degree || ""} — ${item.institution || ""}\n`;
        if (item.dates) text += `${item.dates}\n`;
      });
      text += "\n";
    }

    if (certifications.length) {
      text += `CERTIFICATIONS\n`;
      certifications.forEach((item) => {
        text += `• ${item}\n`;
      });
    }

    return text.trim();
  }

  async function copyResume() {
    try {
      await navigator.clipboard.writeText(buildResumeText());
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  return (
    <div className="mt-5 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h2 className="font-bold text-lg">Optimized Resume</h2>
        </div>

        <p className="mt-2 text-indigo-100 text-sm">
          Tailored for the selected job description
        </p>

        <div className="mt-4 rounded-xl bg-white/10 border border-white/20 p-3">
          <p className="text-xs text-indigo-100">Target Position</p>
          <p className="font-semibold mt-1">
            {result.target_job_title || "Target Role"}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Summary */}
        {result.professional_summary && (
          <section>
            <SectionTitle
              icon={<UserRound size={16} />}
              title="Professional Summary"
            />

            <p className="text-sm leading-6 text-slate-600">
              {result.professional_summary}
            </p>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <SectionTitle icon={<Wrench size={16} />} title="Skills" />

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <SectionTitle
              icon={<BriefcaseBusiness size={16} />}
              title="Experience"
            />

            <div className="space-y-4">
              {experience.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <h3 className="font-semibold text-slate-800">
                    {item.job_title || "Experience"}
                  </h3>

                  {item.company && (
                    <p className="text-sm text-indigo-600 mt-0.5">
                      {item.company}
                    </p>
                  )}

                  {item.dates && (
                    <p className="text-xs text-slate-400 mt-1">
                      {item.dates}
                    </p>
                  )}

                  <ul className="mt-3 space-y-2">
                    {(item.bullets || []).map((bullet, bulletIndex) => (
                      <li
                        key={bulletIndex}
                        className="flex gap-2 text-sm text-slate-600 leading-5"
                      >
                        <span className="text-indigo-500 mt-1">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <SectionTitle
              icon={<Sparkles size={16} />}
              title="Projects"
            />

            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <h3 className="font-semibold text-slate-800">
                    {project.name || "Project"}
                  </h3>

                  {project.technologies && (
                    <p className="mt-1 text-xs text-indigo-600">
                      {project.technologies}
                    </p>
                  )}

                  <ul className="mt-3 space-y-2">
                    {(project.bullets || []).map((bullet, bulletIndex) => (
                      <li
                        key={bulletIndex}
                        className="flex gap-2 text-sm text-slate-600 leading-5"
                      >
                        <span className="text-indigo-500 mt-1">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <SectionTitle
              icon={<GraduationCap size={16} />}
              title="Education"
            />

            <div className="space-y-3">
              {education.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-slate-50 p-3"
                >
                  <p className="font-semibold text-slate-800 text-sm">
                    {item.degree}
                  </p>

                  <p className="text-sm text-slate-600 mt-1">
                    {item.institution}
                  </p>

                  {item.dates && (
                    <p className="text-xs text-slate-400 mt-1">
                      {item.dates}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <SectionTitle
              icon={<ScrollText size={16} />}
              title="Certifications"
            />

            <div className="space-y-2">
              {certifications.map((certification, index) => (
                <div
                  key={index}
                  className="flex gap-2 text-sm text-slate-600"
                >
                  <Check
                    size={16}
                    className="text-emerald-500 mt-0.5 shrink-0"
                  />
                  <span>{certification}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ATS Keywords */}
        {(keywordsUsed.length > 0 || keywordsNotUsed.length > 0) && (
          <section>
            <SectionTitle
              icon={<KeyRound size={16} />}
              title="ATS Keywords"
            />

            {keywordsUsed.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-600 mb-2">
                  Supported & Used
                </p>

                <div className="flex flex-wrap gap-2">
                  {keywordsUsed.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs"
                    >
                      ✓ {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {keywordsNotUsed.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-amber-600 mb-2">
                  Not Claimed
                </p>

                <div className="flex flex-wrap gap-2">
                  {keywordsNotUsed.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs"
                    >
                      <X size={11} className="inline mr-1" />
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Optimization Notes */}
        {notes.length > 0 && (
          <section>
            <SectionTitle
              icon={<Lightbulb size={16} />}
              title="Optimization Notes"
            />

            <div className="space-y-2">
              {notes.map((note, index) => (
                <div
                  key={index}
                  className="flex gap-2 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800"
                >
                  <Lightbulb
                    size={15}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Copy */}
        <button
          onClick={copyResume}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 transition"
        >
          {copied ? (
            <>
              <Check size={17} />
              Resume Copied
            </>
          ) : (
            <>
              <Clipboard size={17} />
              Copy Optimized Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="text-indigo-600">{icon}</div>
      <h2 className="font-semibold text-slate-800">{title}</h2>
    </div>
  );
}