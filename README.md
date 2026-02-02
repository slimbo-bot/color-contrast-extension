# Color Contrast Checker Chrome Extension

## Features

✅ **Real-time Color Contrast Analysis**
- Calculate contrast ratios according to WCAG 2.1 guidelines
- Support for both foreground (text) and background colors
- Instant visual feedback

✅ **WCAG Compliance Checking**
- WCAG AA (Normal & Large text)
- WCAG AAA (Normal & Large text)
- Clear PASS/FAIL indicators

✅ **Color Picking from Web Pages**
- Click any element on a website to pick its colors
- Automatic foreground and background detection
- Works with all websites

✅ **Visual Preview**
- See your colors in action with sample text
- Live preview updates as you adjust colors

✅ **Modern UI**
- Clean, intuitive interface
- Dark mode friendly
- Accessible design

## Installation

### Developer Mode (Recommended for Testing)

1. Download or clone this repository:
   ```bash
   git clone <repo-url>
   cd color-contrast-extension
   ```

2. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

3. Enable "Developer mode" (toggle in top right corner)

4. Click "Load unpacked" button

5. Select the `color-contrast-extension` folder

6. The extension is now installed! 🎉

### Usage

#### Manual Color Input
1. Click the Color Contrast Checker icon in your toolbar
2. Use the color pickers to select foreground and background colors
3. View the contrast ratio and WCAG compliance results
4. Preview your colors with sample text

#### Pick Colors from Web Page
1. Open any website in Chrome
2. Click the Color Contrast Checker icon
3. Click "🖱️ Pick Colors from Page"
4. Click on any element on the page
5. The extension will analyze the colors automatically

#### Color Input Options
- **Color Picker:** Click the colored square to open system color picker
- **Hex Input:** Type or paste hex color codes (e.g., #FF5733)
- **Swap Colors:** Click the swap button to quickly exchange foreground and background

## WCAG Guidelines

### Level AA (Minimum compliance)
- **Normal text:** 4.5:1 contrast ratio
- **Large text (18pt+ or 14pt+ bold):** 3:1 contrast ratio

### Level AAA (Enhanced compliance)
- **Normal text:** 7:1 contrast ratio
- **Large text (18pt+ or 14pt+ bold):** 4.5:1 contrast ratio

### Large Text Definition
- 18 point (24px) or larger
- 14 point (18.66px) bold or larger

## Technical Details

### Contrast Calculation
Uses the WCAG 2.1 relative luminance formula:
1. Convert RGB to relative luminance
2. Calculate contrast ratio: (L1 + 0.05) / (L2 + 0.05)
3. Round to 2 decimal places

### Color Format
- Input: Hexadecimal (#RRGGBB)
- Processing: RGB (0-255)
- Output: Contrast ratio (X:1 format)

## Browser Compatibility

- Chrome/Edge (Manifest V3)
- Chrome 88+ required
- Chromium-based browsers

## Development

### File Structure
```
color-contrast-extension/
├── manifest.json          # Extension manifest
├── popup/
│   ├── popup.html        # Main popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js         # Main logic
├── content/
│   ├── content.js        # Content script for color picking
│   └── content.css       # Content script styles
└── icons/
    ├── icon.svg         # SVG icon source
    └── [PNG icons]
```

### Local Development
1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click refresh icon (🔄) on the extension card
4. Test your changes

## License

MIT License - Feel free to use, modify, and distribute

## Credits

- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Inspired by Deque Color Contrast Analyzer
- Accessibility First Design

## Contributing

Contributions welcome! Feel free to submit issues and pull requests.

---

Made with ❤️ for better web accessibility
