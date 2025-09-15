# My Portfolio - File Change Monitor

This portfolio includes an automated file monitoring system that tracks and reports any changes to your portfolio files in real-time.

## Features

- 🔍 **Real-time Monitoring**: Continuously watches for file changes
- 📝 **Change Logging**: Logs all changes with timestamps
- 🚨 **Instant Notifications**: Immediate console and file notifications
- ⚙️ **Configurable**: Customizable monitoring settings
- 🎯 **Smart Filtering**: Excludes system files and directories

## Quick Start

### 1. Install Dependencies
No external dependencies required - uses only Node.js built-in modules.

### 2. Start Monitoring
```bash
# Start the monitor
npm run monitor

# Or directly with node
node monitor.js start
```

### 3. Check Status
```bash
npm run status
```

### 4. Test the System
```bash
npm test
```

## Commands

- `npm run monitor` - Start continuous file monitoring
- `npm run status` - Check monitoring status
- `npm run check` - Perform a one-time change check
- `npm test` - Run monitoring tests

## Configuration

Edit `monitor-config.json` to customize:

```json
{
  "monitor": {
    "watchDir": ".",
    "logFile": "portfolio-changes.log",
    "checkInterval": 5000,
    "excludePatterns": [".git", "node_modules", "*.log"]
  }
}
```

## Monitored File Types

- **Portfolio Files**: HTML, CSS, JavaScript, JSON, Markdown
- **Images**: JPG, PNG, GIF, SVG, WebP
- **Documents**: PDF, DOC, DOCX

## Change Types Detected

- ✅ **Added**: New files created
- 🔄 **Modified**: Existing files changed
- ❌ **Deleted**: Files removed

## Example Output

```
🔍 Initializing portfolio monitoring...
📊 Monitoring 5 files
🚀 Starting portfolio monitoring (checking every 5000ms)
📁 ADDED: ./index.html
📁 MODIFIED: ./styles.css
📁 DELETED: ./old-file.js
```

## Log Files

All changes are logged to `portfolio-changes.log` with timestamps:

```
[2024-01-15T10:30:00.000Z] ADDED: ./index.html
[2024-01-15T10:30:05.000Z] MODIFIED: ./styles.css
```

## Stopping the Monitor

Press `Ctrl+C` to gracefully stop the monitoring service.