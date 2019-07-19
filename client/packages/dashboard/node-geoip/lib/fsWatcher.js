var fs = require('fs')
var path = require('path')
var FSWatcher = {}

function makeFsWatchFilter(name, directory, filename, cooldownDelay, callback) {
  var cooldownId = null

  // Delete the cooldownId and callback the outer function
  function timeoutCallback() {
    cooldownId = null
    callback()
  }

  // This function is called when there is a change in the data directory
  // It sets a timer to wait for the change to be completed
  function onWatchEvent(event, changedFile) {
    // check to make sure changedFile is not null
    if (!changedFile) {
      return
    }

    var filePath = path.join(directory, changedFile)

    if (!filename || filename === changedFile) {
      fs.exists(filePath, function onExists(exists) {
        if (!exists) {
          // if the changed file no longer exists, it was a deletion.
          // we ignore deleted files
          return
        }

        // At this point, a new file system activity has been detected,
        // We have to wait for file transfert to be finished before moving on.

        // If a cooldownId already exists, we delete it
        if (cooldownId !== null) {
          clearTimeout(cooldownId)
          cooldownId = null
        }

        // Once the cooldownDelay has passed, the timeoutCallback function will be called
        cooldownId = setTimeout(timeoutCallback, cooldownDelay)
      })
    }
  }

  // Manage the case where filename is missing (because it's optionnal)
  if (typeof cooldownDelay === 'function') {
    callback = cooldownDelay
    cooldownDelay = filename
    filename = null
  }

  if (FSWatcher[name]) {
    stopWatching(name)
  }

  FSWatcher[name] = fs.watch(directory, onWatchEvent)
}

/**
 * Take a FSWatcher object and close it.
 *
 * @param {string} name: name of the watcher to close
 *
 **/
function stopWatching(name) {
  FSWatcher[name].close()
}

module.exports.makeFsWatchFilter = makeFsWatchFilter
module.exports.stopWatching = stopWatching
