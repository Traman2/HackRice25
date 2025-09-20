import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type QuizPayload = {
  uid: string;
  programmingExperienceLevel: string;
  programmingLanguages: string[];
  programmingLanguagesOther?: string;
  learningContextAndGoals: string;
  learningContextAndGoalsOther?: string;
  primaryLearningGoal: string;
  learningStyleAssessment: string;
  stuckOnProblem: string;
  timeCommitment: string;
  preferredSessionLength: string;
  developmentEnvironmentExperience: string;
  installingSoftwareComfort: string;
  terminalComfort: string;
  managingFilesComfort: string;
  learningDifficulty: string[];
  learningDifficultyOther?: string;
  frustrationHandling: string;
};

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }>
  = ({ title, subtitle, children }) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
};

const RadioList: React.FC<{ name: string; options: string[]; value: string; onChange: (v: string) => void }>
  = ({ name, options, value, onChange }) => (
  <div className="space-y-2">
    {options.map((opt) => (
      <label key={opt} className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50">
        <input
          type="radio"
          name={name}
          className="h-4 w-4"
          checked={value === opt}
          onChange={() => onChange(opt)}
        />
        <span className="text-sm text-zinc-800">{opt}</span>
      </label>
    ))}
  </div>
);

const CheckboxList: React.FC<{ options: string[]; values: string[]; onChange: (v: string[]) => void }>
  = ({ options, values, onChange }) => {
  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={values.includes(opt)}
            onChange={() => toggle(opt)}
          />
          <span className="text-sm text-zinc-800">{opt}</span>
        </label>
      ))}
    </div>
  );
};

