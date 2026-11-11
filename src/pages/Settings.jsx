// Import React hooks for local state
import { useEffect, useState } from "react";
// Import the lucide icons used on this page
import { Settings as SettingsIcon, Bell, Languages, Moon, Info, Save } from "lucide-react";
// Import the reusable components
import Card, { CardHeader } from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Disclaimer from "../components/Disclaimer";
// Import the global app context for the language preference
import { useApp } from "../context/AppContext";
// Import the page title hook
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLocalStorage } from "../hooks/useLocalStorage";

/**
 * Settings - account-backed language plus local-only interface preferences.
 */
export default function Settings() {
  // Set the browser tab title for this page
  useDocumentTitle("Settings");

  // Read the language preference and the update function from context
  const { user, updateProfile } = useApp();

  // Local state for each preference toggle
  const [localPreferences, setLocalPreferences] = useLocalStorage("khetigpt_preferences", {
    notifications: true,
    compactMode: false,
  });
  const [language, setLanguage] = useState(user.language || "English");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLanguage(user.language || "English");
  }, [user.language]);

  /** Toggles a boolean preference by name */
  const togglePreference = (name) => {
    // Update the preference with the opposite value
    setLocalPreferences((current) => ({ ...current, [name]: !current[name] }));
  };

  /** Saves the language preference into the app context */
  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setErrorMessage("");
    try {
      await updateProfile({ language });
      setMessage("Language preference saved to your profile.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Unable to save language preference.");
    } finally {
      setSaving(false);
    }
  };

  return (
    // Fragment so the header and the cards can be returned together
    <>
      {/* Page header block */}
      <div className="mb-6">
        {/* Title row with the module icon */}
        <div className="flex items-center gap-3">
          {/* Icon tile */}
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            {/* Settings icon */}
            <SettingsIcon size={22} aria-hidden="true" />
          </span>
          {/* Page title */}
          <h1 className="font-display text-xl font-bold text-brand-950 sm:text-2xl">Settings</h1>
        </div>
        {/* Page description */}
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Language is saved to your profile. Notification and compact display preferences stay on this device.
        </p>
      </div>

      {/* Two column grid of setting cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notification settings card */}
        <Card>
          {/* Card header */}
          <CardHeader
            // Title
            title="Notifications"
            // Description
            description="These preferences are local-only; no backend notification or layout setting exists."
            // Icon
            icon={Bell}
          />

          {/* Notification toggle row */}
          <div className="flex items-center justify-between gap-4">
            {/* Row text */}
            <div>
              {/* Row title */}
              <p className="text-sm font-semibold text-ink">Weather updates</p>
              {/* Row description */}
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                Controls local notification indicators where supported.
              </p>
            </div>

            {/* Switch button */}
            <button
              // Avoid form submission behaviour
              type="button"
              // Toggle the notifications preference
              onClick={() => togglePreference("notifications")}
              // ARIA attributes expose the switch state
              role="switch"
              aria-checked={localPreferences.notifications}
              // Accessible label
              aria-label="Weather update notifications"
              // Track styling that changes colour when active
              className={
                localPreferences.notifications
                  ? // Active track
                    "relative h-6 w-11 shrink-0 rounded-full bg-brand-600 transition-colors"
                  : // Inactive track
                    "relative h-6 w-11 shrink-0 rounded-full bg-line transition-colors"
              }
            >
              {/* Thumb that slides left or right */}
              <span
                // Position depends on the state
                className={
                  localPreferences.notifications
                    ? // Thumb on the right
                      "absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                    : // Thumb on the left
                      "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                }
              />
            </button>
          </div>

          {/* Compact mode toggle row */}
          <div className="mt-5 flex items-center justify-between gap-4">
            {/* Row text */}
            <div>
              {/* Row title */}
              <p className="text-sm font-semibold text-ink">Compact display</p>
              {/* Row description */}
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                Stores your compact display preference locally.
              </p>
            </div>

            {/* Switch button for compact mode */}
            <button
              // Avoid form submission behaviour
              type="button"
              // Toggle the compact mode preference
              onClick={() => togglePreference("compactMode")}
              // ARIA switch semantics
              role="switch"
              aria-checked={localPreferences.compactMode}
              // Accessible label
              aria-label="Compact display mode"
              // Track styling
              className={
                localPreferences.compactMode
                  ? // Active track
                    "relative h-6 w-11 shrink-0 rounded-full bg-brand-600 transition-colors"
                  : // Inactive track
                    "relative h-6 w-11 shrink-0 rounded-full bg-line transition-colors"
              }
            >
              {/* Sliding thumb */}
              <span
                // Position depends on the state
                className={
                  localPreferences.compactMode
                    ? // Thumb on the right
                      "absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                    : // Thumb on the left
                      "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                }
              />
            </button>
          </div>
        </Card>

        {/* Language settings card */}
        <Card>
          {/* Card header */}
          <CardHeader
            // Title
            title="Language"
            // Description
            description="Preferred language for the interface."
            // Icon
            icon={Languages}
          />

          {/* Language option tiles */}
          <div className="grid grid-cols-2 gap-3">
            {/* Map both language options */}
            {["English", "Hindi"].map((option) => (
              // Single language tile
              <button
                // Unique key per language
                key={option}
                // Avoid form submission
                type="button"
                // Select the language locally
                onClick={() => setLanguage(option)}
                // ARIA state for the selected option
                aria-pressed={language === option}
                // Accessible label
                aria-label={`Select ${option} language`}
                // Tile styling that highlights the selected option
                className={
                  language === option
                    ? // Selected tile
                      "rounded-xl border-2 border-brand-500 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800"
                    : // Unselected tile
                      "rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink-soft transition-colors hover:border-brand-300"
                }
              >
                {/* Language label */}
                {option}
              </button>
            ))}
          </div>

          {/* Save button for the language preference */}
          <Button className="mt-5" onClick={handleSave} title="Save language preference">
            {/* Save icon */}
            <Save size={16} aria-hidden="true" />
            {/* Button label */}
            {saving ? "Saving..." : "Save Preference"}
          </Button>

          {message ? <p className="mt-3 text-xs font-medium text-brand-700">{message}</p> : null}
          {errorMessage ? <p role="alert" className="mt-3 text-xs font-medium text-red-700">{errorMessage}</p> : null}

          {/* Note about translation support */}
          <Disclaimer
            // Notice text
            text="Language is stored on your profile, but translating all interface text is not implemented yet."
            // Spacing above
            className="mt-4"
          />
        </Card>
      </div>

      {/* Project information card */}
      <Card className="mt-6">
        {/* Card header */}
        <CardHeader
          // Title
          title="About this project"
          // Description
          description="Academic mini project information."
          // Icon
          icon={Info}
          // Version badge
          action={<Badge tone="neutral">MVP Frontend</Badge>}
        />

        {/* Information list */}
        <dl className="grid gap-3 sm:grid-cols-2">
          {/* Project name row */}
          <div className="rounded-xl bg-surface p-4">
            {/* Label */}
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Project
            </dt>
            {/* Value */}
            <dd className="mt-1 text-sm font-semibold text-brand-950">
              KhetiGPT – AI-Powered Personal Farming Assistant
            </dd>
          </div>
          {/* Tagline row */}
          <div className="rounded-xl bg-surface p-4">
            {/* Label */}
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Tagline
            </dt>
            {/* Value */}
            <dd className="mt-1 text-sm font-semibold text-brand-950">
              Smarter Farming. Better Decisions.
            </dd>
          </div>
          {/* Status row */}
          <div className="rounded-xl bg-surface p-4">
            {/* Label */}
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Current status
            </dt>
            {/* Value */}
            <dd className="mt-1 text-sm font-semibold text-brand-950">
              Connected frontend with backend services
            </dd>
          </div>
          {/* Connected services row */}
          <div className="rounded-xl bg-surface p-4">
            {/* Label */}
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Connected services
            </dt>
            {/* Value */}
            <dd className="mt-1 text-sm font-semibold text-brand-950">
              Express API, MongoDB, Groq and OpenWeather
            </dd>
          </div>
        </dl>

        {/* Note about the dark mode placeholder */}
        <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
          {/* Moon icon */}
          <Moon size={13} aria-hidden="true" />
          {/* Note text */}
          Dark mode is not implemented in this phase to keep the MVP focused.
        </p>
      </Card>
    </>
  );
}
