# Gmail Auto-Cleanup Script 📧

An intelligent Google Apps Script that automatically manages your Gmail inbox by cleaning up old emails while preserving important ones. This script helps maintain a clutter-free inbox by automatically removing old emails based on customizable criteria.

## 🌟 Features

- **Smart Deletion**: Automatically removes emails older than a specified period (default: 90 days)
- **Preservation Logic**: 
  - Preserves emails with attachments
  - Keeps starred emails
  - Retains important emails
- **Category Coverage**: Works across all Gmail categories
- **Quota Management**: 
  - Handles Gmail API quota limitations
  - Auto-resumes next day if quota is reached
- **Batch Processing**: Processes emails in configurable batches to prevent timeouts
- **Monitoring Tools**: Includes functions to monitor progress and script status
- **Safety Features**: Multiple checks to prevent accidental deletion of important emails

## ⚙️ Configuration Options

```javascript
var DELETE_AFTER_DAYS = 90    // Emails older than 90 days will be deleted
var PAGE_SIZE = 500          // Process 500 threads per batch
var MAX_DAILY_TRIGGERS = 20  // Limit triggers to avoid quota issues
var BATCH_DELAY = 2          // Minutes between batches
```

## 🚀 Installation

1. **Access Google Apps Script**:
   - Go to [script.google.com](https://script.google.com)
   - Click on "New Project"
   - Delete any default code in the editor

2. **Copy the Script**:
   - Copy the entire content of `gmail-cleanup.js`
   - Paste it into the Google Apps Script editor
   - Click the 💾 (Save) icon
   - Name your project (e.g., "Gmail Cleanup Script")

3. **Initial Setup**:
   ```javascript
   // Run these functions in order
   1. setup()      // Sets up necessary triggers
   2. getStats()   // Shows initial statistics
   3. purge()      // Starts the cleanup process
   ```

## 📋 Usage

### Core Functions

```javascript
setup()           // Initialize the script and set up daily trigger
purge()           // Start/resume the cleanup process
getStats()        // Get statistics about emails to be processed
checkQuotaStatus()// Check current quota usage
checkScriptStatus()// Check if script is running
stopScript()      // Stop all automatic processes
```

### Monitoring Progress

1. **Check Current Status**:
   ```javascript
   checkScriptStatus()
   // Shows if the script is active and what triggers are running
   ```

2. **View Statistics**:
   ```javascript
   getStats()
   // Shows:
   // - Total emails to process
   // - Estimated completion time
   // - Batch information
   ```

3. **Monitor Quotas**:
   ```javascript
   checkQuotaStatus()
   // Shows:
   // - Today's execution count
   // - Remaining executions
   // - Quota status
   ```

## 🛡️ Safety Features

- **No Attachment Deletion**: Emails with attachments are automatically preserved
- **Important Email Protection**: Starred and important emails are never deleted
- **Age Protection**: Only emails older than specified days are processed
- **Quota Protection**: Automatically handles Gmail's API limits
- **Batch Processing**: Prevents script timeout issues
- **Error Handling**: Comprehensive error catching and reporting

## 📝 Logs

The script provides detailed logs for monitoring:
```plaintext
- Total emails matching criteria
- Batch progress updates
- Deletion counts
- Processing time
- Quota usage
- Error reports (if any)
```

## ⚠️ Important Notes

1. **Background Running**:
   - The script continues running even after closing the script editor
   - Uses Google's server-side triggers for automation

2. **Quota Limitations**:
   - Google enforces daily quotas on Gmail operations
   - Script automatically handles these limitations
   - Continues processing the next day if needed

3. **Permanent Deletion**:
   - Emails are moved to trash (recoverable for 30 days)
   - Consider backing up important emails before running

## 🔧 Customization

Modify these variables in the script to customize behavior:
```javascript
DELETE_AFTER_DAYS  // Change retention period
PAGE_SIZE         // Adjust batch size
MAX_DAILY_TRIGGERS// Modify daily execution limit
BATCH_DELAY       // Adjust delay between batches
```

## 🛑 Stopping the Script

To completely stop the script:
```javascript
stopScript()
// Removes all triggers and stops automatic processing
```

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📜 License

[MIT License](LICENSE) - feel free to use this in your own projects!

## 👥 Author

HashirAKB

## 📞 Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with:
   - Script configuration
   - Error messages (if any)
   - Steps to reproduce the problem

---
Remember to ⭐ this repository if you find it helpful!
