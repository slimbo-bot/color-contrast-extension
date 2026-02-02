// Color contrast calculation utilities
class ColorContrastCalculator {
  // Convert hex to RGB
  hexToRgb(hex) {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    return { r, g, b };
  }

  // Calculate relative luminance
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Calculate contrast ratio
  getContrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Check WCAG compliance
  checkWCAG(contrastRatio, isLargeText = false) {
    const results = {
      aaNormal: contrastRatio >= 4.5,
      aaLarge: contrastRatio >= 3.0,
      aaaNormal: contrastRatio >= 7.0,
      aaaLarge: contrastRatio >= 4.5
    };

    return results;
  }

  // Calculate all metrics
  calculate(foregroundHex, backgroundHex) {
    const fg = this.hexToRgb(foregroundHex);
    const bg = this.hexToRgb(backgroundHex);

    const fgLuminance = this.getLuminance(fg.r, fg.g, fg.b);
    const bgLuminance = this.getLuminance(bg.r, bg.g, bg.b);

    const contrastRatio = this.getContrastRatio(fgLuminance, bgLuminance);

    return {
      contrastRatio: Math.round(contrastRatio * 100) / 100,
      luminance: {
        foreground: Math.round(fgLuminance * 1000) / 1000,
        background: Math.round(bgLuminance * 1000) / 1000
      },
      wcag: this.checkWCAG(contrastRatio)
    };
  }
}

// Main application logic
const calculator = new ColorContrastCalculator();

// DOM elements
const foregroundColor = document.getElementById('foreground-color');
const foregroundHex = document.getElementById('foreground-hex');
const backgroundColor = document.getElementById('background-color');
const backgroundHex = document.getElementById('background-hex');
const contrastRatio = document.getElementById('contrast-ratio');
const wcagAANormal = document.getElementById('wcag-aa-normal');
const wcagAALarge = document.getElementById('wcag-aa-large');
const wcagAAANormal = document.getElementById('wcag-aaa-normal');
const wcagAAALarge = document.getElementById('wcag-aaa-large');
const preview = document.getElementById('preview');
const previewText = document.querySelector('.preview-text');
const swapBtn = document.getElementById('swap-colors');
const pickFromPageBtn = document.getElementById('pick-from-page');

// Update UI with results
function updateResults(fgHex, bgHex) {
  const results = calculator.calculate(fgHex, bgHex);

  // Update contrast ratio
  contrastRatio.textContent = `${results.contrastRatio}:1`;

  // Update WCAG results
  updateWCAGResult(wcagAANormal, results.wcag.aaNormal);
  updateWCAGResult(wcagAALarge, results.wcag.aaLarge);
  updateWCAGResult(wcagAAANormal, results.wcag.aaaNormal);
  updateWCAGResult(wcagAAALarge, results.wcag.aaaLarge);

  // Update preview
  preview.style.backgroundColor = bgHex;
  preview.style.color = fgHex;
  previewText.style.color = fgHex;
}

function updateWCAGResult(element, passed) {
  element.textContent = passed ? '✅ PASS' : '❌ FAIL';
  element.className = 'result ' + (passed ? 'pass' : 'fail');
}

// Validate hex color
function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// Sync color picker and text input
function syncColorInputs(colorPicker, textInput) {
  colorPicker.addEventListener('input', () => {
    textInput.value = colorPicker.value.toUpperCase();
    updateResults(foregroundColor.value, backgroundColor.value);
  });

  textInput.addEventListener('input', () => {
    const value = textInput.value.toUpperCase();
    if (isValidHex(value)) {
      colorPicker.value = value;
      updateResults(foregroundColor.value, backgroundColor.value);
    }
  });
}

// Initialize color inputs
syncColorInputs(foregroundColor, foregroundHex);
syncColorInputs(backgroundColor, backgroundHex);

// Swap colors button
swapBtn.addEventListener('click', () => {
  const tempFg = foregroundColor.value;
  const tempBg = backgroundColor.value;

  foregroundColor.value = tempBg;
  foregroundHex.value = tempBg.toUpperCase();
  backgroundColor.value = tempFg;
  backgroundHex.value = tempFg.toUpperCase();

  updateResults(foregroundColor.value, backgroundColor.value);
});

// Pick colors from page button
pickFromPageBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.startsWith('chrome://')) {
      alert('Cannot pick colors from Chrome pages. Please navigate to a website.');
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/content.js']
    });

    // Listen for color selection from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'colorsSelected') {
        foregroundColor.value = message.foreground.toUpperCase();
        foregroundHex.value = message.foreground.toUpperCase();
        backgroundColor.value = message.background.toUpperCase();
        backgroundHex.value = message.background.toUpperCase();

        updateResults(foregroundColor.value, backgroundColor.value);
      }
    });
  } catch (error) {
    console.error('Error picking colors:', error);
    alert('Could not pick colors from page. Please make sure you\'re on a regular website.');
  }
});

// Initial calculation
updateResults(foregroundColor.value, backgroundColor.value);
