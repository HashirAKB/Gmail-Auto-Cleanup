/*
|--------------------------------------------------------------------------
| Comprehensive Gmail Cleanup Script
|--------------------------------------------------------------------------
| Features:
| - Deletes emails older than specified days
| - Preserves emails with attachments
| - Works across all categories
| - Preserves starred and important emails
| - Handles quota limitations
| - Includes monitoring and status checking
| - Auto-continues on next day if quota is reached
*/

// Configuration
var DELETE_AFTER_DAYS = 90    // Emails older than 90 days will be deleted
var PAGE_SIZE = 500          // Process 500 threads per batch
var MAX_DAILY_TRIGGERS = 20  // Limit triggers to avoid quota issues
var BATCH_DELAY = 2          // Minutes between batches

/**
 * Initial setup function - Run this first
 * Sets up daily trigger and shows initial statistics
 */
function setup() {
  // Remove any existing triggers first
  removeAllTriggers()
  
  // Set up daily trigger
  setPurgeTrigger()
  
  // Get initial statistics
  getStats()
  
  console.log('Setup completed successfully')
}

/**
 * Create a daily trigger for automatic cleanup
 */
function setPurgeTrigger() {
  ScriptApp
    .newTrigger('purge')
    .timeBased()
    .everyDays(1)
    .create()
  console.log('Daily purge trigger set successfully')
}

/**
 * Schedule next batch of cleanup
 */
function setPurgeMoreTrigger(){
  ScriptApp.newTrigger('purgeMore')
  .timeBased()
  .at(new Date((new Date()).getTime() + 1000 * 60 * BATCH_DELAY))
  .create()
  console.log('Next batch scheduled in ' + BATCH_DELAY + ' minutes')
}

/**
 * Remove batch processing triggers
 */
function removePurgeMoreTriggers(){
  var triggers = ScriptApp.getProjectTriggers()
  for (var i = 0; i < triggers.length; i++) {
    var trigger = triggers[i]
    if(trigger.getHandlerFunction() === 'purgeMore'){
      ScriptApp.deleteTrigger(trigger)
    }
  }
}

/**
 * Remove all script triggers - Use to stop the script completely
 */
function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers()
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i])
  }
  console.log('All triggers removed successfully')
}

/**
 * Wrapper for purge function
 */
function purgeMore() {
  purge()
}

/**
 * Main cleanup function
 * Handles email deletion with all specified conditions
 */
