# Form Assistant Chrome Extension

A Chrome extension that helps extract form data and autofill forms with data from a backend service.

## Features

- Extract form questions/fields from any webpage
- Extract the currently focused input field's information
- Right-click context menu option to extract the current field
- Send extracted form data to a backend service
- Autofill forms with data retrieved from the backend

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing this extension
5. The Form Assistant extension icon should now appear in your Chrome toolbar

## Usage

### Extracting All Form Data

1. Navigate to a webpage containing a form you want to extract
2. Click the Form Assistant extension icon
3. Click the "Extract All Form Fields" button
4. The extension will identify all form fields on the page and extract their information
5. The extracted data will be sent to your backend service automatically

### Extracting the Current Focused Field

There are three ways to extract just the currently focused input field:

1. **Using the popup**:
   - Click on any input field on the webpage to focus it
   - Click the Form Assistant extension icon
   - Click the "Extract Current Field" button

2. **Using the context menu**:
   - Right-click on any input field
   - Select "Extract this field" from the context menu

The extracted field data will be sent to your backend automatically.

### Autofilling Forms

1. Navigate to a webpage containing a form you want to autofill
2. Click the Form Assistant extension icon
3. Click the "Autofill Form" button
4. The extension will fetch form data from your backend and fill in the form fields automatically

## Manifest V3 and Background Service Worker

This extension uses Manifest V3's service worker for background processing. Unlike the persistent background pages in Manifest V2, service workers in Manifest V3:

- Are non-persistent and event-driven
- May be terminated when idle to save resources
- Wake up when events occur (like messages or API calls)

The extension handles this by:
- Using chrome.storage to persist important data
- Properly handling service worker lifecycle events
- Ensuring critical operations complete before the service worker goes idle

## Backend Configuration

This extension requires a backend service to store and retrieve form data. Edit the `background.js` file to set the API endpoint:

```javascript
const API_BASE_URL = 'https://your-backend-api.com';
```

The backend should implement the following endpoints:

- `POST /submit-form` - Receives form data
- `GET /get-form-data?url={url}` - Returns form data for a specific URL

## Extension Structure

- `manifest.json` - Chrome extension configuration
- `popup.html` - User interface HTML
- `popup.js` - User interface logic
- `content.js` - Script for interacting with webpage forms
- `background.js` - Background service worker for backend communication
- `images/` - Icons for the extension

## Customization

You can customize the extension by:

- Modifying the `content.js` file to improve form field detection
- Changing the UI in `popup.html`
- Adjusting the backend communication in `background.js`
- Adding keyboard shortcuts for quick extraction

## Icon Placeholders

This repository includes placeholder image files that you should replace with your own icons:

- `images/icon16.png` (16×16)
- `images/icon48.png` (48×48)
- `images/icon128.png` (128×128)

## License

MIT 