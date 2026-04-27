import React, { useState, useEffect } from 'react';
import { EnvelopeIcon, ArrowTopRightOnSquareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getAuthToken, fetchUnreadEmails, fetchMessageDetails, GmailMessageDetails } from '../services/googleAuthService';

const GmailWidget: React.FC = () => {
  const [emails, setEmails] = useState<GmailMessageDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const loadEmails = async (interactive = false) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken(interactive);
      setAuthorized(true);
      const data = await fetchUnreadEmails(token);
      
      if (data.messages && data.messages.length > 0) {
        const details = await Promise.all(
          data.messages.map(msg => fetchMessageDetails(token, msg.id))
        );
        setEmails(details);
      } else {
        setEmails([]);
      }
    } catch (err: any) {
      if (err.message !== 'No token' && !err.message.includes('User interaction required')) {
        setError('E-postalar yüklenemedi.');
        console.error(err);
      }
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails(false);
  }, []);

  const formatSender = (from: string) => {
    const match = from.match(/^(.*?)\s*<.*>$/);
    return match ? match[1] : from;
  };

  if (!authorized && !loading) {
    return (
      <div className="w-full h-full animate-slide-up">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col items-center justify-center text-center gap-4 h-full">
          <EnvelopeIcon className="w-8 h-8 text-red-400 opacity-50" />
          <div>
            <h3 className="text-sm font-medium text-white">Gmail</h3>
            <p className="text-xs text-white/40 mt-1">Okunmamış e-postalarınızı görmek için giriş yapın.</p>
          </div>
          <button
            onClick={() => loadEmails(true)}
            className="w-full max-w-[200px] py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Google ile Bağlan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-slide-up">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-white">
            <EnvelopeIcon className="w-4 h-4 text-red-400" />
            <span className="font-medium text-sm">Gmail</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => loadEmails(false)}
              className="text-white/30 hover:text-red-300 transition-colors"
              title="Yenile"
            >
              <ArrowPathIcon className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a 
              href="https://mail.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/30 hover:text-red-300 transition-colors"
              title="Gmail'i Aç"
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
          ) : loading && emails.length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs italic">
              Yükleniyor...
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs italic">
              Okunmamış ileti yok.
            </div>
          ) : (
            emails.map(email => (
              <div 
                key={email.id} 
                className="group flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors cursor-default"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex-1 text-xs font-bold text-white/90 truncate">
                    {formatSender(email.from)}
                  </span>
                </div>
                <span className="text-[10px] text-white/70 truncate">
                  {email.subject || '(Konu yok)'}
                </span>
                <span className="text-[10px] text-white/30 line-clamp-1">
                  {email.snippet}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GmailWidget;
