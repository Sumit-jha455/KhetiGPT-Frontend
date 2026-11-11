import { useEffect, useState } from "react";
import {
  CloudSun,
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Droplets,
  Wind,
  Umbrella,
  MapPin,
  Thermometer,
  Sunrise,
  Sunset,
  RefreshCw,
} from "lucide-react";
import Card, { CardHeader } from "../components/Card";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import Disclaimer from "../components/Disclaimer";
import { fetchWeatherBundle, fetchWeatherStatus } from "../services/weatherService";
import { formatDayLabel } from "../utils/formatters";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useApp } from "../context/AppContext";

const ICON_MAP = {
  "cloud-sun": CloudSun,
  sun: Sun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-lightning": CloudLightning,
};

const getIcon = (key) => ICON_MAP[key] || CloudSun;
const displayTemperature = (value) =>
  Number.isFinite(Number(value)) ? `${value}°C` : "—";

export default function Weather() {
  useDocumentTitle("Weather Information");

  const { user } = useApp();
  const [city, setCity] = useState(user.location || "");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [locationLabel, setLocationLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [configured, setConfigured] = useState(true);

  const loadWeather = async (requestedCity = city) => {
    const trimmedCity = String(requestedCity || "").trim();
    setLoading(true);
    setErrorMessage("");

    try {
      const bundle = await fetchWeatherBundle(trimmedCity);
      setCurrent(bundle.weather || null);
      setForecast(Array.isArray(bundle.forecast) ? bundle.forecast : []);
      setLocationLabel(bundle.location || bundle.weather?.location || trimmedCity);
    } catch (error) {
      setCurrent(null);
      setForecast([]);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load weather information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!city && user.location) {
      setCity(user.location);
      loadWeather(user.location);
    }
  }, [user.location, city]);

  useEffect(() => {
    if (city.trim()) loadWeather(city);
  }, []);

  useEffect(() => {
    let active = true;
    fetchWeatherStatus()
      .then((status) => {
        if (active) setConfigured(status.configured !== false);
      })
      .catch(() => {
        if (active) setConfigured(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const CurrentIcon = getIcon(current?.icon);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-soft text-sky-deep">
            <CloudSun size={22} aria-hidden="true" />
          </span>
          <h1 className="font-display text-xl font-bold text-brand-950 sm:text-2xl">
            Weather Information
          </h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          View current OpenWeather conditions and a five-day forecast for your area.
        </p>
      </div>

      <Card className="mb-6">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          onSubmit={(event) => {
            event.preventDefault();
            loadWeather(city);
          }}
        >
          <div className="w-full sm:max-w-sm">
            <label htmlFor="weather-city" className="mb-1.5 block text-sm font-semibold text-ink">
              <MapPin size={14} className="mr-1.5 inline" aria-hidden="true" />
              City
            </label>
            <input
              id="weather-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="e.g. Delhi or Nashik, Maharashtra"
              className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" disabled={loading || !city.trim()}>
            <RefreshCw size={16} aria-hidden="true" />
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </form>
        <p className="mt-3 text-xs text-ink-muted">
          {locationLabel ? `Showing weather for ${locationLabel}.` : "Use a city name to load weather."}
        </p>
        {!configured ? (
          <Disclaimer
            className="mt-4"
            tone="amber"
            text="The weather service is not configured on the backend."
          />
        ) : null}
      </Card>

      {loading ? (
        <Card>
          <LoadingState label="Loading live weather..." rows={4} />
        </Card>
      ) : errorMessage ? (
        <Card>
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm leading-relaxed text-red-700">
            {errorMessage}
          </p>
          <Button className="mt-4" onClick={() => loadWeather(city)} disabled={!city.trim()}>
            Try again
          </Button>
        </Card>
      ) : !current ? (
        <Card>
          <p className="text-sm text-ink-muted">No current weather data is available.</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-brand-200 bg-brand-950 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-brand-200">{current.location}</p>
                  <p className="mt-3 font-display text-5xl font-extrabold">
                    {displayTemperature(current.temperature)}
                  </p>
                  <p className="mt-2 text-sm font-medium capitalize text-brand-100">
                    {current.condition} · {current.description}
                  </p>
                </div>
                <CurrentIcon size={50} className="text-brand-200" aria-hidden="true" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <span>Feels like <strong>{displayTemperature(current.feelsLike)}</strong></span>
                <span>Humidity <strong>{current.humidity}%</strong></span>
                <span>Wind <strong>{current.windSpeed} km/h</strong></span>
                <span>Rain <strong>{current.rainProbability}%</strong></span>
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Current Conditions" description="Live data from OpenWeather." icon={Thermometer} />
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl bg-surface p-3">
                  <dt className="text-sm text-ink-muted"><Droplets size={15} className="mr-1 inline" />Humidity</dt>
                  <dd className="font-semibold text-brand-950">{current.humidity ?? "—"}%</dd>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-surface p-3">
                  <dt className="text-sm text-ink-muted"><Wind size={15} className="mr-1 inline" />Wind speed</dt>
                  <dd className="font-semibold text-brand-950">{current.windSpeed ?? "—"} km/h</dd>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-surface p-3">
                  <dt className="text-sm text-ink-muted"><Umbrella size={15} className="mr-1 inline" />Rain probability</dt>
                  <dd className="font-semibold text-brand-950">{current.rainProbability ?? "—"}%</dd>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-surface p-3">
                  <dt className="text-sm text-ink-muted"><Sunrise size={15} className="mr-1 inline" />Sunrise / Sunset</dt>
                  <dd className="font-semibold text-brand-950">{current.sunrise || "—"} / {current.sunset || "—"}</dd>
                </div>
              </dl>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader title="Five-Day Forecast" description="Daily values aggregated by the backend." icon={CloudSun} />
            {forecast.length === 0 ? (
              <p className="text-sm text-ink-muted">No forecast data is available for this location.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {forecast.slice(0, 5).map((day) => {
                  const DayIcon = getIcon(day.icon);
                  return (
                    <div key={day.date} className="rounded-xl border border-line bg-surface p-3">
                      <p className="text-xs font-semibold text-ink-muted">{formatDayLabel(day.date)}</p>
                      <DayIcon size={28} className="my-3 text-sky-deep" aria-hidden="true" />
                      <p className="text-sm font-semibold text-brand-950">{day.condition}</p>
                      <p className="mt-1 text-sm text-ink-soft">{day.high}° / {day.low}°C</p>
                      <p className="mt-2 text-xs text-ink-muted">Rain {day.rain}%</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <p className="mt-4 text-xs text-ink-muted">
            Weather data is provided by OpenWeather. Use it as general planning information and verify local field conditions.
          </p>
        </>
      )}
    </>
  );
}
