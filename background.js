chrome.commands.onCommand.addListener((command) => {
  chrome.storage.local.set({ triggerPick: Date.now() });
});
