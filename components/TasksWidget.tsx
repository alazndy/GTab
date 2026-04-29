import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, PlusIcon, TrashIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { Task } from '../types';
import { getTasks, saveTasks } from '../services/storageService';

const TasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());
  const [newTaskText, setNewTaskText] = useState('');

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
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], completed: !next[idx].completed };
      return next;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full min-w-[200px]">
      {/* Header - Minimal because wrapper already has a label in edit mode */}
      <div className="flex items-center gap-2 mb-4 text-white/90">
        <ListBulletIcon className="w-5 h-5 text-blue-400" />
        <span className="font-semibold text-sm tracking-wide">Yapılacaklar</span>
      </div>

      {/* Input */}
      <form onSubmit={addTask} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Yeni görev..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
        />
        <button 
          type="submit"
          disabled={!newTaskText.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-all disabled:opacity-50 disabled:grayscale"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </form>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-white/10 text-sm italic">
            Henüz görev eklenmemiş.
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className={`transition-all shrink-0 ${task.completed ? 'text-green-400' : 'text-white/20 hover:text-white/40'}`}
              >
                {task.completed ? <CheckCircleSolid className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
              </button>
              
              <span className={`flex-1 text-sm text-white/80 transition-all ${task.completed ? 'line-through opacity-30' : ''}`}>
                {task.text}
              </span>

              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-white/10 hover:text-red-400 transition-all shrink-0"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksWidget;
