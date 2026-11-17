import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, PlusIcon, ArrowPathIcon, ListBulletIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { AUTH_REQUIRED, getAuthToken, googleFetch } from '../services/googleAuthService';

interface Task {
  id: string;
  title: string;
  status: 'needsAction' | 'completed';
  notes?: string;
  due?: string;
}

interface TaskList {
  id: string;
  title: string;
}

const TASKS_API = 'https://tasks.googleapis.com/tasks/v1';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const fetchTaskLists = async (): Promise<TaskList[]> => {
  const res = await googleFetch(`${TASKS_API}/users/@me/lists?maxResults=20`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg: string = body?.error?.message || '';
    if (res.status === 401 || res.status === 403) {
      if (msg.toLowerCase().includes('disabled') || msg.toLowerCase().includes('not been used')) {
        throw new Error('API_NOT_ENABLED');
      }
      throw new Error('REAUTH_REQUIRED');
    }
    throw new Error(`Tasks API: ${res.statusText}`);
  }
  const data = await res.json();
  return data.items || [];
};

const fetchTasks = async (listId: string): Promise<Task[]> => {
  const res = await googleFetch(
    `${TASKS_API}/lists/${encodeURIComponent(listId)}/tasks?showCompleted=false&showHidden=false&maxResults=50`
  );
  if (!res.ok) throw new Error(`Tasks API: ${res.statusText}`);
  const data = await res.json();
  return (data.items || []).filter((t: Task) => t.title);
};

const completeTask = async (listId: string, taskId: string): Promise<void> => {
  const res = await googleFetch(`${TASKS_API}/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ status: 'completed' })
  });
  if (!res.ok) throw new Error(`Tasks API: ${res.statusText}`);
};

const insertTask = async (listId: string, title: string): Promise<void> => {
  const res = await googleFetch(`${TASKS_API}/lists/${encodeURIComponent(listId)}/tasks`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error(`Tasks API: ${res.statusText}`);
};

const GoogleTasksWidget: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [showListPicker, setShowListPicker] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  const selectedList = taskLists.find(l => l.id === selectedListId);

  const loadAll = useCallback(async (interactive = false, forceConsent = false) => {
    setLoading(true);
    setError(null);
    try {
      if (interactive) await getAuthToken({ interactive: true, forceConsent });
      const lists = await fetchTaskLists();
      setConnected(true);
      setTaskLists(lists);
      const listId = selectedListId || lists[0]?.id;
      if (listId) {
        setSelectedListId(listId);
        setTasks(await fetchTasks(listId));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      if (message === AUTH_REQUIRED || message === 'REAUTH_REQUIRED' || message === 'API_NOT_ENABLED') {
        setConnected(false);
        setError(message === AUTH_REQUIRED ? 'REAUTH_REQUIRED' : message);
      } else {
        setError(message || 'Yüklenemedi');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedListId]);

  const switchList = async (listId: string) => {
    setShowListPicker(false);
    setSelectedListId(listId);
    if (!connected) return;
    setLoading(true);
    try {
      setTasks(await fetchTasks(listId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    if (!connected || !selectedListId) return;
    setCompletingIds(prev => new Set(prev).add(taskId));
    try {
      await completeTask(selectedListId, taskId);
      setTimeout(() => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setCompletingIds(prev => { const s = new Set(prev); s.delete(taskId); return s; });
      }, 400);
    } catch {
      setError('Görev tamamlanamadı.');
      setCompletingIds(prev => { const s = new Set(prev); s.delete(taskId); return s; });
    }
  };

  const handleAddTask = async () => {
    if (!connected || !selectedListId || !newTaskText.trim()) return;
    setAddingTask(true);
    try {
      await insertTask(selectedListId, newTaskText.trim());
      setNewTaskText('');
      setTasks(await fetchTasks(selectedListId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eklenemedi');
    } finally {
      setAddingTask(false);
    }
  };

  useEffect(() => { loadAll(false); }, []);

  if (loading && tasks.length === 0) {
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center">
        <div className="text-white/30 text-xs">Yükleniyor...</div>
      </div>
    );
  }

  if (error && !connected) {
    const isApiNotEnabled = error === 'API_NOT_ENABLED';
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 p-4">
        <ListBulletIcon className="w-8 h-8 text-blue-400 opacity-50" />
        <div className="text-center">
          <p className="text-sm font-medium text-white">Google Tasks</p>
          <p className="text-xs text-white/40 mt-1">
            {isApiNotEnabled
              ? 'Tasks API disabled. Google Cloud Console → APIs & Services → Enable Tasks API.'
              : 'Görevlerinizi görmek için giriş yapın.'}
          </p>
        </div>
        {!isApiNotEnabled && (
          <button
            onClick={() => loadAll(true, error === 'REAUTH_REQUIRED')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Google ile Giriş Yap
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5 shrink-0">
        <ListBulletIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <button
          onClick={() => setShowListPicker(v => !v)}
          className="flex-1 flex items-center gap-1 text-left text-xs font-medium text-white/80 hover:text-white transition-colors"
        >
          <span className="truncate">{selectedList?.title || 'Görevler'}</span>
          <ChevronDownIcon className={`w-3 h-3 shrink-0 transition-transform ${showListPicker ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={() => loadAll(false)}
          className="p-1 text-white/30 hover:text-blue-300 transition-colors"
          title="Yenile"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List picker dropdown */}
      {showListPicker && (
        <div className="absolute z-10 mt-9 left-0 right-0 bg-black/90 border border-white/10 rounded-b-xl overflow-hidden shadow-xl">
          {taskLists.map(list => (
            <button
              key={list.id}
              onClick={() => switchList(list.id)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                list.id === selectedListId
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              }`}
            >
              {list.title}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar" onClick={() => setShowListPicker(false)}>
        {error && (
          <div className="text-center py-4 text-red-400/60 text-xs">{error}</div>
        )}
        {!loading && tasks.length === 0 && !error && (
          <div className="text-center py-8 text-white/20 text-xs italic">Bekleyen görev yok.</div>
        )}
        {tasks.map(task => (
          <div
            key={task.id}
            className={`flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group transition-all ${
              completingIds.has(task.id) ? 'opacity-40 scale-95' : 'opacity-100'
            }`}
          >
            <button
              onClick={() => handleComplete(task.id)}
              className="mt-0.5 shrink-0 text-white/20 hover:text-blue-400 transition-colors"
            >
              {completingIds.has(task.id)
                ? <CheckCircleIconSolid className="w-4 h-4 text-blue-400" />
                : <CheckCircleIcon className="w-4 h-4" />
              }
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80 leading-tight">{task.title}</p>
              {task.notes && (
                <p className="text-[10px] text-white/30 mt-0.5 line-clamp-1">{task.notes}</p>
              )}
              {task.due && (
                <p className="text-[10px] text-blue-400/60 mt-0.5">
                  {new Date(task.due).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add task */}
      <div className="p-2 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 border border-white/5 focus-within:border-blue-500/40 transition-colors">
          <PlusIcon className="w-3.5 h-3.5 text-white/20 shrink-0" />
          <input
            type="text"
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Görev ekle..."
            className="flex-1 bg-transparent text-xs text-white/80 placeholder-white/20 outline-none"
          />
          {addingTask && <ArrowPathIcon className="w-3 h-3 text-white/20 animate-spin shrink-0" />}
        </div>
      </div>
    </div>
  );
};

export default GoogleTasksWidget;
