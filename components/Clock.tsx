import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="text-center text-white drop-shadow-md mb-8 animate-fade-in select-none">
      <h1 className="text-8xl font-light tracking-tighter">{formatTime(time)}</h1>
      <p className="text-xl font-medium opacity-90 mt-2">{formatDate(time)}</p>
    </div>
  );
};

export default Clock;