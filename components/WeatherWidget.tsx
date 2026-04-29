import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface WeatherInfo {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  code: number;
  city: string;
  cachedAt: number;
}

const WMO_EMOJI: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
  80: '🌦️', 81: '🌦️', 82: '🌦️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

const WMO_DESC: Record<number, string> = {
  0: 'Açık', 1: 'Açık', 2: 'Parçalı bulutlu', 3: 'Bulutlu',
  45: 'Sisli', 48: 'Sisli',
  51: 'Hafif çisenti', 53: 'Çisenti', 55: 'Yoğun çisenti',
  61: 'Hafif yağmur', 63: 'Yağmur', 65: 'Yoğun yağmur',
  71: 'Hafif kar', 73: 'Kar', 75: 'Yoğun kar', 77: 'Kar taneleri',
  80: 'Sağanak', 81: 'Sağanak', 82: 'Yoğun sağanak',
  85: 'Kar sağanağı', 86: 'Kar sağanağı',
  95: 'Fırtına', 96: 'Fırtına', 99: 'Fırtına',
};

const getEmoji = (code: number) => WMO_EMOJI[code] ?? '🌡️';
const getDesc = (code: number) => WMO_DESC[code] ?? 'Bilinmiyor';

const CACHE_KEY = 'gtab_weather_v2';
const CACHE_TTL = 30 * 60 * 1000;

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: WeatherInfo = JSON.parse(cached);
        if (Date.now() - data.cachedAt < CACHE_TTL) {
          setWeather(data);
          setLoading(false);
          return;
        }
      }
    }

    setLoading(true);
    setError(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });

      const { latitude: lat, longitude: lon } = pos.coords;

      const [weatherRes, geoRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
        ),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: { 'User-Agent': 'GTab-Extension/4.2' }
        })
      ]);

      const wd = await weatherRes.json();
      const gd = await geoRes.json();

      const city =
        gd.address?.city ||
        gd.address?.town ||
        gd.address?.village ||
        gd.address?.county ||
        'Konum';

      const c = wd.current;
      const info: WeatherInfo = {
        temp: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        code: c.weather_code,
        city,
        cachedAt: Date.now(),
      };

      setWeather(info);
      localStorage.setItem(CACHE_KEY, JSON.stringify(info));
    } catch (e: any) {
      if (e.code === 1) {
        setError('Konum izni reddedildi.');
      } else {
        setError('Hava durumu yüklenemedi.');
      }
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setWeather(JSON.parse(cached));
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    const timer = setInterval(() => loadWeather(), CACHE_TTL);
    return () => clearInterval(timer);
  }, [loadWeather]);

  if (loading && !weather) {
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center">
        <div className="text-white/30 text-xs">Konum alınıyor...</div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center">
        <MapPinIcon className="w-8 h-8 text-white/20" />
        <p className="text-xs text-white/50">{error}</p>
        <button
          onClick={() => loadWeather(true)}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-1">
        <span className="text-6xl leading-none">{getEmoji(weather!.code)}</span>
        <div className="flex items-end gap-1 mt-2">
          <span className="text-5xl font-thin text-white">{weather!.temp}</span>
          <span className="text-xl text-white/50 mb-1">°C</span>
        </div>
        <p className="text-sm text-white/70 mt-0.5">{getDesc(weather!.code)}</p>
        <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
          <MapPinIcon className="w-3 h-3" />
          <span>{weather!.city}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/10">
        <div className="flex flex-col items-center py-2.5 gap-0.5">
          <span className="text-[10px] text-white/30 uppercase tracking-wide">Hissedilen</span>
          <span className="text-sm font-medium text-white/70">{weather!.feelsLike}°</span>
        </div>
        <div className="flex flex-col items-center py-2.5 gap-0.5">
          <span className="text-[10px] text-white/30 uppercase tracking-wide">Nem</span>
          <span className="text-sm font-medium text-white/70">{weather!.humidity}%</span>
        </div>
        <div className="flex flex-col items-center py-2.5 gap-0.5">
          <span className="text-[10px] text-white/30 uppercase tracking-wide">Rüzgar</span>
          <span className="text-sm font-medium text-white/70">{weather!.windSpeed} km/h</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/5">
        <span className="text-[10px] text-white/20">
          {weather?.cachedAt
            ? new Date(weather.cachedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
        <button
          onClick={() => loadWeather(true)}
          disabled={loading}
          className="p-1 text-white/20 hover:text-white/50 transition-colors"
        >
          <ArrowPathIcon className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default WeatherWidget;
