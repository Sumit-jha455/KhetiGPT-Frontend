import { useEffect, useMemo, useState } from "react";
import {
  Sprout, MapPin, Ruler, CloudSun, Layers, Droplets, Search, RotateCcw,
  CheckCircle2, Lightbulb, AlertTriangle, Thermometer,
} from "lucide-react";
import Card, { CardHeader } from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Disclaimer from "../components/Disclaimer";
import LoadingState from "../components/LoadingState";
import { getCropOptions, getCropRecommendation } from "../services/cropService";
import { validateRequired, runValidation } from "../utils/validators";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useApp } from "../context/AppContext";

const DEFAULT_OPTIONS = { seasons: ["Kharif", "Rabi", "Zaid"], soilTypes: [], waterLevels: ["Low", "Medium", "High"] };
const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.errors?.map((item) => item.message).join(" ") ||
  error.message || "Unable to complete the crop recommendation.";

export default function CropRecommendation() {
  useDocumentTitle("Crop Recommendation");
  const { user, farm } = useApp();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [form, setForm] = useState({
    location: user.location || "", season: farm.season || "", soilType: farm.soilType || "",
    waterAvailability: farm.waterAvailability || "", farmSize: farm.farmSize || "",
    temperature: "", rainfall: "",
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOptions = async () => {
    setOptionsLoading(true);
    setOptionsError("");
    try {
      const data = await getCropOptions();
      setOptions({
        seasons: data.seasons || DEFAULT_OPTIONS.seasons,
        soilTypes: data.soilTypes || [],
        waterLevels: data.waterLevels || DEFAULT_OPTIONS.waterLevels,
      });
    } catch (error) {
      setOptionsError(getErrorMessage(error));
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => { loadOptions(); }, []);
  useEffect(() => {
    setForm((current) => ({
      ...current,
      location: current.location || user.location || "",
      season: current.season || farm.season || "",
      soilType: current.soilType || farm.soilType || "",
      waterAvailability: current.waterAvailability || farm.waterAvailability || "",
      farmSize: current.farmSize || farm.farmSize || "",
    }));
  }, [user.location, farm.season, farm.soilType, farm.waterAvailability, farm.farmSize]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateForm = () => {
    const validation = runValidation(form, {
      location: (value) => validateRequired(value, "Location"),
      season: (value) => validateRequired(value, "Season"),
      soilType: (value) => validateRequired(value, "Soil type"),
      waterAvailability: (value) => validateRequired(value, "Water availability"),
      farmSize: (value) => !value ? "Farm size is required" : Number(value) >= 0 ? "" : "Farm size must be a positive number",
    });
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || !validateForm()) return;
    setLoading(true);
    setErrorMessage("");
    setResult(null);
    try {
      const payload = {
        soilType: form.soilType, season: form.season, waterAvailability: form.waterAvailability,
        location: form.location.trim(), farmSize: Number(form.farmSize),
      };
      if (form.temperature !== "") payload.temperature = Number(form.temperature);
      if (form.rainfall !== "") payload.rainfall = Number(form.rainfall);
      setResult(await getCropRecommendation(payload));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      location: user.location || "", season: farm.season || options.seasons[0] || "",
      soilType: farm.soilType || options.soilTypes[0] || "",
      waterAvailability: farm.waterAvailability || options.waterLevels[1] || "",
      farmSize: farm.farmSize || "", temperature: "", rainfall: "",
    });
    setErrors({});
    setResult(null);
    setErrorMessage("");
  };
  const alternatives = useMemo(() => result?.alternatives || [], [result]);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Sprout size={22} /></span>
          <h1 className="font-display text-xl font-bold text-brand-950 sm:text-2xl">Crop Recommendation</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Enter your farm conditions to receive an indicative recommendation from the backend crop knowledge base.
        </p>
      </div>
      {optionsError ? <Card className="mb-6"><p role="alert" className="text-sm text-red-700">{optionsError}</p><Button className="mt-3" variant="outline" onClick={loadOptions}>Retry loading options</Button></Card> : null}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Farm Details" description="Fields marked with * are required." icon={MapPin} />
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input label="Location" name="location" icon={MapPin} value={form.location} onChange={handleChange} placeholder="e.g. Nashik, Maharashtra" required error={errors.location} />
            <Select label="Season" name="season" options={options.seasons} value={form.season} onChange={handleChange} required error={errors.season} hint="Kharif, Rabi or Zaid." />
            <Select label="Soil Type" name="soilType" options={options.soilTypes} value={form.soilType} onChange={handleChange} required error={errors.soilType} disabled={optionsLoading} />
            <Select label="Water Availability" name="waterAvailability" options={options.waterLevels} value={form.waterAvailability} onChange={handleChange} required error={errors.waterAvailability} disabled={optionsLoading} />
            <Input label="Farm Size" name="farmSize" type="number" min="0" step="0.01" icon={Ruler} value={form.farmSize} onChange={handleChange} placeholder="e.g. 2.5" required error={errors.farmSize} hint="Plot area in acres." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Temperature (optional)" name="temperature" type="number" min="-20" max="60" step="0.1" icon={Thermometer} value={form.temperature} onChange={handleChange} placeholder="°C" />
              <Input label="Rainfall (optional)" name="rainfall" type="number" min="0" max="12000" step="0.1" value={form.rainfall} onChange={handleChange} placeholder="mm" />
            </div>
            <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
              <Button type="submit" fullWidth disabled={loading || optionsLoading}><Search size={16} />{loading ? "Generating..." : "Get Recommendation"}</Button>
              <Button type="button" variant="outline" fullWidth onClick={resetForm}><RotateCcw size={16} />Reset</Button>
            </div>
          </form>
        </Card>
        <div className="lg:col-span-3">
          {loading ? <Card><LoadingState label="Generating live recommendation..." rows={4} /></Card> :
          errorMessage ? <Card><p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{errorMessage}</p><Button className="mt-4" onClick={() => handleSubmit({ preventDefault: () => {} })}>Try again</Button></Card> :
          result ? (
            <>
              <Card className="border-brand-300">
                <CardHeader title="Recommendation Result" description={result.weatherUsed ? "Live weather contributed to this evaluation." : "Generated from the submitted farm conditions."} icon={Sprout} action={<Badge tone="brand">{result.scoreLabel || "Indicative result"}</Badge>} />
                <div className="rounded-2xl bg-brand-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Recommended Crop</p>
                  <p className="mt-1.5 font-display text-3xl font-extrabold text-brand-950">{result.crop}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="brand">{result.category}</Badge><Badge tone="neutral">{result.duration}</Badge><Badge tone="sky">Water: {result.waterNeed}</Badge>
                    {result.suitabilityScore !== undefined ? <Badge tone="brand">Suitability: {result.suitabilityScore}/100</Badge> : null}
                  </div>
                </div>
                <div className="mt-5"><h3 className="flex items-center gap-2 text-sm font-semibold text-brand-950"><CheckCircle2 size={16} className="text-brand-600" />Reason</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{result.reason}</p></div>
                {result.cultivation ? <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-surface p-3 text-sm">Temperature: <strong>{result.cultivation.temperatureRangeC}</strong></div><div className="rounded-xl bg-surface p-3 text-sm">Water: <strong>{result.cultivation.waterRequirementMm}</strong></div></div> : null}
                <div className="mt-5"><h3 className="flex items-center gap-2 text-sm font-semibold text-brand-950"><Lightbulb size={16} className="text-amber-600" />Considerations</h3><ul className="mt-2 space-y-2">{(result.considerations || []).map((item) => <li key={item} className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /><span className="text-sm leading-relaxed text-ink-soft">{item}</span></li>)}</ul></div>
                {result.weatherNote ? <p className="mt-5 rounded-xl bg-surface p-3 text-xs text-ink-muted"><CloudSun size={13} className="mr-1.5 inline" />{result.weatherNote}</p> : null}
                <p className="mt-5 rounded-xl bg-surface p-3 text-xs text-ink-muted"><Layers size={13} className="mr-1.5 inline" />{result.method}</p>
              </Card>
              {alternatives.length ? <Card className="mt-6"><CardHeader title="Alternatives to Consider" description="Other crops returned by the backend." icon={Droplets} /><div className="grid gap-3 sm:grid-cols-3">{alternatives.map((alternative) => <div key={alternative.name} className="rounded-xl border border-line bg-surface p-4"><p className="text-sm font-semibold text-brand-950">{alternative.name}</p><p className="mt-1 text-xs leading-relaxed text-ink-muted">{alternative.note}</p><p className="mt-2 text-[11px] font-medium text-brand-700">Score: {alternative.score ?? "—"}</p></div>)}</div></Card> : null}
              <Disclaimer className="mt-6" tone="amber" text={result.disclaimer || "This is indicative guidance. Confirm the final decision with a soil test and local agriculture expert."} />
            </>
          ) : <Card className="flex h-full flex-col items-center justify-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700"><AlertTriangle size={26} /></span><h3 className="mt-4 text-base font-semibold text-brand-950">No recommendation yet</h3><p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">Fill in your farm details and submit to see the backend recommendation.</p><div className="mt-5 flex items-center gap-3 text-ink-muted"><Sprout size={18} /><CloudSun size={18} /><Droplets size={18} /></div></Card>}
        </div>
      </div>
    </>
  );
}
