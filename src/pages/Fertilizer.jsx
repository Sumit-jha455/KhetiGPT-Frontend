import { useEffect, useState } from "react";
import {
  Droplets, Sprout, Layers, Leaf, FlaskConical, CheckCircle2,
  AlertTriangle, RefreshCw, Search,
} from "lucide-react";
import Card, { CardHeader } from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Disclaimer from "../components/Disclaimer";
import LoadingState from "../components/LoadingState";
import { getFertilizerOptions, getFertilizerGuidance } from "../services/fertilizerService";
import { validateRequired, runValidation } from "../utils/validators";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useApp } from "../context/AppContext";

const DEFAULT_OPTIONS = {
  growthStages: ["Seedling", "Vegetative", "Flowering", "Harvest"],
  soilTypes: [],
  nutrients: [],
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.errors?.map((item) => item.message).join(" ") ||
  error.message ||
  "Unable to load fertilizer guidance.";

export default function Fertilizer() {
  useDocumentTitle("Fertilizer Guidance");
  const { farm } = useApp();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [form, setForm] = useState({
    crop: farm.currentCrop || "",
    soilType: farm.soilType || "",
    growthStage: "Vegetative",
  });
  const [errors, setErrors] = useState({});
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOptions = async () => {
    setOptionsLoading(true);
    setOptionsError("");
    try {
      const data = await getFertilizerOptions();
      setOptions({
        growthStages: data.growthStages || DEFAULT_OPTIONS.growthStages,
        soilTypes: data.soilTypes || [],
        nutrients: data.nutrients || [],
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
      crop: current.crop || farm.currentCrop || "",
      soilType: current.soilType || farm.soilType || "",
    }));
  }, [farm.currentCrop, farm.soilType]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateForm = () => {
    const validation = runValidation(form, {
      crop: (value) => validateRequired(value, "Crop"),
      soilType: (value) => validateRequired(value, "Soil type"),
      growthStage: (value) => validateRequired(value, "Growth stage"),
    });
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || !validateForm()) return;
    setLoading(true);
    setErrorMessage("");
    setGuidance(null);
    try {
      setGuidance(await getFertilizerGuidance({
        crop: form.crop.trim(),
        soilType: form.soilType,
        growthStage: form.growthStage,
      }));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      crop: farm.currentCrop || "",
      soilType: farm.soilType || options.soilTypes[0] || "",
      growthStage: "Vegetative",
    });
    setErrors({});
    setGuidance(null);
    setErrorMessage("");
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-50 text-lime-700"><Droplets size={22} /></span>
          <h1 className="font-display text-xl font-bold text-brand-950 sm:text-2xl">Fertilizer Guidance</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Select your crop, soil type, and growth stage to retrieve general nutrient and application guidance from the backend.
        </p>
      </div>

      {optionsError ? (
        <Card className="mb-6">
          <p role="alert" className="text-sm text-red-700">{optionsError}</p>
          <Button className="mt-3" variant="outline" onClick={loadOptions}>Retry loading options</Button>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Select Details" description="Submit the fields to load backend guidance." icon={Sprout} />
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <Input label="Crop" name="crop" icon={Sprout} value={form.crop} onChange={handleChange} placeholder="e.g. Wheat or Tomato" required error={errors.crop} />
              <Select label="Soil Type" name="soilType" options={options.soilTypes} value={form.soilType} onChange={handleChange} required error={errors.soilType} disabled={optionsLoading} />
              <Select label="Growth Stage" name="growthStage" options={options.growthStages} value={form.growthStage} onChange={handleChange} required error={errors.growthStage} hint="Choose the current stage of your crop." disabled={optionsLoading} />
              <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
                <Button type="submit" fullWidth disabled={loading || optionsLoading}><Search size={16} />{loading ? "Loading..." : "Get Guidance"}</Button>
                <Button type="button" variant="outline" fullWidth onClick={resetForm}><RefreshCw size={16} />Reset</Button>
              </div>
            </form>
          </Card>

          {options.nutrients.length ? (
            <Card className="mt-6">
              <CardHeader title="Nutrient Reference" description="Reference data supplied by the backend." icon={FlaskConical} />
              <ul className="space-y-3.5">
                {options.nutrients.map((nutrient) => (
                  <li key={nutrient.symbol} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 font-display text-sm font-bold text-brand-700">{nutrient.symbol}</span>
                    <div><p className="text-sm font-semibold text-brand-950">{nutrient.name}</p><p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{nutrient.role}</p></div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <Card><LoadingState label="Loading fertilizer guidance..." rows={5} /></Card>
          ) : errorMessage ? (
            <Card>
              <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{errorMessage}</p>
              <Button className="mt-4" onClick={() => handleSubmit({ preventDefault: () => {} })}>Try again</Button>
            </Card>
          ) : guidance ? (
            <Card>
              <CardHeader title={`${guidance.inputs.crop} · ${guidance.inputs.growthStage} Stage`} description={`Guidance for ${guidance.inputs.soilType.toLowerCase()} soil.`} icon={Leaf} action={<Badge tone="brand">Backend Guidance</Badge>} />
              <div className="rounded-2xl bg-brand-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Nutrient Priority</p>
                <p className="mt-1.5 font-display text-xl font-bold text-brand-950">{guidance.nutrientPriority}</p>
                <p className="mt-1 text-sm text-brand-800">{guidance.nutrientEmphasis}</p>
              </div>
              <div className="mt-5"><h3 className="flex items-center gap-2 text-sm font-semibold text-brand-950"><CheckCircle2 size={16} className="text-brand-600" />Stage Guidance</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{guidance.stageSummary}</p></div>
              {guidance.cropSpecificNote ? <p className="mt-5 rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink-soft">{guidance.cropSpecificNote}</p> : null}
              {guidance.application ? <div className="mt-5 rounded-xl border border-line bg-surface p-4"><p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted"><Layers size={13} />Application Guidance</p><p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{guidance.application.practice}</p><p className="mt-2 text-sm leading-relaxed text-ink-soft"><strong>Soil adjustment:</strong> {guidance.application.soilAdjustment}</p>{guidance.application.cautions?.length ? <ul className="mt-2 space-y-1">{guidance.application.cautions.map((item) => <li key={item} className="text-xs text-ink-muted">• {item}</li>)}</ul> : null}</div> : null}
              {guidance.nutrients?.length ? <div className="mt-5"><h3 className="text-sm font-semibold text-brand-950">Nutrient Information</h3><div className="mt-2 space-y-3">{guidance.nutrients.map((nutrient) => <div key={nutrient.symbol} className="rounded-xl border border-line p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-brand-950">{nutrient.symbol} · {nutrient.name}</p>{nutrient.isStagePriority ? <Badge tone="sky">Stage priority</Badge> : null}</div><p className="mt-1 text-xs leading-relaxed text-ink-muted">{nutrient.role}</p><p className="mt-1 text-xs text-ink-soft"><strong>Sources:</strong> {nutrient.sources?.join(", ")}</p></div>)}</div></div> : null}
              {guidance.organicOptions?.length ? <div className="mt-5"><h3 className="text-sm font-semibold text-brand-950">Organic Options</h3><ul className="mt-2 space-y-1">{guidance.organicOptions.map((item) => <li key={item.name || item} className="text-sm text-ink-soft">• {typeof item === "string" ? item : `${item.name}: ${item.benefit || ""}`}</li>)}</ul></div> : null}
              {guidance.safetyWarnings?.length ? <div className="mt-5"><h3 className="flex items-center gap-2 text-sm font-semibold text-brand-950"><AlertTriangle size={16} className="text-amber-600" />Safety Warnings</h3><ul className="mt-2 space-y-2">{guidance.safetyWarnings.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{item}</li>)}</ul></div> : null}
              {guidance.disclaimer ? <p className="mt-5 rounded-xl bg-surface p-3 text-xs leading-relaxed text-ink-muted">{guidance.disclaimer}</p> : null}
            </Card>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700"><AlertTriangle size={26} /></span>
              <h3 className="mt-4 text-base font-semibold text-brand-950">No guidance loaded</h3>
              <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">Select the crop, soil, and growth stage, then request guidance.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
