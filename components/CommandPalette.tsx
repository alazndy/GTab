import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, MessageSquare, Terminal, X, Loader2, Sparkles, Timer, Plus, Settings } from 'lucide-react';
import { useGTab } from '../context/GTabContext';
import { generateResponse } from '../services/aiService';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  action: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { 
    addShortcuts, 
    addTask,
    setIsModalOpen, 
    aiConfig,
    setIsEditMode,
    isEditMode 
  } = useGTab();
  
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResponse(null);
      setIsLoading(false);
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const executeCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();

    // 1. Pomodoro Actions
    if (cmd === 'pomodoro start') {
      window.dispatchEvent(new CustomEvent('gtab:pomodoro', { detail: 'start' }));
      onClose();
      return;
    }
    if (cmd === 'pomodoro stop') {
      window.dispatchEvent(new CustomEvent('gtab:pomodoro', { detail: 'stop' }));
      onClose();
      return;
    }

    // 2. Add Task Action
    if (cmd.startsWith('add task ')) {
      const taskText = command.slice(9).trim();
      if (taskText) {
        addTask(taskText);
        onClose();
      }
      return;
    }

    // 3. Settings Action
    if (cmd === 'open settings') {
      setIsModalOpen(true);
      onClose();
      return;
    }

    // 4. Edit Mode Action
    if (cmd === 'toggle edit' || cmd === 'edit mode') {
      setIsEditMode(!isEditMode);
      onClose();
      return;
    }

    // 5. Default to AI
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await generateResponse(command, aiConfig.geminiApiKey);
      setResponse(res);
    } catch (error) {
      setResponse(error instanceof Error ? error.message : 'AI generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions: Suggestion[] = [
    { id: 'pomo-start', icon: <Timer className="w-4 h-4" />, label: 'Pomodoro: Start Timer', action: () => executeCommand('pomodoro start') },
    { id: 'pomo-stop', icon: <Timer className="w-4 h-4" />, label: 'Pomodoro: Stop Timer', action: () => executeCommand('pomodoro stop') },
    { id: 'add-task', icon: <Plus className="w-4 h-4" />, label: 'Add Task: [text]', action: () => inputRef.current?.focus() },
    { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Settings: Open Settings', action: () => executeCommand('open settings') },
  ];

  const filteredSuggestions = suggestions.filter(
    s => s.label.toLowerCase().includes(query.toLowerCase()) || query === ''
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter') {
      if (filteredSuggestions.length > 0 && activeIndex < filteredSuggestions.length) {
        filteredSuggestions[activeIndex].action();
      } else if (query.trim()) {
        executeCommand(query);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Input Area */}
            <div className="flex items-center px-4 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-white/40 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command (e.g. 'pomodoro start') or ask AI..."
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-white/20"
              />
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                ) : (
                  <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white/40 font-mono">
                    <Command className="w-2.5 h-2.5" />
                    <span>Enter</span>
                  </kbd>
                )}
                <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div 
              ref={scrollRef}
              className="max-h-[60vh] overflow-y-auto custom-scrollbar"
            >
              {/* AI Response */}
              {response && (
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-3 text-white/40 text-xs font-medium uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Assistant</span>
                  </div>
                  <div className="text-white/90 leading-relaxed text-sm prose prose-invert max-w-none">
                    {response.split('\n').map((line, i) => (
                      <p key={i} className={line.trim() === '' ? 'h-4' : 'mb-2'}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {!response && !isLoading && (
                <div className="p-2">
                  <div className="px-3 py-2 text-[10px] font-semibold text-white/20 uppercase tracking-widest">
                    Quick Commands
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {filteredSuggestions.map((s, i) => {
                      const isActive = i === activeIndex;
                      return (
                        <button
                          key={s.id}
                          onClick={s.action}
                          className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all group text-left ${
                            isActive ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10'
                            }`}>
                              {s.icon}
                            </div>
                            <div>
                              <div className={`text-sm transition-colors ${
                                isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                              }`}>
                                {s.label}
                              </div>
                            </div>
                          </div>
                          <Terminal className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-white/30' : 'text-white/10 group-hover:text-white/30'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State / AI Mode Hint */}
              {query && !response && !isLoading && suggestions.filter(s => s.label.toLowerCase().includes(query.toLowerCase())).length === 0 && (
                <div className="p-12 text-center">
                  <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-4" />
                  <div className="text-white/40 text-sm">
                    Press <span className="text-white/60 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Enter</span> to ask AI about "{query}"
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-medium">
                  <span className="px-1 py-0.5 bg-white/5 rounded border border-white/10">↑↓</span>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-medium">
                  <span className="px-1 py-0.5 bg-white/5 rounded border border-white/10">ESC</span>
                  <span>Close</span>
                </div>
              </div>
              <div className="text-[10px] text-white/20 font-medium flex items-center gap-1.5">
                Powered by Gemini 1.5 Flash
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
