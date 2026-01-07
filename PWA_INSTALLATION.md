# Installing Test Maturity Assessment as a Windows App (PWA)

The Test Maturity Assessment tool can be installed on Windows as a Progressive Web App (PWA), allowing you to use it just like a native application.

## What is a PWA?

A Progressive Web App is a web application that can be installed on your device and work like a native app. Benefits include:

- **App-like experience**: Runs in its own window, separate from your browser
- **Start menu integration**: Appears in your Windows Start menu and taskbar
- **Offline functionality**: Works even without an internet connection
- **Fast loading**: Cached resources for instant startup
- **No installation package**: No need to download and run installers

## Installation Instructions

### For Windows (Chrome/Edge)

1. **Open the app in your browser**
   - Navigate to the Test Maturity Assessment URL in Google Chrome or Microsoft Edge
   - For local use: Open `index.html` via a web server (required for PWA)

2. **Look for the install prompt**
   - You'll see an install icon (⊕ or 🖥️) in the browser's address bar
   - Or click the three-dot menu (⋮) in the top-right corner

3. **Install the app**
   - Click **"Install Test Maturity Assessment"** or **"Install app"**
   - Alternatively, go to **Menu → Install Test Maturity Assessment**
   - Click **"Install"** in the confirmation dialog

4. **Launch the app**
   - The app will open in its own window
   - Find it in your Windows Start menu under "Test Maturity Assessment"
   - Pin it to your taskbar for quick access

### For Local Development/Testing

To test the PWA locally, you need to serve the files via HTTP/HTTPS:

```bash
# Using Python (built-in)
python -m http.server 8080

# Using Node.js (if installed)
npx http-server -p 8080

# Then open: http://localhost:8080
```

**Note**: PWAs require HTTPS in production. For local testing, `localhost` is treated as a secure origin.

## Verifying Installation

After installation, you can verify:

1. **Windows Start Menu**
   - Press the Windows key and search for "Test Maturity"
   - The app should appear in the results

2. **Installed Apps**
   - Go to Settings → Apps → Installed apps
   - Search for "Test Maturity Assessment"

3. **Task Manager**
   - When running, the app appears as a separate process
   - It runs independently of your browser

## Using the Installed App

Once installed:

- **Opening**: Click the app icon from Start menu, taskbar, or desktop
- **Version Display**: The current version is shown in the app header (e.g., v1.2.2)
- **Updating**: The app automatically checks for updates when you open it
  - **Update Detection**: When a new version is available, you'll see an animated banner with an "Update Now" button
  - **User Control**: You can choose to update immediately or dismiss the notification and continue working
  - **How It Works**: 
    - Service worker checks for updates immediately on page load
    - Continues checking every 60 seconds while the app is open
    - Also checks when you switch back to the app tab
    - Banner only appears when a new version is actually deployed
    - You won't see the banner if you're already on the latest version
  - **No More Hard Refresh**: Click "Update Now" on the banner - **you no longer need Ctrl+Shift+R!**
  - **Demo**: See the [Update Banner Demo](demo-update-banner.html) for a live demonstration of how update notifications work
  - **Manual Check**: Open browser console and type `checkForUpdates()` to manually check for updates
- **Uninstalling**: Right-click the app icon and select "Uninstall" or remove it from Windows Settings

## Features Available Offline

The following features work offline after first load:

✅ **Assessment creation and editing**
✅ **Question answering**
✅ **Results viewing and calculation**
✅ **Local data management (import/export)**
✅ **Custom question editor**

⚠️ **Requires internet connection:**
- External CDN resources (Chart.js, SheetJS) on first load
- Folder sync functionality
- Any future online features

## Troubleshooting

### Install option not appearing?

**Solution 1**: Make sure you're using Chrome 86+ or Edge 86+
- Firefox and Safari don't support PWA installation on Windows

**Solution 2**: Verify the app is served over HTTPS (or localhost for testing)

