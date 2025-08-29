import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

const replacePlaceholders = ({
  sourceUrl,
  descUrl,
  pattern,
}: {
  sourceUrl: string;
  descUrl: string;
  pattern: string;
}): string => {
  const reg = new RegExp(pattern);
  const capturedValues = reg.exec(sourceUrl);
  // Use replace with a regex that finds $ followed by one or more digits
  // The callback function gets the full match (e.g., "$1") and the captured digit (e.g., "1")
  return descUrl.replace(/\$(\d+)/g, (match: string, digit: string) => {
    const index = parseInt(digit, 10); // Convert digit string to number
    // Check if the index is valid for our values array
    if (capturedValues && index > 0 && index <= capturedValues.length) {
      // Arrays are 0-indexed, so match[1] corresponds to values[0]
      // We need index - 1 to map $1 to values[0], $2 to values[1], etc.
      return capturedValues[index];
    }
    // If the index is out of bounds, return the original placeholder or an empty string
    return match; // Or return '' if you want to remove invalid placeholders
  });
};

const redirectedTabs = new Map();
chrome.webNavigation.onBeforeNavigate.addListener(
  async details => {
    const { url, tabId, frameId } = details;
    if (frameId !== 0) return; // Only main frame

    // Already redirected? skip
    if (redirectedTabs.get(tabId) === url) {
      redirectedTabs.delete(tabId);
      return;
    }

    const data = await chrome.storage.local.get('mockConfigs');
    const rules = data.mockConfigs || [];
    console.log('match rule ', rules);
    for (const rule of rules) {
      const pattern = new RegExp(rule.redirectIncludePattern);
      if (rule.isRedirect && pattern.test(url)) {
        const redirectUrl = replacePlaceholders({
          sourceUrl: rule.redirectExampleURL,
          pattern: rule.redirectIncludePattern,
          descUrl: rule.redirectToURL,
        });
        redirectedTabs.set(tabId, redirectUrl);
        console.log('redirectUrl', redirectUrl);
        chrome.tabs.update(tabId, { url: redirectUrl });
        break;
      }
    }
  },
  { url: [{ urlMatches: '.*' }] },
);
