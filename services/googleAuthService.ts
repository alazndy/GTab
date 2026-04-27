import { GmailListResponse, CalendarListResponse } from '../types';

export const getAuthToken = (interactive = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (result) => {
      if (chrome.runtime.lastError || !result) {
        reject(chrome.runtime.lastError || new Error('No token'));
      } else {
        const token = typeof result === 'string' ? result : (result as any).token;
        if (!token) {
          reject(new Error('No token in result'));
        } else {
          resolve(token);
        }
      }
    });
  });
};

export const fetchUnreadEmails = async (token: string): Promise<GmailListResponse> => {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=5', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gmail API Error: ${response.statusText}`);
  }
  
  return response.json();
};

export interface GmailMessageDetails {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
}

export const fetchMessageDetails = async (token: string, messageId: string): Promise<GmailMessageDetails> => {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error(`Gmail API Error: ${response.statusText}`);
  }
  
  const data = await response.json();
  const headers = data.payload.headers;
  
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
  
  return {
    id: data.id,
    snippet: data.snippet,
    subject: getHeader('subject'),
    from: getHeader('from'),
    date: getHeader('date')
  };
};

export const fetchUpcomingEvents = async (token: string): Promise<CalendarListResponse> => {
  const timeMin = new Date().toISOString();
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=5&orderBy=startTime&singleEvents=true`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Calendar API Error: ${response.statusText}`);
  }
  
  return response.json();
};
