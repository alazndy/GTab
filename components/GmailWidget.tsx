import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EnvelopeIcon, ArrowTopRightOnSquareIcon, ArrowPathIcon, PlusIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  AUTH_REQUIRED, authenticate, getAuthToken, storeToken, invalidateToken,
  fetchUnreadEmails, fetchMessageDetails, GmailMessageDetails,
} from '../services/googleAuthService';

interface GmailAccount {
  email: string;
  messages: GmailMessageDetails[];
  loading: boolean;
  error: string | null;
  needsLogin: boolean;
}

const ACCOUNTS_KEY = 'gtab_gmail_accounts';
const REFRESH_MS = 2 * 60 * 1000;

const readStoredEmails = (): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((e): e is string => typeof e === 'string' && e.length > 0) : [];
  } catch {
    return [];
  }
};

const newAccount = (email: string): GmailAccount => ({ email, messages: [], loading: true, error: null, needsLogin: false });

const newestDate = (messages: GmailMessageDetails[]) =>
  messages.reduce((max, m) => Math.max(max, Number(m.internalDate) || 0), 0);

const formatSender = (from: string) => {
  const match = from.match(/^(.*?)\s*<.*>$/);
  return match ? match[1].replace(/^"|"$/g, '') : from;
};

const GmailWidget: React.FC = () => {
  const [accounts, setAccounts] = useState<GmailAccount[]>(() => readStoredEmails().map(newAccount));
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const accountsRef = useRef(accounts);

  useEffect(() => { accountsRef.current = accounts; }, [accounts]);

  const emailList = accounts.map(a => a.email).join('\n');
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(emailList ? emailList.split('\n') : []));
    } catch {
      // Storage full or blocked: the account list is rebuilt on the next login.
    }
  }, [emailList]);

  const patchAccount = useCallback((email: string, update: Partial<GmailAccount>) => {
    setAccounts(prev => prev.map(a => (a.email === email ? { ...a, ...update } : a)));
  }, []);

  const loadAccount = useCallback(async (email: string): Promise<GmailMessageDetails[]> => {
    patchAccount(email, { loading: true, error: null });
    try {
      // login_hint makes Google return a token for this exact account, not the browser's default one.
      const auth = { loginHint: email };
      const list = await fetchUnreadEmails(auth);
      const details = list.messages?.length
        ? await Promise.all(list.messages.map(m => fetchMessageDetails(m.id, auth)))
        : [];
      patchAccount(email, { messages: details, loading: false, needsLogin: false });
      return details;
    } catch (err) {
      const needsLogin = err instanceof Error && err.message === AUTH_REQUIRED;
      patchAccount(email, { loading: false, needsLogin, error: needsLogin ? 'Bu hesap için giriş gerekli.' : 'Yüklenemedi' });
      return [];
    }
  }, [patchAccount]);

  useEffect(() => {
    let cancelled = false;
    const emails = accountsRef.current.map(a => a.email);

    // On open, show the account with the most recent unread mail.
    Promise.all(emails.map(async email => ({ email, newest: newestDate(await loadAccount(email)) }))).then(results => {
      if (cancelled || results.length === 0) return;
      const best = results.reduce((a, b) => (b.newest > a.newest ? b : a));
      setActiveEmail(prev => prev ?? best.email);
    });

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      accountsRef.current.forEach(a => { if (!a.needsLogin) loadAccount(a.email); });
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [loadAccount]);

  const addNewAccount = async () => {
    try {
      const entry = await authenticate({ interactive: true });
      const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${entry.token}` },
      });
      if (!resp.ok) throw new Error(`userinfo ${resp.status}`);
      const profile = await resp.json();
      const email = typeof profile.email === 'string' ? profile.email : '';
      if (!email) throw new Error('Google did not return an e-mail address');

      await storeToken(email, entry);
      setAccounts(prev => (prev.some(a => a.email === email) ? prev : [...prev, newAccount(email)]));
      setActiveEmail(email);
      loadAccount(email);
    } catch (err) {
      console.error('Failed to add account', err);
    }
  };

  const reconnect = async (email: string) => {
    try {
      await getAuthToken({ interactive: true, loginHint: email });
      loadAccount(email);
    } catch (err) {
      console.error('Failed to reconnect account', err);
    }
  };

  const removeAccount = (email: string) => {
    setAccounts(prev => prev.filter(a => a.email !== email));
    setActiveEmail(prev => (prev === email ? null : prev));
    invalidateToken(email);
  };

  const activeAccount = accounts.find(a => a.email === activeEmail) ?? accounts[0];

  if (accounts.length === 0) {
    return (
      <div className="w-full h-full animate-slide-up">
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col items-center justify-center text-center gap-4 h-full">
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
      <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">

        {/* Account Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border-b border-white/10 overflow-x-auto no-scrollbar">
          {accounts.map(acc => (
            <div key={acc.email} className="relative group shrink-0">
              <button
                onClick={() => setActiveEmail(acc.email)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-2 ${
                  acc.email === activeAccount?.email
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
                  onClick={(e) => { e.stopPropagation(); removeAccount(acc.email); }}
                  className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                  title="Hesabı kaldır"
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
            onClick={() => activeAccount && loadAccount(activeAccount.email)}
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
              <button
                onClick={() => (activeAccount.needsLogin ? reconnect(activeAccount.email) : loadAccount(activeAccount.email))}
                className="text-white/40 hover:text-white underline"
              >
                {activeAccount.needsLogin ? 'Giriş Yap' : 'Yeniden Dene'}
              </button>
            </div>
          ) : activeAccount?.loading && activeAccount.messages.length === 0 ? (
            <div className="text-center py-6 text-white/45 text-xs">
              Yükleniyor...
            </div>
          ) : activeAccount?.messages.length === 0 ? (
            <div className="text-center py-6 text-white/45 text-xs">
              Okunmamış ileti yok.
            </div>
          ) : (
            activeAccount?.messages.map(email => (
              <a
                key={email.id}
                href={`https://mail.google.com/mail/?authuser=${encodeURIComponent(activeAccount.email)}#inbox/${encodeURIComponent(email.id)}`}
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