export default function QuizForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const uid = user?.sub ?? "";

  const [loadingExisting, setLoadingExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults = useMemo<QuizPayload>(() => ({
    uid,
    programmingExperienceLevel: "",
    programmingLanguages: [],
    learningContextAndGoals: "",
    primaryLearningGoal: "",
    learningStyleAssessment: "",
    stuckOnProblem: "",
    timeCommitment: "",
    preferredSessionLength: "",
    developmentEnvironmentExperience: "",
    installingSoftwareComfort: "",
    terminalComfort: "",
    managingFilesComfort: "",
    learningDifficulty: [],
    frustrationHandling: "",
  }), [uid]);

  const [form, setForm] = useState<QuizPayload>(defaults);

  // Load existing if present
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!uid) { setLoadingExisting(false); return; }
      try {
        const res = await axios.get(`http://localhost:3001/api/quiz/${uid}`);
        if (!isMounted) return;
        setForm({ ...defaults, ...res.data });
      } catch (_err) {
        // Not found is fine
      } finally {
        if (isMounted) setLoadingExisting(false);
      }
    };
    run();
    return () => { isMounted = false; };
  }, [uid, defaults]);

  const update = (patch: Partial<QuizPayload>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!uid) return;
    setSubmitting(true);
    setError(null);
    try {
      await axios.post("http://localhost:3001/api/quiz", { ...form, uid });
      navigate("/dashboard");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  // Option sets mirror your backend enums
  const experienceOpts = ['Complete beginner (never written code)', 'Some exposure (tutorials, bootcamp, courses)', 'Intermediate (can build basic projects independently)', 'Advanced (professional experience or complex projects)'];
  const languagesOpts = ['None', 'HTML/CSS only', 'JavaScript', 'Python', 'Java', 'C/C++'];
  const contextOpts = ['Web development (frontend)', 'Backend development', 'Full-stack development', 'Data science/analytics', 'Mobile app development', 'Game development', 'Other'];
  const goalOpts = ['Career change into tech', 'Skill enhancement for current job', 'Personal projects and hobbies', 'Academic requirements', 'Freelancing opportunities'];
  const styleOpts = ['Watch explanations first, then practice', 'Jump into coding immediately with minimal theory', 'Need lots of examples and repetition', 'Prefer reading documentation and references', 'Learn best through building real projects'];
  const stuckOpts = ['Try to figure it out independently for a long time', 'Look up solutions immediately', 'Ask for help after trying for a few minutes', 'Take breaks and come back with fresh perspective'];
  const timeOpts = ['1-3 hours (casual pace)', '4-8 hours (steady progress)', '9-15 hours (intensive learning)', '16+ hours (bootcamp pace)'];
  const sessionOpts = ['15-30 minutes (short bursts)', '30-60 minutes (standard sessions)', '1-2 hours (deep focus)', '2+ hours (marathon sessions)'];
  const envOpts = ['Never used a code editor', 'Basic text editors (Notepad, TextEdit)', 'Code editors (VS Code, Sublime Text)', 'IDEs (WebStorm, PyCharm, Eclipse)', 'Command line comfortable'];
  const comfortOpts = ['Very', 'Somewhat', 'Not at all'];
  const difficultyOpts = ['Setting up development environments', 'Understanding abstract concepts', 'Debugging errors and problems', 'Keeping up with fast-paced tutorials', 'Remembering syntax and commands', 'Not applicable (new to programming)'];
  const frustrationOpts = ['Take breaks and return later', 'Systematically debug step by step', 'Seek help from others immediately', 'Get discouraged and stop', 'Power through until it works'];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Insert a Simple Poll</h1>
        <p className="mt-1 text-sm text-zinc-600">Answer a few questions so we can personalize your path.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-2">
          {[
            "Question & answers",
            "Choose template",
            "Poll placement",
            "Schedule",
            "Advanced settings",
            "Integration",
            "Share or embed poll",
          ].map((item, idx) => (
            <div key={item} className={`rounded-xl border px-4 py-3 text-sm ${idx === 0 ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-800"}`}>
              {item}
            </div>
          ))}
          <div className="text-xs text-zinc-500">Step 1 of 7</div>
        </aside>

        {/* Main form */}
        <div className="space-y-6">
          <Section title="Question & answers">
            <div>
              <label className="text-sm font-medium text-zinc-800">Ask a question</label>
              <input disabled value="Tell us about your experience" className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600" />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm">Select list</button>
              <button type="button" className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm">Emojis</button>
              <button type="button" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm">Numerical</button>
            </div>

            {/* Experience Level */}
            <div>
              <p className="text-sm font-medium text-zinc-800">Programming Experience Level</p>
              <RadioList name="experience" options={experienceOpts} value={form.programmingExperienceLevel}
                onChange={(v) => update({ programmingExperienceLevel: v })} />
            </div>

            {/* Languages */}
            <div>
              <p className="text-sm font-medium text-zinc-800">Languages you have used</p>
              <CheckboxList options={languagesOpts}
                values={form.programmingLanguages}
                onChange={(v) => update({ programmingLanguages: v })}
              />
              <input
                placeholder="Other"
                className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={form.programmingLanguagesOther || ""}
                onChange={(e) => update({ programmingLanguagesOther: e.target.value })}
              />
            </div>
          </Section>

          <Section title="Learning Context and Goals">
            <RadioList name="context" options={contextOpts} value={form.learningContextAndGoals}
              onChange={(v) => update({ learningContextAndGoals: v })} />
            {form.learningContextAndGoals === 'Other' && (
              <input
                placeholder="Describe your focus"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={form.learningContextAndGoalsOther || ""}
                onChange={(e) => update({ learningContextAndGoalsOther: e.target.value })}
              />
            )}
            <div>
              <p className="text-sm font-medium text-zinc-800">Primary learning goal</p>
              <RadioList name="goal" options={goalOpts} value={form.primaryLearningGoal}
                onChange={(v) => update({ primaryLearningGoal: v })} />
            </div>
          </Section>

          <Section title="Learning Style Assessment">
            <RadioList name="style" options={styleOpts} value={form.learningStyleAssessment}
              onChange={(v) => update({ learningStyleAssessment: v })} />
            <div>
              <p className="text-sm font-medium text-zinc-800">When stuck on a problem</p>
              <RadioList name="stuck" options={stuckOpts} value={form.stuckOnProblem}
                onChange={(v) => update({ stuckOnProblem: v })} />
            </div>
          </Section>

          <Section title="Time and Commitment">
            <div>
              <p className="text-sm font-medium text-zinc-800">Weekly time commitment</p>
              <RadioList name="time" options={timeOpts} value={form.timeCommitment}
                onChange={(v) => update({ timeCommitment: v })} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">Preferred session length</p>
              <RadioList name="session" options={sessionOpts} value={form.preferredSessionLength}
                onChange={(v) => update({ preferredSessionLength: v })} />
            </div>
          </Section>

          <Section title="Technical Environment">
            <div>
              <p className="text-sm font-medium text-zinc-800">Development environment experience</p>
              <RadioList name="env" options={envOpts} value={form.developmentEnvironmentExperience}
                onChange={(v) => update({ developmentEnvironmentExperience: v })} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-zinc-800">Installing software</p>
                <RadioList name="install" options={comfortOpts} value={form.installingSoftwareComfort}
                  onChange={(v) => update({ installingSoftwareComfort: v })} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800">Terminal/command line</p>
                <RadioList name="terminal" options={comfortOpts} value={form.terminalComfort}
                  onChange={(v) => update({ terminalComfort: v })} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800">Managing files and folders</p>
                <RadioList name="files" options={comfortOpts} value={form.managingFilesComfort}
                  onChange={(v) => update({ managingFilesComfort: v })} />
              </div>
            </div>
          </Section>

          <Section title="Learning Challenges">
            <CheckboxList options={difficultyOpts} values={form.learningDifficulty}
              onChange={(v) => update({ learningDifficulty: v })}
            />
            <input
              placeholder="Other challenges"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={form.learningDifficultyOther || ""}
              onChange={(e) => update({ learningDifficultyOther: e.target.value })}
            />
          </Section>

          <Section title="Frustration Handling">
            <RadioList name="frustration" options={frustrationOpts} value={form.frustrationHandling}
              onChange={(v) => update({ frustrationHandling: v })} />
          </Section>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => navigate(-1)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">Cancel</button>
            <button disabled={submitting || loadingExisting || !uid}
              onClick={submit}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {submitting ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


