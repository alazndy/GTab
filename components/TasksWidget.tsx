
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, PlusIcon, TrashIcon, ArrowTopRightOnSquareIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { Task } from '../types';
import { getTasks, saveTasks } from '../services/storageService';

const TasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      completed: false,
      createdAt: Date.now()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="w-64 animate-slide-up">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[400px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-white">
            <ListBulletIcon className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-sm">Görevler</span>
          </div>
          <a 
            href="https://tasks.google.com/embed/?origin=https://mail.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/30 hover:text-blue-300 transition-colors"
            title="Google Görevler'i Aç"
          >
            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          </a>
        </div>

        {/* Input */}
        <form onSubmit={addTask} className="p-2 border-b border-white/10 flex gap-1">
          <input
            id="new-task-input"
            name="task"
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Ekle..."
            className="flex-1 bg-black/20 border-none rounded-md px-2 py-1.5 text-xs text-white placeholder-white/30 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={!newTaskText.trim()}
            title="Görev Ekle"
            aria-label="Görev Ekle"
            className="bg-blue-600/80 hover:bg-blue-500 text-white p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs italic">
              Görev yok.
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className="group flex items-center gap-2 p-1.5 rounded-md hover:bg-white/5 transition-colors"
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  title={task.completed ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}
                  className={`transition-colors shrink-0 ${task.completed ? 'text-green-400' : 'text-white/30 hover:text-white'}`}
                >
                  {task.completed ? <CheckCircleSolid className="w-3.5 h-3.5" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                </button>
                
                <span className={`flex-1 text-xs text-white/90 transition-all truncate ${task.completed ? 'line-through opacity-40' : ''}`}>
                  {task.text}
                </span>

                <button 
                  onClick={() => deleteTask(task.id)}
                  title="Görevi Sil"
                  aria-label="Görevi Sil"
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-white/20 hover:text-red-400 transition-all shrink-0"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksWidget;
