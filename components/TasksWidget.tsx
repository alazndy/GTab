
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ExternalLink, ListTodo } from 'lucide-react';
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
            <ListTodo className="text-blue-400" size={16} />
            <span className="font-medium text-sm">Görevler</span>
          </div>
          <a 
            href="https://tasks.google.com/embed/?origin=https://mail.google.com" 
            target="_blank" 
            rel="noreferrer"
            className="text-white/30 hover:text-blue-300 transition-colors"
            title="Google Görevler'i Aç"
          >
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Input */}
        <form onSubmit={addTask} className="p-2 border-b border-white/10 flex gap-1">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Ekle..."
            className="flex-1 bg-black/20 border-none rounded-md px-2 py-1.5 text-xs text-white placeholder-white/30 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={!newTaskText.trim()}
            className="bg-blue-600/80 hover:bg-blue-500 text-white p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
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
                  className={`transition-colors shrink-0 ${task.completed ? 'text-green-400' : 'text-white/30 hover:text-white'}`}
                >
                  {task.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                </button>
                
                <span className={`flex-1 text-xs text-white/90 transition-all truncate ${task.completed ? 'line-through opacity-40' : ''}`}>
                  {task.text}
                </span>

                <button 
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-white/20 hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 size={12} />
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
