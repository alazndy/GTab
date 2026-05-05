import React, { useState, useEffect, useCallback } from 'react';
import { EnvelopeIcon, ArrowTopRightOnSquareIcon, ArrowPathIcon, PlusIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getAuthToken, fetchUnreadEmails, fetchMessageDetails, GmailMessageDetails } from '../services/googleAuthService';

interface GmailAccount {
  email: string;
  token: string;
  messages: GmailMessageDetails[];
  loading: boolean;
  error: string | null;
}

const GmailWidget: React.FC = () => {
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const activeAccount = accounts[activeAccountIndex];

  const addNewAccount = async () => {
    try {
      const token = await getAuthToken(true);
      const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = await resp.json();
      const email = profile.email;

      const existingIdx = accounts.findIndex(a => a.email === email);
      if (existingIdx !== -1) {
        setActiveAccountIndex(existingIdx);
        loadEmailsForAccount(existingIdx, token);
        return;
      }

      const newAcc: GmailAccount = {
        email,
        token,
        messages: [],
        loading: true,
        error: null
      };

      const newAccounts = [...accounts, newAcc];
      setAccounts(newAccounts);
      const newIdx = newAccounts.length - 1;
      setActiveAccountIndex(newIdx);
      loadEmailsForAccount(newIdx, token);
      
      const emailsToStore = newAccounts.map(a => a.email);
      localStorage.setItem('gtab_gmail_accounts', JSON.stringify(emailsToStore));
    } catch (err) {
      console.error('Failed to add account', err);
    }
  };

  const removeAccount = (index: number) => {
    const newAccounts = accounts.filter((_, i) => i !== index);
    setAccounts(newAccounts);
    if (activeAccountIndex >= newAccounts.length) {
      setActiveAccountIndex(Math.max(0, newAccounts.length - 1));
    }
    const emailsToStore = newAccounts.map(a => a.email);
    localStorage.setItem('gtab_gmail_accounts', JSON.stringify(emailsToStore));
  };

  const loadEmailsForAccount = async (index: number, manualToken?: string) => {
    setAccounts(prev => prev.map((a, i) => i === index ? { ...a, loading: true, error: null } : a));
    
    try {
      const account = accounts[index] || { token: manualToken };
      const token = manualToken || account.token || await getAuthToken(false);
      
      const data = await fetchUnreadEmails(token);
      let details: GmailMessageDetails[] = [];
      
      if (data.messages && data.messages.length > 0) {
        details = await Promise.all(
          data.messages.map(msg => fetchMessageDetails(token, msg.id))
        );
      }

      setAccounts(prev => {
        const next = prev.map((a, i) => i === index ? { ...a, token, messages: details, loading: false, error: null } : a);
        
        // --- Auto Switch to Most Recent ---
        // Find account with the globally latest message across all accounts
        let newestDate = 0;
        let newestIdx = activeAccountIndex;

        next.forEach((acc, idx) => {
          if (acc.messages.length > 0) {
            const accNewest = Math.max(...acc.messages.map(m => parseInt(m.internalDate)));
            if (accNewest > newestDate) {
              newestDate = accNewest;
              newestIdx = idx;
            }
          }
        });

        if (newestIdx !== activeAccountIndex) {
          setActiveAccountIndex(newestIdx);
        }

        const total = next.reduce((s, a) => s + a.messages.length, 0);
        localStorage.setItem('gtab_status_gmail_unread', String(total));
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const emails = next.flatMap(a => a.messages).slice(0, 10).map(m => ({
            id: m.id, subject: m.subject || '(Konu yok)', from: m.from, snippet: m.snippet
          }));
          chrome.storage.local.set({ gtab_status_emails: emails });
        }
        return next;
      });
    } catch (err: any) {
      setAccounts(prev => prev.map((a, i) => i === index ? { ...a, loading: false, error: 'Yüklenemedi' } : a));
    }
  };

  const refreshAll = useCallback(async () => {
    accounts.forEach((_, i) => loadEmailsForAccount(i));
  }, [accounts.length]);

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('gtab_gmail_accounts');
      if (stored) {
        try {
          const emails = JSON.parse(stored) as string[];
          if (emails.length > 0) {
            const initialAccounts = emails.map(email => ({
              email,
              token: '',
              messages: [],
              loading: true,
              error: null
            }));
            setAccounts(initialAccounts);
            // Load all accounts to find the most recent one
            emails.forEach((_, i) => loadEmailsForAccount(i));
          }
        } catch (e) {
          console.error('Failed to parse stored accounts', e);
        }
      }
      setIsInitialLoading(false);
    };
    init();

    // Auto refresh every 2 minutes
    const timer = setInterval(refreshAll, 2 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSender = (from: string) => {
    const match = from.match(/^(.*?)\s*<.*>$/);
    return match ? match[1] : from;
  };

  if (accounts.length === 0 && !isInitialLoading) {
    return (
      <div className="w-full h-full animate-slide-up">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col items-center justify-center text-center gap-4 h-full">
          <EnvelopeIcon className="w-8 h-8 text-red-400 opacity-50" />
          <div>
            <h3 className="text-sm font-medium text-white">Gmail</h3>
            <p className="text-xs text-white/40 mt-1">Okunmamış e-postalarınızı görmek için hesap ekleyin.</p>
          </div>
          <button
            onClick={addNewAccount}
            className="w-full max-w-[200px] py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Hesap Ekle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-slide-up">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
        
        {/* Account Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border-b border-white/10 overflow-x-auto no-scrollbar">
          {accounts.map((acc, i) => (
            <div key={acc.email} className="relative group shrink-0">
              <button
                onClick={() => setActiveAccountIndex(i)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-2 ${
                  i === activeAccountIndex 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white/60 border border-transparent'
                }`}
                title={acc.email}
              >
                <UserCircleIcon className="w-3 h-3" />
                <span className="max-w-[80px] truncate">{acc.email.split('@')[0]}</span>
                {acc.messages.length > 0 && (
                  <span className="bg-red-500 text-white text-[8px] px-1 rounded-full">{acc.messages.length}</span>
                )}
              </button>
              {accounts.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); removeAccount(i); }}
                  className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                >
                  <XMarkIcon className="w-2 h-2" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addNewAccount}
            className="p-1.5 rounded-lg text-white/30 hover:bg-white/5 hover:text-white/60 transition-all shrink-0"
            title="Hesap Ekle"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
          
          <div className="flex-1" />
          
          <button 
            onClick={() => loadEmailsForAccount(activeAccountIndex)}
            className="p-1.5 text-white/30 hover:text-red-300 transition-colors shrink-0"
            title="Yenile"
          >
            <ArrowPathIcon className={`w-3 h-3 ${activeAccount?.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {activeAccount?.error ? (
            <div className="text-center py-6 text-red-400/60 text-xs italic flex flex-col items-center gap-2">
              <span>{activeAccount.error}</span>
              <button onClick={() => loadEmailsForAccount(activeAccountIndex)} className="text-white/40 hover:text-white underline">Yeniden Dene</button>
            </div>
          ) : activeAccount?.loading && activeAccount?.messages.length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs italic">
              Yükleniyor...
            </div>
          ) : activeAccount?.messages.length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs italic">
              Okunmamış ileti yok.
            </div>
          ) : (
            activeAccount?.messages.map(email => (
              <a 
                key={email.id} 
                href={`https://mail.google.com/mail/#inbox/${email.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-0.5 p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex-1 text-xs font-bold text-white/90 truncate">
                    {formatSender(email.from)}
                  </span>
                  <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5 text-white/0 group-hover:text-white/20 transition-all" />
                </div>
                <span className="text-[10px] text-white/70 truncate">
                  {email.subject || '(Konu yok)'}
                </span>
                {import.meta.env.VITE_EDITION !== 'store' && email.snippet && (
                  <span className="text-[10px] text-white/30 line-clamp-1">
                    {email.snippet}
                  </span>
                )}
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GmailWidget;
