const MENU_ID = 'gtab-add-link';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "GTab'a ekle",
    contexts: ['link'],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === MENU_ID && info.linkUrl) {
    chrome.storage.local.set({ gtab_pending_url: info.linkUrl });
  }
});