**Solution 3**: Clear browser cache and reload the page
- Go to browser settings
- Clear browsing data
- Reload the application

### App not working offline?

**Solution**: 
- Open the app while online first (to cache resources)
- Check Developer Tools → Application → Service Workers
- Ensure service worker is registered and active

### Updates not showing?

**Solution**:
- Close and reopen the app - it checks for updates immediately on load
- The service worker checks for updates immediately when you open the app, then every 60 seconds, and when the app becomes visible
- An animated update banner will appear when a new version is detected
- Click "Update Now" on the banner - no need for Ctrl+Shift+R
- If you still don't see the banner, check the browser console for "New version available!" message
- Cache version is automatically managed
- See the [Update Banner Demo](demo-update-banner.html) to understand how the notification system works

### Want to reinstall?

**Solution**:
1. Uninstall from Windows Settings
2. Clear browser cache for the site
3. Reinstall following the installation instructions

## Technical Details

### Manifest Configuration

The app's `manifest.json` defines:
- App name and description
- Icons for various sizes (72px to 512px)
- Theme color (#2563eb - blue)
- Display mode (standalone)
- Start URL

### Service Worker

The service worker (`service-worker.js`) provides:
- Offline functionality via caching
- Fast loading with cache-first strategy
- Automatic update detection with visual notifications
  - Checks for updates every 60 seconds
  - Shows an animated banner when new version is available
  - User-controlled updates (no forced reloads)
- Automatic cache versioning (version-based cache names)
- Resource precaching for instant startup

**Live Demo**: See [demo-update-banner.html](demo-update-banner.html) for an interactive demonstration of the update detection system.

### Browser Support

| Browser | Windows Install | Offline Support | Notes |
|---------|----------------|-----------------|-------|
| Chrome 86+ | ✅ Yes | ✅ Yes | Recommended |
| Edge 86+ | ✅ Yes | ✅ Yes | Recommended |
| Firefox | ❌ No | ✅ Yes | Web only |
| Safari | ❌ No | ⚠️ Partial | Web only |

### System Requirements

- **Operating System**: Windows 10 version 1903 or later
- **Browser**: Chrome 86+ or Edge 86+
- **Disk Space**: ~2 MB for app and cache
- **Internet**: Required for initial install, optional afterward

## Advanced: Customizing the PWA

Developers can customize the PWA by editing:

1. **manifest.json**: App metadata, colors, icons
2. **service-worker.js**: Caching strategy, offline behavior
3. **index.html**: PWA meta tags, theme colors

After making changes, users need to:
- Clear cache in browser
- Uninstall and reinstall the app

## Benefits for Teams

Installing as a PWA provides:

1. **Consistent Experience**
   - Everyone uses the same interface
   - No browser UI distractions

2. **Quick Access**
   - Launch from Start menu or taskbar
   - No need to find browser tab

3. **Professional Appearance**
   - Runs in its own window
   - Looks like a native application

4. **Offline Capability**
   - Work on assessments without internet
   - Sync when connection returns (with folder sync)

## FAQ

**Q: Is this a real Windows application?**
A: It's a Progressive Web App - a web application that runs like a native app with its own window and Start menu entry.

**Q: Will it update automatically?**
A: Yes, the service worker checks for updates every time you launch the app.

**Q: Can I use it on multiple computers?**
A: Yes, install it on each computer. Use the folder sync feature to share data across devices.

**Q: Does it collect any data?**
A: No, all data stays on your device. No analytics or tracking.

**Q: Can I uninstall it like a regular app?**
A: Yes, uninstall from Windows Settings → Apps or right-click the app icon.

**Q: What happens if I clear my browser data?**
A: The app remains installed, but cached resources will be re-downloaded on next launch.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Open an issue on the GitHub repository
3. Review the browser's Developer Tools → Console for errors

---

**Made with ❤️ for Windows users who want a native app experience.**

*Transform your testing maturity assessments with one-click installation!* 🚀