function purge() {
  try {
    // Check daily execution quota
    var today = new Date().toDateString()
    var userProperties = PropertiesService.getUserProperties()
    var executionCount = parseInt(userProperties.getProperty(today) || '0')
    
    if (executionCount >= MAX_DAILY_TRIGGERS) {
      console.log('Daily execution limit reached. Scheduling continuation for tomorrow.')
      ScriptApp.newTrigger('purge')
        .timeBased()
        .at(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
        .create()
      return
    }
    
    removePurgeMoreTriggers()
    
    // Search query modified to work across all categories
    // Excludes starred, important emails, and those with attachments
    var search = 'in:inbox -in:starred -in:important -has:attachment older_than:' + DELETE_AFTER_DAYS + 'd'    
    var threads = GmailApp.search(search, 0, PAGE_SIZE)
    
    // Log total emails at start
    var totalToProcess = GmailApp.search(search).length
    console.log('Total emails matching criteria: ' + totalToProcess)
    
    // Update execution counter
    userProperties.setProperty(today, (executionCount + 1).toString())
    
    var deletedCount = 0
    var skippedCount = 0
    var startTime = new Date()
    
    // Schedule next batch if needed
    if (threads.length === PAGE_SIZE) {
      console.log('Batch size of ' + PAGE_SIZE + ' reached.')
      console.log('Scheduling next batch to run in ' + BATCH_DELAY + ' minutes...')
      setPurgeMoreTrigger()
    } else {
      console.log('Found ' + threads.length + ' threads in final batch')
    }
    
    // Calculate cutoff date
    var cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - DELETE_AFTER_DAYS)
    
    // Process each thread
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i]
      
      // Double-check for attachments at thread level
      var hasAttachment = false
      var messages = thread.getMessages();
      for (var j = 0; j < messages.length; j++) {
        if (messages[j].getAttachments().length > 0) {
          hasAttachment = true;
          break;
        }
      }
      
      // Only delete if older than cutoff and has no attachments
      if (thread.getLastMessageDate() < cutoff && !hasAttachment) {
        thread.moveToTrash()
        deletedCount++
        
        // Add pause every 100 deletions to prevent quota issues
        if (deletedCount % 100 === 0) {
          Utilities.sleep(1000)
          console.log('Current batch progress: ' + deletedCount + ' threads processed')
        }
      } else {
        skippedCount++
      }
    }
    
    // Log completion statistics
    var executionTime = (new Date() - startTime) / 1000
    console.log('Current batch completed:')
    console.log('- Deleted in this batch: ' + deletedCount + ' threads')
    console.log('- Skipped in this batch: ' + skippedCount + ' threads')
    console.log('- Batch processing time: ' + executionTime + ' seconds')
    
    // Log remaining emails
    var remainingEmails = totalToProcess - deletedCount
    console.log('Remaining emails to process: ' + remainingEmails)
    if (remainingEmails > 0) {
      console.log('Automatic processing will continue in ' + BATCH_DELAY + ' minutes...')
    } else {
      console.log('All matching emails have been processed!')
    }
    
  } catch(error) {
    console.error('Error in purge function: ' + error.toString())
    if (error.toString().includes('quota')) {
      console.log('Quota exceeded. Scheduling continuation for tomorrow.')
      ScriptApp.newTrigger('purge')
        .timeBased()
        .at(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
        .create()
    } else {
      setPurgeMoreTrigger()
    }
  }
}

/**
 * Get statistics about emails to be processed
 */
function getStats() {
  try {
    var search = 'in:inbox -in:starred -in:important -has:attachment older_than:' + DELETE_AFTER_DAYS + 'd'
    var totalThreads = GmailApp.search(search).length
    
    console.log('Deletion Statistics:')
    console.log('- Total emails to process: ' + totalThreads)
    console.log('- Batch size: ' + PAGE_SIZE)
    console.log('- Estimated batches needed: ' + Math.ceil(totalThreads / PAGE_SIZE))
    console.log('- Estimated completion time: ' + Math.ceil(totalThreads / PAGE_SIZE * BATCH_DELAY) + ' minutes')
    console.log('- Deletion period: ' + DELETE_AFTER_DAYS + ' days')
    
  } catch(error) {
    console.error('Error in getStats function: ' + error.toString())
  }
}

/**
 * Check current quota status
 */
function checkQuotaStatus() {
  var today = new Date().toDateString()
  var userProperties = PropertiesService.getUserProperties()
  var executionCount = parseInt(userProperties.getProperty(today) || '0')
  
  console.log('Quota Status:')
  console.log('- Executions today: ' + executionCount + '/' + MAX_DAILY_TRIGGERS)
  console.log('- Remaining executions: ' + (MAX_DAILY_TRIGGERS - executionCount))
  
  if (executionCount >= MAX_DAILY_TRIGGERS) {
    console.log('- Status: Daily limit reached. Will resume tomorrow.')
  } else {
    console.log('- Status: Within quota limits. Process can continue.')
  }
}

/**
 * Check if script is still active
 */
function checkScriptStatus() {
  var triggers = ScriptApp.getProjectTriggers();
  console.log('Active Triggers:');
  if (triggers.length === 0) {
    console.log('- No active triggers. Script is NOT running.');
    return;
  }
  
  triggers.forEach(function(trigger) {
    console.log('- Function: ' + trigger.getHandlerFunction());
    console.log('- Type: ' + trigger.getEventType());
    console.log('- Frequency: Daily');
  });
}

/**
 * Stop the script completely
 */
function stopScript() {
  removeAllTriggers();
  console.log('Script stopped completely. Your inbox will no longer be auto-cleaned.');
}
