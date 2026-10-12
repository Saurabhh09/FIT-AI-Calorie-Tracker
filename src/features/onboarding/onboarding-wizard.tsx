"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { isAdultAgeBand, type AgeBand } from "./rules";

type Goal = "lose_weight" | "maintain" | "gain_weight" | "improve_energy" | "habit_consistency" | "sports_performance";
type ReferenceGroup = "female" | "male" | "skip";
type CountryChoice = "IN" | "US" | "GB" | "CA" | "AU" | "other";

const STEPS = ["Goal", "Age range", "Country", "Reference group", "Review"] as const;

const goals: { value: Goal; title: string; description: string }[] = [
  { value: "lose_weight", title: "Work toward weight loss", description: "A personal goal—not a promise or medical prescription." },
  { value: "maintain", title: "Maintain my current weight", description: "Build a steady, flexible routine." },
  { value: "gain_weight", title: "Support weight gain", description: "Focus on nourishing meals and practical habits." },
  { value: "improve_energy", title: "Feel more energized", description: "Explore meal patterns that fit your day." },
  { value: "habit_consistency", title: "Build consistency", description: "Create small, repeatable nutrition habits." },
  { value: "sports_performance", title: "Support my training", description: "Organize food around activity and recovery." }
];

const ages: { value: AgeBand; title: string; description: string }[] = [
  { value: "under_13", title: "Under 13", description: "Age-appropriate safeguards apply." },
  { value: "13_17", title: "13–17", description: "No restrictive weight-loss plans or adult targets." },
  { value: "18_29", title: "18–29", description: "Adult reference range." },
  { value: "30_49", title: "30–49", description: "Adult reference range." },
  { value: "50_69", title: "50–69", description: "Adult reference range." },
  { value: "70_plus", title: "70 or older", description: "Adult reference range." },
  { value: "prefer_not_to_say", title: "Prefer not to say", description: "Some personalized comparisons may be unavailable." }
];

const countries: { value: CountryChoice; title: string; description: string }[] = [
  { value: "IN", title: "India", description: "Use local context when available." },
  { value: "US", title: "United States", description: "USDA-first food-data coverage." },
  { value: "GB", title: "United Kingdom", description: "Use local context when available." },
  { value: "CA", title: "Canada", description: "Use local context when available." },
  { value: "AU", title: "Australia", description: "Use local context when available." },
  { value: "other", title: "Other / not now", description: "You can update this later." }
];

