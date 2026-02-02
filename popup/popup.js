// Color contrast calculator
(function() {
  class ColorContrastCalculator {
    hexToRgb(hex) {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substr(0, 2), 16);
      const g = parseInt(cleanHex.substr(2, 2), 16);
      const b = parseInt(cleanHex.substr(4, 2), 16);
      return { r, g, b };
    }

    getLuminance(r, g, b) {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    getContrastRatio(l1, l2) {
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    checkWCAG(contrastRatio) {
      return {
        aaNormal: contrastRatio >= 4.5,
        aaLarge: contrastRatio >= 3.0,
        aaaNormal: contrastRatio >= 7.0,
        aaaLarge: contrastRatio >= 4.5
      };
    }

    calculate(foregroundHex, backgroundHex) {
      const fg = this.hexToRgb(foregroundHex);
      const bg = this.hexToRgb(backgroundHex);

      const fgLuminance = this.getLuminance(fg.r, fg.g, fg.b);
      const bgLuminance = this.getLuminance(bg.r, bg.g, bg.b);

      const contrastRatio = this.getContrastRatio(fgLuminance, bgLuminance);

      return {
        contrastRatio: Math.round(contrastRatio * 100) / 100,
        wcag: this.checkWCAG(contrastRatio)
      };
    }
  }

  // Initialize
  const calculator = new ColorContrastCalculator();

  // DOM elements - use null checks
  const foregroundColor = document.getElementById('foreground-color');
  const foregroundHex = document.getElementById('foreground-hex');
  const foregroundPreview = document.getElementById('foreground-preview');
  const backgroundColor = document.getElementById('background-color');
  const backgroundHex = document.getElementById('background-hex');
  const backgroundPreview = document.getElementById('background-preview');
  const contrastRatio = document.getElementById('contrast-ratio');
  const wcagAANormal = document.getElementById('wcag-aa-normal');
  const wcagAALarge = document.getElementById('wcag-aa-large');
  const wcagAAANormal = document.getElementById('wcag-aaa-normal');
  const wcagAAALarge = document.getElementById('wcag-aaa-large');
  const preview = document.getElementById('preview');
  const swapBtn = document.getElementById('swap-colors');
  const pickFromPageBtn = document.getElementById('pick-from-page');

  // Update UI
  function updateResults(fgHex, bgHex) {
    const results = calculator.calculate(fgHex, bgHex);

    // Update contrast ratio
    if (contrastRatio) {
      contrastRatio.textContent = `${results.contrastRatio}:1`;
    }

    // Update WCAG results
    if (wcagAANormal) updateWCAGResult(wcagAANormal, results.wcag.aaNormal);
    if (wcagAALarge) updateWCAGResult(wcagAALarge, results.wcag.aaLarge);
    if (wcagAAANormal) updateWCAGResult(wcagAAANormal, results.wcag.aaaNormal);
    if (wcagAAALarge) updateWCAGResult(wcagAAALarge, results.wcag.aaaLarge);

    // Update preview
    if (preview) {
      preview.style.backgroundColor = bgHex;
      preview.style.color = fgHex;
    }

    // Update color previews
    if (foregroundPreview) foregroundPreview.style.background = fgHex;
    if (backgroundPreview) backgroundPreview.style.background = bgHex;
  }

  function updateWCAGResult(element, passed) {
    element.textContent = passed ? 'PASS' : 'FAIL';
    element.className = 'wcag-result ' + (passed ? 'pass' : 'fail');
  }

  function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }

  // Sync color inputs
  function syncColorInputs(colorPicker, textInput, previewElement) {
    if (!colorPicker || !textInput || !previewElement) return;

    colorPicker.addEventListener('input', function() {
      textInput.value = colorPicker.value.toUpperCase();
      previewElement.style.background = colorPicker.value;
      updateResults(foregroundColor.value, backgroundColor.value);
    });

    textInput.addEventListener('input', function() {
      const value = textInput.value.toUpperCase();
      if (isValidHex(value)) {
        colorPicker.value = value;
        previewElement.style.background = value;
        updateResults(foregroundColor.value, backgroundColor.value);
      }
    });
  }

  // Initialize sync
  syncColorInputs(foregroundColor, foregroundHex, foregroundPreview);
  syncColorInputs(backgroundColor, backgroundHex, backgroundPreview);

  // Swap colors
  if (swapBtn) {
    swapBtn.addEventListener('click', function() {
      const tempFg = foregroundColor.value;
      const tempBg = backgroundColor.value;

      foregroundColor.value = tempBg;
      foregroundHex.value = tempBg.toUpperCase();
      if (foregroundPreview) foregroundPreview.style.background = tempBg;

      backgroundColor.value = tempFg;
      backgroundHex.value = tempFg.toUpperCase();
      if (backgroundPreview) backgroundPreview.style.background = tempFg;

      updateResults(foregroundColor.value, backgroundColor.value);
    });
  }

  // Pick colors from page
  if (pickFromPageBtn) {
    pickFromPageBtn.addEventListener('click', async function() {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tabs || !tabs[0] || tabs[0].url.startsWith('chrome://')) {
          alert('Please navigate to a website first.');
          return;
        }

        const tab = tabs[0];

        // Inject content script
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content.js']
        });

        // Send message to start picking
        chrome.tabs.sendMessage(tab.id, { action: 'startColorPicking' }, function(response) {
          if (chrome.runtime.lastError) {
            alert('Could not start color picking. Make sure you\'re on a regular website.');
          } else {
            // Update button state
            pickFromPageBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 2L2 10l3 3 1 5 4-2 1-5 3-3 2 4-1 5z" fill="currentColor"/></svg> Click on page to pick colors';
            pickFromPageBtn.classList.add('active');
          }
        });
      } catch (error) {
        console.error('Error picking colors:', error);
        alert('Could not pick colors from page.');
      }
    });
  }

  // Listen for color selection from content script
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'colorsSelected') {
      foregroundColor.value = message.foreground.toUpperCase();
      foregroundHex.value = message.foreground.toUpperCase();
      if (foregroundPreview) foregroundPreview.style.background = message.foreground.toUpperCase();

      backgroundColor.value = message.background.toUpperCase();
      backgroundHex.value = message.background.toUpperCase();
      if (backgroundPreview) backgroundPreview.style.background = message.background.toUpperCase();

      updateResults(foregroundColor.value, backgroundColor.value);

      // Reset button
      pickFromPageBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 2L2 10l3 3 1 5 4-2 1-5 3-3 2 4-1 5z" fill="currentColor"/></svg> Pick Colors from Page';
      pickFromPageBtn.classList.remove('active');

      sendResponse({ success: true });
    }

    // Forward messages between popup and content script
    if (message.action === 'startColorPicking' || message.action === 'stopColorPicking') {
      sendResponse({ success: true });
    }
  });

  // Initial calculation
  updateResults(foregroundColor.value, backgroundColor.value);
})();
