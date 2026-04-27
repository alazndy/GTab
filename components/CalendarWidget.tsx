import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon, ArrowTopRightOnSquareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CalendarEvent } from '../types';
import { getAuthToken, fetchUpcomingEvents } from '../services/googleAuthService';

const CalendarWidget: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const loadEvents = async (interactive = false) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken(interactive);
      setAuthorized(true);
      const data = await fetchUpcomingEvents(token);
      setEvents(data.items || []);
    } catch (err: any) {
      if (err.message !== 'No token' && !err.message.includes('User interaction required')) {
        setError('Etkinlikler yüklenemedi.');
        console.error(err);
      }
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(false);
  }, []);

  const formatTime = (dateTimeStr?: string, dateStr?: string) => {
    if (dateTimeStr) {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (dateStr) return 'Tüm gün';
    return '';
  };

  const isToday = (dateTimeStr?: string, dateStr?: string) => {
    const today = new Date().toDateString();
    if (dateTimeStr) return new Date(dateTimeStr).toDateString() === today;
    if (dateStr) return new Date(dateStr).toDateString() === today;
    return false;
  };

  if (!authorized && !loading) {
    return (
      <div className="w-64 animate-slide-up">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
          <CalendarDaysIcon className="w-8 h-8 text-blue-400 opacity-50" />
          <div>
            <h3 className="text-sm font-medium text-white">Google Takvim</h3>
            <p className="text-xs text-white/40 mt-1">Etkinliklerinizi görmek için giriş yapın.</p>
          </div>
          <button
            onClick={() => loadEvents(true)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Google ile Bağlan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 animate-slide-up">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-white">
            <CalendarDaysIcon className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-sm">Takvim</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => loadEvents(false)}
              className="text-white/30 hover:text-blue-300 transition-colors"
              title="Yenile"
            >
              <ArrowPathIcon className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a 
              href="https://calendar.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/30 hover:text-blue-300 transition-colors"
              title="Google Takvim'i Aç"
            >
              <ArrowTopRightOnSquareIcon className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {error ? (
            <div className="text-center py-6 text-red-400/60 text-xs italic">
              {error}
            </div>
          ) : loading && events.length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs italic">
              Yükleniyor...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs italic">
              Yaklaşan etkinlik yok.
            </div>
          ) : (
            events.map(event => (
              <div 
                key={event.id} 
                className="group flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex-1 text-xs font-medium text-white/90 truncate">
                    {event.summary}
                  </span>
                  <span className={`text-[10px] shrink-0 ${isToday(event.start.dateTime, event.start.date) ? 'text-blue-400 font-bold' : 'text-white/40'}`}>
                    {formatTime(event.start.dateTime, event.start.date)}
                  </span>
                </div>
                {event.location && (
                  <span className="text-[10px] text-white/30 truncate">
                    {event.location}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
