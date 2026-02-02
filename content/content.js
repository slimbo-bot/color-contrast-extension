// Content script for picking colors from the page
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
  const background = rgbToHex(getComputedColor(element, 'background-color'));

  // If background is transparent, use parent's background
  if (background === 'transparent' || background === 'rgba(0, 0, 0, 0)') {
    const parentBg = rgbToHex(getComputedColor(element.parentElement, 'background-color'));
    if (parentBg && parentBg !== 'transparent') {
      sendColors(foreground, parentBg);
    }
  } else if (foreground && background) {
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

  // Remove any highlights
  const highlights = document.querySelectorAll('[data-contrast-highlight]');
  highlights.forEach(el => {
    el.style.outline = '';
    el.removeAttribute('data-contrast-highlight');
  });
}

function highlightElement(event) {
  if (!isPicking) return;

  const element = event.target;

  // Remove previous highlights
  document.querySelectorAll('[data-contrast-highlight]').forEach(el => {
    el.style.outline = '';
    el.removeAttribute('data-contrast-highlight');
  });

  // Add highlight to current element
  element.style.outline = '3px solid #667eea';
  element.setAttribute('data-contrast-highlight', 'true');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startColorPicking') {
    startColorPicking();
    sendResponse({ success: true });
  } else if (message.type === 'stopColorPicking') {
    stopColorPicking();
    sendResponse({ success: true });
  }
});

// Handle escape key to cancel
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isPicking) {
    stopColorPicking();
  }
});
