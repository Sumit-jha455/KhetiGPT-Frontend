import { useEffect, useState } from "react";
// Import the Link component for the assistant call to action
// Import the lucide icons used on the dashboard
import {
  MessageSquareText,
  CloudSun,
  Sprout,
  Droplets,
  MapPin,
  ArrowRight,
  Ruler,
  Layers,
  Sparkles,
  Bot,
  Wind,
  Umbrella,
} from "lucide-react";
// Import the reusable card, badge and disclaimer components
import Card, { CardHeader } from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Disclaimer from "../components/Disclaimer";
import StatCard from "../components/StatCard";
import ServiceCard from "../components/ServiceCard";
import { fetchCurrentWeather } from "../services/weatherService";
// Import the quick services shown on the dashboard
import { QUICK_SERVICES } from "../data/farmProfile";
// Import the global app context for the farmer and farm details
import { useApp } from "../context/AppContext";
// Import the greeting and date formatters
import { getGreeting, formatLongDate } from "../utils/formatters";
// Import the page title hook
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Maps a quick service tone to the icon rendered on the dashboard grid
const SERVICE_ICONS = {
  // AI assistant module icon
  brand: MessageSquareText,
  // Weather module icon
  sky: CloudSun,
  // Crop recommendation module icon
  amber: Sprout,
  // Fertilizer module icon
  lime: Droplets,
};

/**
 * Dashboard - the home screen of the application area.
 * Shows a greeting, farm overview, quick services, weather summary, the
 * current crop and an AI assistant call to action.
 */
