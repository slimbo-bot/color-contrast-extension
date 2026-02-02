// Content script for picking colors from page
let isPicking = false;

function getComputedColor(element, property) {
  return window.getComputedStyle(element).getPropertyValue(property).trim();
}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return null;

  const [r, g, b] = result.map(Number);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function pickColor(event) {
  event.preventDefault();
  event.stopPropagation();

  const element = event.target;

  // Get foreground and background colors
  const foreground = rgbToHex(getComputedColor(element, 'color'));
  let background = rgbToHex(getComputedColor(element, 'background-color'));

  // If background is transparent, use parent's background
  if (!background || background === 'transparent' || background === '#00000000') {
    const parent = element.parentElement;
    if (parent) {
      const parentBg = rgbToHex(getComputedColor(parent, 'background-color'));
      if (parentBg && parentBg !== 'transparent' && parentBg !== '#00000000') {
        background = parentBg;
      }
    }
  }

  // If still no background, try body
  if (!background || background === 'transparent' || background === '#00000000') {
    const body = document.body;
    if (body) {
      const bodyBg = rgbToHex(getComputedColor(body, 'background-color'));
      if (bodyBg && bodyBg !== 'transparent' && bodyBg !== '#00000000') {
        background = bodyBg;
      }
    }
  }

  // If we have both colors, send them
  if (foreground && background) {
    sendColors(foreground, background);
  }

  stopColorPicking();
}

function sendColors(foreground, background) {
  chrome.runtime.sendMessage({
    type: 'colorsSelected',
    foreground: foreground,
    background: background
  });
}

function startColorPicking() {
  isPicking = true;
  document.body.style.cursor = 'crosshair';
  document.body.addEventListener('click', pickColor, true);
  document.body.addEventListener('mouseover', highlightElement, true);
}

function stopColorPicking() {
  isPicking = false;
  document.body.style.cursor = 'default';
  document.body.removeEventListener('click', pickColor, true);
  document.body.removeEventListener('mouseover', highlightElement, true);

  // Remove all highlights
  const highlights = document.querySelectorAll('[data-contrast-highlight]');
  highlights.forEach(el => {
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.removeAttribute('data-contrast-highlight');
  });
}

function highlightElement(event) {
  if (!isPicking) return;

  const element = event.target;

  // Remove previous highlights
  document.querySelectorAll('[data-contrast-highlight]').forEach(el => {
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.removeAttribute('data-contrast-highlight');
  });

  // Add highlight to current element
  element.style.outline = '3px solid #2563eb';
  element.style.outlineOffset = '2px';
  element.setAttribute('data-contrast-highlight', 'true');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startColorPicking') {
    startColorPicking();
    sendResponse({ success: true });
  } else if (message.action === 'stopColorPicking') {
    stopColorPicking();
    sendResponse({ success: true });
  }
});

// Handle escape key to cancel
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isPicking) {
    stopColorPicking();
    chrome.runtime.sendMessage({ type: 'colorPickingCancelled' });
  }
});

// Notify when content script is loaded
chrome.runtime.sendMessage({ type: 'contentScriptLoaded' });
