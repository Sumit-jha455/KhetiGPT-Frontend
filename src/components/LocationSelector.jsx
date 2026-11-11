import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import {
  INDIAN_LOCATION_SUGGESTIONS,
  INDIAN_STATES_AND_UTS,
} from "../data/indiaLocations";

const getStateFromLocation = (location) =>
  INDIAN_STATES_AND_UTS.find((state) => location.endsWith(`, ${state}`)) || "";

export default function LocationSelector({
  value = "",
  onChange,
  name = "location",
  error,
  required = false,
  disabled = false,
}) {
  const [query, setQuery] = useState(value);
  const [selectedState, setSelectedState] = useState(getStateFromLocation(value));

  useEffect(() => {
    setQuery(value || "");
    setSelectedState(getStateFromLocation(value || ""));
  }, [value]);

  const suggestions = useMemo(() => {
    if (!selectedState) return INDIAN_LOCATION_SUGGESTIONS;
    return INDIAN_LOCATION_SUGGESTIONS.filter((location) =>
      location.endsWith(`, ${selectedState}`)
    );
  }, [selectedState]);

  const updateLocation = (nextValue) => {
    setQuery(nextValue);
    onChange({ target: { name, value: nextValue } });
  };

  const handleStateChange = (event) => {
    const nextState = event.target.value;
    setSelectedState(nextState);
    if (!query.trim()) return;

    const city = query.split(",")[0].trim();
    updateLocation(city ? `${city}, ${nextState}` : nextState);
  };

  return (
    <div>
      <label htmlFor={`${name}-city`} className="mb-1.5 block text-sm font-semibold text-ink">
        <MapPin size={14} className="mr-1.5 inline" aria-hidden="true" />
        Location
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </label>
      <div className="grid gap-3 sm:grid-cols-[1.25fr_1fr]">
        <input
          id={`${name}-city`}
          name={name}
          list={`${name}-suggestions`}
          value={query || (disabled ? "Not set" : "")}
          onChange={(event) => updateLocation(event.target.value)}
          placeholder="Search city, district or village"
          required={required}
          disabled={disabled}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-muted ${
            error ? "border-red-400" : "border-line"
          }`}
        />
        <select
          aria-label="Indian state or union territory"
          value={selectedState}
          onChange={handleStateChange}
          disabled={disabled}
          className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-muted"
        >
          <option value="">Select state / UT</option>
          {INDIAN_STATES_AND_UTS.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
      <datalist id={`${name}-suggestions`}>
        {suggestions.map((location) => (
          <option key={location} value={location} />
        ))}
      </datalist>
      <p className="mt-1.5 text-xs text-ink-muted">
        Choose a suggestion or enter another valid location. Include the state for accurate weather.
      </p>
      {error ? <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