export default function Dashboard() {
  // Set the browser tab title for this page
  useDocumentTitle("Dashboard");

  // Read the authenticated farmer and saved farm information from context
  const { user, farm } = useApp();
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherRetryKey, setWeatherRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadWeather = async () => {
      if (!user?.location) return;
      setWeatherLoading(true);
      setWeatherError("");
      try {
        const data = await fetchCurrentWeather(user.location);
        if (active) setWeather(data);
      } catch (error) {
        if (active) {
          setWeatherError(error.response?.data?.message || error.message || "Weather unavailable.");
        }
      } finally {
        if (active) setWeatherLoading(false);
      }
    };
    loadWeather();
    return () => {
      active = false;
    };
  }, [user?.location, weatherRetryKey]);

  return (
    // Fragment so multiple sections can be returned
    <>
      {/* ============ GREETING BLOCK ============ */}
      <div className="mb-6">
        {/* Time aware greeting with the farmer's name */}
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
          {/* Greeting depends on the current hour */}
          {getGreeting()}, {user?.name?.split(" ")[0] || "Farmer"} 👋
        </h1>
        {/* Today's date under the greeting */}
        <p className="mt-1.5 text-sm text-ink-muted">
          {/* Long formatted date */}
          {formatLongDate()} ·           Here is a summary of your farm.
        </p>
      </div>

      {/* Clarify that non-weather dashboard guidance is static. */}
      <Disclaimer
        // Notice text
        text="Weather is live from the backend. Crop and task guidance on this dashboard is general information; verify conditions locally."
        // Blue informational tone
        tone="sky"
        // Bottom margin for spacing
        className="mb-6"
      />

      {/* ============ FARM OVERVIEW CARD ============ */}
      <Card className="mb-6">
        {/* Card header with icon and description */}
        <CardHeader
          // Card title
          title="Farm Overview"
          // Helper description
          description="Details from your saved profile."
          // Icon shown in the tile
          icon={Layers}
          // Action link to the profile page
          action={
            // Small outline button navigating to the profile module
            <Button to="/profile" variant="outline" size="sm" title="Edit farm details">
              {/* Button label */}
              Edit
            </Button>
          }
        />

        {/* Grid of farm details: one column on mobile, four on desktop */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Farm size tile */}
          <StatCard
            // Tile label
            label="Farm Size"
            // Tile value built from the farm state
            value={farm.farmSize !== "" && farm.farmSize != null ? `${farm.farmSize} ${farm.farmUnit}` : "Not set"}
            // Icon for the tile
            icon={Ruler}
            // Supporting text
            hint="Saved plot area"
          />
          {/* Location tile */}
          <StatCard
            // Tile label
            label="Location"
            // Tile value
            value={user.location || "Not set"}
            // Icon
            icon={MapPin}
            // Supporting text
            hint="Used for live weather"
          />
          {/* Soil type tile */}
          <StatCard
            // Tile label
            label="Soil Type"
            // Tile value
            value={farm.soilType || "Not set"}
            // Icon
            icon={Layers}
            // Supporting text
            hint="Select a soil test for exact values"
          />
          {/* Current crop tile */}
          <StatCard
            // Tile label
            label="Current Crop"
            // Tile value
            value={farm.currentCrop || "Not set"}
            // Icon
            icon={Sprout}
            // Supporting text
            hint={farm.season ? `${farm.season} season` : "Season not set"}
          />
        </div>
      </Card>

      {/* ============ TWO COLUMN AREA ============ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column (spans two columns on desktop) */}
        <div className="lg:col-span-2">
          {/* Quick services header */}
          <h2 className="mb-3 text-base font-semibold text-brand-950">Quick Services</h2>

          {/* Grid of quick service cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Map the quick services data into ServiceCard components */}
            {QUICK_SERVICES.map((service) => (
              // ServiceCard renders a clickable card for each module
              <ServiceCard
                // Unique key per service
                key={service.title}
                // Destination route
                to={service.to}
                // Icon resolved from the tone mapping
                icon={SERVICE_ICONS[service.tone]}
                // Card title
                title={service.title}
                // Card description
                description={service.description}
                // Tone drives the icon tile colour
                tone={service.tone}
              />
            ))}
          </div>

          {/* AI assistant call to action card */}
          <Card className="mt-6 border-brand-200 bg-brand-950">
            {/* Flex row that stacks on small screens */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Left side: text content */}
              <div className="flex items-start gap-3.5">
                {/* Assistant icon tile */}
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-200">
                  {/* Bot icon */}
                  <Bot size={22} aria-hidden="true" />
                </span>
                {/* Text block */}
                <div>
                  {/* CTA heading */}
                  <h3 className="font-display text-lg font-bold text-white">
                    Ask the KhetiGPT Assistant
                  </h3>
                  {/* CTA description */}
                  <p className="mt-1 text-sm leading-relaxed text-brand-200/80">
                    Get quick answers about crops, soil, fertilizer, weather and scheme records
                    using the connected AI assistant.
                  </p>
                  {/* Connection badge */}
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-200">
                    {/* Sparkles icon */}
                    <Sparkles size={12} aria-hidden="true" />
                    {/* Badge label */}
                    Connected AI
                  </span>
                </div>
              </div>

              {/* Right side: action button */}
              <div className="shrink-0">
                {/* White button that contrasts with the dark card */}
                <Button
                  // Navigate to the assistant module
                  to="/assistant"
                  // Light button on the dark surface
                  className="bg-white text-brand-900 hover:bg-brand-50"
                  // Tooltip
                  title="Open the AI assistant"
                >
                  {/* Button label */}
                  Start Chat
                  {/* Arrow icon */}
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="mt-6">
            <CardHeader
              title="Recent Activity"
              description="No activity history is available yet."
              icon={Layers}
            />
            <p className="text-sm leading-relaxed text-ink-muted">
              Recommendations, fertilizer guidance, scheme views, and farm tasks are not stored as dashboard activity.
            </p>
          </Card>
        </div>

        {/* Right column: weather, crop and tasks */}
        <div>
          {/* Weather summary card */}
          <Card>
            {/* Card header */}
            <CardHeader
              // Title
              title="Weather Summary"
              // Description
              description={weather?.location || user?.location || "Your saved location"}
              // Icon
              icon={CloudSun}
              // Link to the full weather page
              action={
                // Small outline button
                <Button to="/weather" variant="outline" size="sm" title="Open weather page">
                  {/* Label */}
                  View
                </Button>
              }
            />

            {/* Temperature and condition row */}
            <div className="flex items-center justify-between">
              {/* Left side: condition text */}
              <div>
                {/* Large temperature value */}
                <p className="font-display text-4xl font-extrabold text-brand-950">
                  {Number.isFinite(Number(weather?.temperature))
                    ? `${weather.temperature}°C`
                    : weatherError
                      ? "Unavailable"
                      : weatherLoading
                        ? "Loading..."
                        : "Not available"}
                </p>
                {/* Condition label */}
                <p className="mt-1 text-sm font-medium text-ink-soft">
                  {weather?.condition || (weatherError ? "Weather unavailable" : "Loading live weather")}
                </p>
              </div>
              {/* Right side: weather icon */}
              <CloudSun size={44} className="text-sky-deep" aria-hidden="true" />
            </div>

            {/* Weather metrics list */}
            <dl className="mt-5 space-y-2.5 text-sm">
              {/* Humidity row */}
              <div className="flex items-center justify-between">
                {/* Metric label */}
                <dt className="text-ink-muted">Humidity</dt>
                {/* Metric value */}
                <dd className="font-semibold text-brand-950">{weather?.humidity ?? "—"}%</dd>
              </div>
              {/* Wind speed row */}
              <div className="flex items-center justify-between">
                {/* Metric label */}
                <dt className="text-ink-muted">
                  {/* Inline wind icon */}
                  <Wind size={14} className="mr-1.5 inline" aria-hidden="true" />
                  Wind Speed
                </dt>
                {/* Metric value */}
                <dd className="font-semibold text-brand-950">
                  {weather?.windSpeed ?? "—"} km/h
                </dd>
              </div>
              {/* Rain probability row */}
              <div className="flex items-center justify-between">
                {/* Metric label */}
                <dt className="text-ink-muted">
                  {/* Inline umbrella icon */}
                  <Umbrella size={14} className="mr-1.5 inline" aria-hidden="true" />
                  Rain Probability
                </dt>
                {/* Metric value */}
                <dd className="font-semibold text-brand-950">
                  {weather?.rainProbability ?? "—"}%
                </dd>
              </div>
            </dl>

            <p className="mt-4 rounded-xl bg-surface p-3 text-xs leading-relaxed text-ink-soft">
              {/* Tip icon plus text */}
              <Sparkles size={13} className="mr-1.5 inline text-brand-600" aria-hidden="true" />
              Weather conditions can change quickly. Confirm local observations before making field decisions.
            </p>
            {weatherError ? (
              <div className="mt-3">
                <p role="alert" className="text-xs text-red-700">{weatherError}</p>
                <Button className="mt-2" size="sm" variant="outline" onClick={() => setWeatherRetryKey((key) => key + 1)}>
                  Retry weather
                </Button>
              </div>
            ) : null}
          </Card>

          {/* Current crop card */}
          <Card className="mt-6">
            {/* Card header */}
            <CardHeader
              // Title
              title="Current Crop"
              // Description
              description="Crop and conditions from your saved profile."
              // Icon
              icon={Sprout}
            />

            {/* Crop name and season badge */}
            <div className="flex items-center justify-between">
              {/* Crop name */}
              <p className="font-display text-xl font-bold text-brand-950">
                {farm.currentCrop || "No crop recorded"}
              </p>
              {/* Season badge */}
              {farm.season ? <Badge tone="amber">{farm.season} Season</Badge> : <Badge tone="neutral">Season not set</Badge>}
            </div>

            {/* Crop detail rows */}
            <dl className="mt-4 space-y-2.5 text-sm">
              {/* Water availability row */}
              <div className="flex items-center justify-between">
                {/* Label */}
                <dt className="text-ink-muted">Water Availability</dt>
                {/* Value */}
                <dd className="font-semibold text-brand-950">{farm.waterAvailability || "Not set"}</dd>
              </div>
              {/* Soil type row */}
              <div className="flex items-center justify-between">
                {/* Label */}
                <dt className="text-ink-muted">Soil Type</dt>
                {/* Value */}
                <dd className="font-semibold text-brand-950">{farm.soilType || "Not set"}</dd>
              </div>
            </dl>

            {/* Link to the fertilizer module */}
            <div className="mt-4">
              {/* Small button navigating to the fertilizer page */}
              <Button
                // Route
                to="/fertilizer"
                // Outline variant
                variant="outline"
                // Full width on mobile
                fullWidth
                // Tooltip
                title="Open fertilizer guidance"
              >
                {/* Button label */}
                View Fertilizer Guidance
                {/* Arrow icon */}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </>
  );
}
