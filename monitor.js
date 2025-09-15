#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class PortfolioMonitor {
    constructor(config = {}) {
        this.watchDir = config.watchDir || process.cwd();
        this.logFile = config.logFile || 'changes.log';
        this.excludePatterns = config.excludePatterns || ['.git', 'node_modules', '.DS_Store'];
        this.fileHashes = new Map();
        this.isRunning = false;
        
        console.log(`Portfolio Monitor initialized for: ${this.watchDir}`);
    }

    // Calculate file hash for change detection
    calculateFileHash(filePath) {
        try {
            const content = fs.readFileSync(filePath);
            return crypto.createHash('md5').update(content).digest('hex');
        } catch (error) {
            return null;
        }
    }

    // Check if file should be excluded from monitoring
    shouldExclude(filePath) {
        return this.excludePatterns.some(pattern => filePath.includes(pattern));
    }

    // Log changes to file and console
    logChange(type, filePath, timestamp = new Date()) {
        const logEntry = `[${timestamp.toISOString()}] ${type.toUpperCase()}: ${filePath}\n`;
        
        // Log to console
        console.log(`📁 ${type.toUpperCase()}: ${filePath}`);
        
        // Log to file
        try {
            fs.appendFileSync(this.logFile, logEntry);
        } catch (error) {
            console.error(`Failed to write to log file: ${error.message}`);
        }
    }

    // Scan directory for files
    scanDirectory(dirPath = this.watchDir) {
        const files = [];
        
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                
                if (this.shouldExclude(fullPath)) {
                    continue;
                }
                
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    files.push(...this.scanDirectory(fullPath));
                } else if (stat.isFile()) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${dirPath}: ${error.message}`);
        }
        
        return files;
    }

    // Initialize monitoring by taking initial snapshot
    initialize() {
        console.log('🔍 Initializing portfolio monitoring...');
        const files = this.scanDirectory();
        
        for (const file of files) {
            const hash = this.calculateFileHash(file);
            if (hash) {
                this.fileHashes.set(file, hash);
            }
        }
        
        console.log(`📊 Monitoring ${this.fileHashes.size} files`);
        this.logChange('initialized', `${this.fileHashes.size} files`);
    }

    // Check for changes
    checkForChanges() {
        const currentFiles = new Set(this.scanDirectory());
        const previousFiles = new Set(this.fileHashes.keys());
        
        // Check for new files
        for (const file of currentFiles) {
            if (!previousFiles.has(file)) {
                const hash = this.calculateFileHash(file);
                if (hash) {
                    this.fileHashes.set(file, hash);
                    this.logChange('added', file);
                }
            }
        }
        
        // Check for deleted files
        for (const file of previousFiles) {
            if (!currentFiles.has(file)) {
                this.fileHashes.delete(file);
                this.logChange('deleted', file);
            }
        }
        
        // Check for modified files
        for (const file of currentFiles) {
            if (previousFiles.has(file)) {
                const currentHash = this.calculateFileHash(file);
                const previousHash = this.fileHashes.get(file);
                
                if (currentHash && currentHash !== previousHash) {
                    this.fileHashes.set(file, currentHash);
                    this.logChange('modified', file);
                }
            }
        }
    }

    // Start monitoring
    start(interval = 5000) {
        if (this.isRunning) {
            console.log('⚠️  Monitor is already running');
            return;
        }
        
        this.initialize();
        this.isRunning = true;
        
        console.log(`🚀 Starting portfolio monitoring (checking every ${interval}ms)`);
        
        this.intervalId = setInterval(() => {
            this.checkForChanges();
        }, interval);
    }

    // Stop monitoring
    stop() {
        if (!this.isRunning) {
            console.log('⚠️  Monitor is not running');
            return;
        }
        
        clearInterval(this.intervalId);
        this.isRunning = false;
        this.logChange('stopped', 'monitoring');
        console.log('🛑 Portfolio monitoring stopped');
    }

    // Get current status
    getStatus() {
        return {
            isRunning: this.isRunning,
            filesMonitored: this.fileHashes.size,
            watchDirectory: this.watchDir,
            logFile: this.logFile
        };
    }
}

// CLI usage
if (require.main === module) {
    const monitor = new PortfolioMonitor();
    
    // Handle command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'start';
    
    switch (command) {
        case 'start':
            monitor.start();
            
            // Graceful shutdown
            process.on('SIGINT', () => {
                console.log('\n👋 Shutting down portfolio monitor...');
                monitor.stop();
                process.exit(0);
            });
            break;
            
        case 'status':
            console.log('📊 Portfolio Monitor Status:', monitor.getStatus());
            break;
            
        case 'check':
            monitor.initialize();
            monitor.checkForChanges();
            break;
            
        default:
            console.log('Usage: node monitor.js [start|status|check]');
            process.exit(1);
    }
}

module.exports = PortfolioMonitor;