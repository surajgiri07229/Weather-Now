// App.js
import React, { useState } from "react";

// Weather code map
const WEATHER_MAP = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mainly clear", emoji: "🌤️" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Fog", emoji: "🌫️" },
  61: { label: "Slight rain", emoji: "🌦️" },
  63: { label: "Moderate rain", emoji: "🌧️" },
  65: { label: "Heavy rain", emoji: "🌧️" },
  71: { label: "Snowfall", emoji: "❄️" },
  80: { label: "Rain showers", emoji: "🌦️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
};

const getCondition = (code) => WEATHER_MAP[code] || { label: "Unknown", emoji: "❔" };

const formatLocation = (place) => {
  if (!place) return "";
  const parts = [
    place.name,
    place.admin1 && place.admin1 !== place.name ? place.admin1 : null,
    place.country,
  ].filter(Boolean);
  return parts.join(", ");
};

export default function App() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found.");
        setLoading(false);
        return;
      }

      const place = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true`
      );
      const weather = await weatherRes.json();

      if (!weather.current_weather) {
        setError("Weather unavailable.");
        setLoading(false);
        return;
      }

      setResult({
        location: place,
        temperature: weather.current_weather.temperature,
        windspeed: weather.current_weather.windspeed,
        weathercode: weather.current_weather.weathercode,
        time: weather.current_weather.time,
      });
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const condition = result ? getCondition(result.weathercode) : null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 flex items-center justify-center px-4">
      <main className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-slate-800">
            Weather <span className="text-gradient">Now</span>
          </h1>
          <p className="mt-2 text-slate-600">
            Get live weather updates anywhere 🌍
          </p>
        </header>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 mb-4"
        >
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-3 font-semibold text-white shadow-md hover:from-indigo-500 hover:to-sky-400 transition active-press disabled:opacity-50"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-100 text-red-700 px-4 py-3 animate-pulseError">
            {error}
          </div>
        )}

        {/* Weather Result */}
        {result && (
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-white to-slate-100 shadow-lg p-6 animate-fadeIn">
            <div className="flex flex-col items-center">
              <div className="text-6xl">{condition.emoji}</div>
              <h2 className="mt-2 text-xl font-bold text-slate-800">
                {formatLocation(result.location)}
              </h2>
              <p className="text-slate-500 text-sm">
                {new Date(result.time).toLocaleString()}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-sky-50 p-4 text-center shadow hover-scale">
                <div className="text-3xl font-bold text-sky-700">
                  {Math.round(result.temperature)}°C
                </div>
                <div className="mt-1 text-slate-600">Temperature</div>
              </div>
              <div className="rounded-xl bg-indigo-50 p-4 text-center shadow hover-scale">
                <div className="text-3xl font-bold text-indigo-700">
                  {Math.round(result.windspeed)} km/h
                </div>
                <div className="mt-1 text-slate-600">Wind Speed</div>
              </div>
              <div className="rounded-xl bg-yellow-50 p-4 text-center shadow hover-scale">
                <div className="text-xl font-bold text-yellow-700">
                  {condition.label}
                </div>
                <div className="mt-1 text-slate-600">Condition</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-6 text-slate-500 text-xs">
          Candidate ID: <span className="font-semibold">Naukri0925</span>
        </footer>
      </main>
    </div>
  );
}
