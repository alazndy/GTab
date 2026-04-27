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

export const fetchUnreadEmails = async (token: string) => {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=5', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch emails');
  return response.json();
};

export const fetchUpcomingEvents = async (token: string) => {
  const timeMin = new Date().toISOString();
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=5&orderBy=startTime&singleEvents=true`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch calendar');
  return response.json();
};
