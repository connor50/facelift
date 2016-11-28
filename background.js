// Disable javascript for all pages on domain

chrome.contentSettings.javascript.set({
  primaryPattern: '*://www.thedailymash.co.uk/*',
  setting: 'block'
});