function SelectionCard({ title, description, selected, onClick }: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`option-card${selected ? " selected" : ""}`} aria-pressed={selected} onClick={onClick}>
      <span className="option-copy">
        <span className="option-title">{title}</span>
        <span className="option-desc">{description}</span>
      </span>
      <span className="option-check" aria-hidden="true">{selected ? "✓" : ""}</span>
    </button>
  );
}

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [country, setCountry] = useState<CountryChoice | null>(null);
  const [referenceGroup, setReferenceGroup] = useState<ReferenceGroup | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const minorWeightLossBlocked = useMemo(
    () => goal === "lose_weight" && ageBand !== null && !isAdultAgeBand(ageBand),
    [ageBand, goal]
  );

  const canContinue = [goal !== null, ageBand !== null && !minorWeightLossBlocked, country !== null, referenceGroup !== null, true][step];

  function goBack() {
    setError("");
    if (step === 0) {
      router.replace("/");
      return;
    }
    setStep((current) => Math.max(0, current - 1));
  }

  async function saveOnboarding() {
    if (!goal || !ageBand || !country || !referenceGroup || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          goal,
          ageBand,
          sexForReference: referenceGroup === "skip" ? null : referenceGroup,
          countryCode: country === "other" ? null : country,
          displayName: initialName || null
        })
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Your answers could not be saved. Please try again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("The service couldn't be reached. Your answers were not saved.");
    } finally {
      setBusy(false);
    }
  }

  function continueStep() {
    if (!canContinue || busy) return;
    setError("");
    if (step < STEPS.length - 1) setStep((current) => current + 1);
    else void saveOnboarding();
  }

  return (
    <div className="flow-shell">
      <header className="flow-header">
        <button className="back-button" type="button" onClick={goBack} aria-label={step === 0 ? "Back to sign in" : "Previous step"}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="flow-progress-block" aria-live="polite">
          <div className="flow-progress-meta"><span>STEP {step + 1} OF {STEPS.length}</span><span>{STEPS[step]}</span></div>
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Onboarding progress">
            <div className="progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>
        <a className="flow-header-brand" href="/" aria-label="FITAI home">
          <span className="brand"><span className="brand-mark" aria-hidden="true">F</span><span>FITAI</span></span>
        </a>
      </header>

      <main className="flow-main" key={step}>
        {step === 0 && (
          <section aria-labelledby="onboarding-title">
            <p className="eyebrow">START WITH WHAT MATTERS TO YOU</p>
            <h1 id="onboarding-title">What’s your primary goal?</h1>
            <p className="flow-subtitle">Your goal shapes the kind of guidance we show. You can change it later.</p>
            <div className="question-content option-list">
              {goals.map((item) => <SelectionCard key={item.value} title={item.title} description={item.description} selected={goal === item.value} onClick={() => setGoal(item.value)} />)}
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="onboarding-title">
            <p className="eyebrow">A SAFER STARTING POINT</p>
            <h1 id="onboarding-title">Which age range are you in?</h1>
            <p className="flow-subtitle">Choose a range; FITAI does not need your full date of birth for this step.</p>
            <div className="question-content option-grid">
              {ages.map((item) => <SelectionCard key={item.value} title={item.title} description={item.description} selected={ageBand === item.value} onClick={() => setAgeBand(item.value)} />)}
            </div>
            {minorWeightLossBlocked && (
              <div className="setup-notice" role="alert" style={{ marginTop: 18 }}>
                FITAI won’t create restrictive weight-loss plans or apply adult nutrition targets to minors. Go back and choose a non-weight-loss goal to continue.
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="onboarding-title">
            <p className="eyebrow">LOCAL CONTEXT</p>
            <h1 id="onboarding-title">Where do you live?</h1>
            <p className="flow-subtitle">This helps us choose relevant reference guidance. Food search starts with USDA data and may have gaps outside the United States.</p>
            <div className="question-content option-list">
              {countries.map((item) => <SelectionCard key={item.value} title={item.title} description={item.description} selected={country === item.value} onClick={() => setCountry(item.value)} />)}
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="onboarding-title">
            <p className="eyebrow">OPTIONAL REFERENCE CONTEXT</p>
            <h1 id="onboarding-title">Which reference group fits you?</h1>
            <p className="flow-subtitle">Some published nutrient reference ranges differ by sex. This is optional, used only to select applicable references, and is not a medical assessment.</p>
            <div className="question-content option-list">
              <SelectionCard title="Female reference group" description="Use this group when it is appropriate for your nutrition reference." selected={referenceGroup === "female"} onClick={() => setReferenceGroup("female")} />
              <SelectionCard title="Male reference group" description="Use this group when it is appropriate for your nutrition reference." selected={referenceGroup === "male"} onClick={() => setReferenceGroup("male")} />
              <SelectionCard title="Prefer not to say" description="We’ll avoid comparisons that require this detail." selected={referenceGroup === "skip"} onClick={() => setReferenceGroup("skip")} />
            </div>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="onboarding-title">
            <p className="eyebrow">YOUR STARTING POINT</p>
            <h1 id="onboarding-title">Review your choices.</h1>
            <p className="flow-subtitle">Nothing here calculates a nutrition target yet. Your profile is saved only if the database confirms it.</p>
            <div className="question-content option-list">
              <SelectionCard title="Primary goal" description={goals.find((item) => item.value === goal)?.title ?? "Not selected"} selected onClick={() => setStep(0)} />
              <SelectionCard title="Age range" description={ages.find((item) => item.value === ageBand)?.title ?? "Not selected"} selected onClick={() => setStep(1)} />
              <SelectionCard title="Country" description={countries.find((item) => item.value === country)?.title ?? "Not selected"} selected onClick={() => setStep(2)} />
              <SelectionCard title="Reference group" description={referenceGroup === "skip" ? "Prefer not to say" : referenceGroup === "female" ? "Female reference group" : "Male reference group"} selected onClick={() => setStep(3)} />
            </div>
            {!isAdultAgeBand(ageBand) && (
              <div className="setup-notice" role="note" style={{ marginTop: 18 }}>
                Age safeguards apply. FITAI will not provide a restrictive weight-loss plan or adult nutrition targets for minors; age-specific reference data must be available before comparisons are shown.
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="flow-footer">
        <div className="flow-footer-inner">
          <div className="sr-only" aria-live="polite">{error}</div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn" type="button" onClick={continueStep} disabled={!canContinue || busy}>
            {busy ? "Saving securely…" : step === STEPS.length - 1 ? "Save my choices" : "Continue"}
            {!busy && <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </button>
        </div>
      </footer>
    </div>
  );
}
