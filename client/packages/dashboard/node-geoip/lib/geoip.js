var fs = require('fs')
var path = require('path')
var isIpLib = require('is-ip')

function isIP (string) {
  if (isIpLib.v4(string)) return 4
  else if (isIpLib.v6(string)) return 6
  else return 0
}

fs.existsSync = fs.existsSync || path.existsSync

var utils = require('./utils')
var fsWatcher = require('./fsWatcher')
var async = require('async')

var watcherName = 'dataWatcher'

var geodatadir

if (typeof global.geodatadir === 'undefined') {
  geodatadir = path.join(__dirname, '/../data/')
} else {
  geodatadir = global.geodatadir
}

var dataFiles = {
  city: null /* require("../data/geoip-city.dat.js").default */,
  city6: null /* require("../data/geoip-city6.dat.js").default */,
  cityNames: null /* require("../data/geoip-city-names.dat.js").default */,
  country: require('../data/geoip-country.dat.js').default,
  country6: require('../data/geoip-country6.dat.js').default,
}

var privateRange4 = [
  [utils.aton4('10.0.0.0'), utils.aton4('10.255.255.255')],
  [utils.aton4('172.16.0.0'), utils.aton4('172.31.255.255')],
  [utils.aton4('192.168.0.0'), utils.aton4('192.168.255.255')],
]

var conf4 = {
  firstIP: null,
  lastIP: null,
  lastLine: 0,
  locationBuffer: null,
  locationRecordSize: 88,
  mainBuffer: null,
  recordSize: 24,
}

var conf6 = {
  firstIP: null,
  lastIP: null,
  lastLine: 0,
  mainBuffer: null,
  recordSize: 48,
}

// copy original configs
var cache4 = JSON.parse(JSON.stringify(conf4))
var cache6 = JSON.parse(JSON.stringify(conf6))

var RECORD_SIZE = 10
var RECORD_SIZE6 = 34

function lookup4 (ip) {
  var fline = 0
  var floor = cache4.lastIP
  var cline = cache4.lastLine
  var ceil = cache4.firstIP
  var line
  var locId

  var buffer = cache4.mainBuffer
  var locBuffer = cache4.locationBuffer
  var privateRange = privateRange4
  var recordSize = cache4.recordSize
  var locRecordSize = cache4.locationRecordSize

  var i

  var geodata = {
    range: '',
    country: '',
    region: '',
    eu: '',
    timezone: '',
    city: '',
    ll: [0, 0],
  }

  // outside IPv4 range
  if (ip > cache4.lastIP || ip < cache4.firstIP) {
    return null
  }

  // private IP
  for (i = 0; i < privateRange.length; i++) {
    if (ip >= privateRange[i][0] && ip <= privateRange[i][1]) {
      return null
    }
  }

  do {
    line = Math.round((cline - fline) / 2) + fline
    floor = buffer.readUInt32BE(line * recordSize)
    ceil = buffer.readUInt32BE(line * recordSize + 4)

    if (floor <= ip && ceil >= ip) {
      geodata.range = [floor, ceil]

      if (recordSize === RECORD_SIZE) {
        geodata.country = buffer.toString(
          'utf8',
          line * recordSize + 8,
          line * recordSize + 10
        )
      } else {
        locId = buffer.readUInt32BE(line * recordSize + 8)

        geodata.country = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 0,
            locId * locRecordSize + 2
          )
          .replace(/\u0000.*/, '')
        geodata.region = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 2,
            locId * locRecordSize + 5
          )
          .replace(/\u0000.*/, '')
        geodata.metro = locBuffer.readInt32BE(locId * locRecordSize + 5)
        geodata.ll[0] = buffer.readInt32BE(line * recordSize + 12) / 10000 // latitude
        geodata.ll[1] = buffer.readInt32BE(line * recordSize + 16) / 10000 // longitude
        geodata.area = buffer.readUInt32BE(line * recordSize + 20) // longitude
        geodata.eu = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 9,
            locId * locRecordSize + 10
          )
          .replace(/\u0000.*/, '')
        geodata.timezone = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 10,
            locId * locRecordSize + 42
          )
          .replace(/\u0000.*/, '')
        geodata.city = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 42,
            locId * locRecordSize + locRecordSize
          )
          .replace(/\u0000.*/, '')
      }

      return geodata
    } else if (fline === cline) {
      return null
    } else if (fline === cline - 1) {
      if (line === fline) {
        fline = cline
      } else {
        cline = fline
      }
    } else if (floor > ip) {
      cline = line
    } else if (ceil < ip) {
      fline = line
    }
  } while (1)
}

function lookup6 (ip) {
  var buffer = cache6.mainBuffer
  var recordSize = cache6.recordSize
  var locBuffer = cache4.locationBuffer
  var locRecordSize = cache4.locationRecordSize

  var geodata = {
    range: '',
    country: '',
    region: '',
    city: '',
    ll: [0, 0],
  }
  function readip (line, offset) {
    var ii = 0
    var ip = []

    for (ii = 0; ii < 2; ii++) {
      ip.push(buffer.readUInt32BE(line * recordSize + offset * 16 + ii * 4))
    }

    return ip
  }

  cache6.lastIP = readip(cache6.lastLine, 1)
  cache6.firstIP = readip(0, 0)

  var fline = 0
  var floor = cache6.lastIP
  var cline = cache6.lastLine
  var ceil = cache6.firstIP
  var line
  var locId

  if (utils.cmp6(ip, cache6.lastIP) > 0 || utils.cmp6(ip, cache6.firstIP) < 0) {
    return null
  }

  do {
    line = Math.round((cline - fline) / 2) + fline
    floor = readip(line, 0)
    ceil = readip(line, 1)

    if (utils.cmp6(floor, ip) <= 0 && utils.cmp6(ceil, ip) >= 0) {
      if (recordSize === RECORD_SIZE6) {
        geodata.country = buffer
          .toString('utf8', line * recordSize + 32, line * recordSize + 34)
          .replace(/\u0000.*/, '')
      } else {
        locId = buffer.readUInt32BE(line * recordSize + 32)

        geodata.country = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 0,
            locId * locRecordSize + 2
          )
          .replace(/\u0000.*/, '')
        geodata.region = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 2,
            locId * locRecordSize + 5
          )
          .replace(/\u0000.*/, '')
        geodata.metro = locBuffer.readInt32BE(locId * locRecordSize + 5)
        geodata.ll[0] = buffer.readInt32BE(line * recordSize + 36) / 10000 // latitude
        geodata.ll[1] = buffer.readInt32BE(line * recordSize + 40) / 10000 // longitude
        geodata.area = buffer.readUInt32BE(line * recordSize + 44) // area
        geodata.eu = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 9,
            locId * locRecordSize + 10
          )
          .replace(/\u0000.*/, '')
        geodata.timezone = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 10,
            locId * locRecordSize + 42
          )
          .replace(/\u0000.*/, '')
        geodata.city = locBuffer
          .toString(
            'utf8',
            locId * locRecordSize + 42,
            locId * locRecordSize + locRecordSize
          )
          .replace(/\u0000.*/, '')
      }
      // We do not currently have detailed region/city info for IPv6, but finally have coords
      return geodata
    } else if (fline === cline) {
      return null
    } else if (fline === cline - 1) {
      if (line === fline) {
        fline = cline
      } else {
        cline = fline
      }
    } else if (utils.cmp6(floor, ip) > 0) {
      cline = line
    } else if (utils.cmp6(ceil, ip) < 0) {
      fline = line
    }
  } while (1)
}

function get4mapped (ip) {
  var ipv6 = ip.toUpperCase()
  var v6prefixes = ['0:0:0:0:0:FFFF:', '::FFFF:']
  for (var i = 0; i < v6prefixes.length; i++) {
    var v6prefix = v6prefixes[i]
    if (ipv6.indexOf(v6prefix) == 0) {
      return ipv6.substring(v6prefix.length)
    }
  }
  return null
}

function preload (callback) {
  var datFile
  var datSize
  var asyncCache = JSON.parse(JSON.stringify(conf4))

  // when the preload function receives a callback, do the task asynchronously
  if (typeof arguments[0] === 'function') {
    async.series([
      function (cb) {
        async.series(
          [
            function (cb2) {
              datFile = dataFiles.cityNames
              cb2()
            },
            function (cb2) {
              datSize = datFile.byteLength
              asyncCache.locationBuffer = Buffer.alloc(datSize)
              cb2()
            },
            function (cb2) {
              datFile.copy(asyncCache.locationBuffer)
              cb2()
            },
            function (cb2) {
              cb2()
            },
            function (cb2) {
              datFile = dataFiles.city
              cb2()
            },
            function (cb2) {
              datSize = datFile.byteLength
              cb2()
            },
          ],
          function (err) {
            if (err) {
              if (err.code !== 'ENOENT' && err.code !== 'EBADF') {
                throw err
              }
              datFile = dataFiles.country
              datSize = datFile.byteLength
              asyncCache.recordSize = RECORD_SIZE
            }
            cb()
          }
        )
      },
      function () {
        asyncCache.mainBuffer = Buffer.alloc(datSize)

        async.series(
          [
            function (cb2) {
              datFile.copy(asyncCache.mainBuffer)
              cb2()
            },
            function (cb2) {
              cb2()
            },
          ],
          function (err) {
            if (err) {
              // keep old cache
            } else {
              asyncCache.lastLine = datSize / asyncCache.recordSize - 1
              asyncCache.lastIP = asyncCache.mainBuffer.readUInt32BE(
                asyncCache.lastLine * asyncCache.recordSize + 4
              )
              asyncCache.firstIP = asyncCache.mainBuffer.readUInt32BE(0)
              cache4 = asyncCache
            }
            callback(err)
          }
        )
      },
    ])
  } else {
    try {
      datFile = dataFiles.cityNames
      datSize = datFile ? datFile.byteLength : 0

      if (datSize === 0) {
        throw {
          code: 'EMPTY_FILE',
        }
      }

      cache4.locationBuffer = Buffer.from(datFile)

      datFile = dataFiles.city
      datSize = datFile.byteLength
    } catch (err) {
      if (
        err.code !== 'ENOENT' &&
        err.code !== 'EBADF' &&
        err.code !== 'EMPTY_FILE'
      ) {
        throw err
      }

      datFile = dataFiles.country
      datSize = datFile.byteLength
      cache4.recordSize = RECORD_SIZE
    }

    cache4.mainBuffer = Buffer.from(datFile)

    cache4.lastLine = datSize / cache4.recordSize - 1
    cache4.lastIP = cache4.mainBuffer.readUInt32BE(
      cache4.lastLine * cache4.recordSize + 4
    )
    cache4.firstIP = cache4.mainBuffer.readUInt32BE(0)
  }
}

function preload6 (callback) {
  var datFile
  var datSize
  var asyncCache6 = JSON.parse(JSON.stringify(conf6))

  // when the preload function receives a callback, do the task asynchronously
  if (typeof arguments[0] === 'function') {
    async.series([
      function (cb) {
        async.series(
          [
            function (cb2) {
              datFile = dataFiles.city6
              cb2()
            },
            function (cb2) {
              datSize = datFile.byteLength
              cb2()
            },
          ],
          function (err) {
            if (err) {
              if (err.code !== 'ENOENT' && err.code !== 'EBADF') {
                throw err
              }
              datFile = dataFiles.country6
              datSize = datFile.byteLength
              asyncCache6.recordSize = RECORD_SIZE6
            }
            cb()
          }
        )
      },
      function () {
        asyncCache6.mainBuffer = Buffer.alloc(datSize)

        async.series(
          [
            function (cb2) {
              datFile.copy(asyncCache6.mainBuffer)
              cb2()
            },
            function (cb2) {
              cb2()
            },
          ],
          function (err) {
            if (err) {
              // keep old cache
            } else {
              asyncCache6.lastLine = datSize / asyncCache6.recordSize - 1
              cache6 = asyncCache6
            }
            callback(err)
          }
        )
      },
    ])
  } else {
    try {
      datFile = dataFiles.city6
      datSize = datFile ? datFile.byteLength : 0

      if (datSize === 0) {
        throw {
          code: 'EMPTY_FILE',
        }
      }
    } catch (err) {
      if (
        err.code !== 'ENOENT' &&
        err.code !== 'EBADF' &&
        err.code !== 'EMPTY_FILE'
      ) {
        throw err
      }

      datFile = dataFiles.country6
      datSize = datFile.byteLength
      cache6.recordSize = RECORD_SIZE6
    }

    cache6.mainBuffer = Buffer.from(datFile)

    cache6.lastLine = datSize / cache6.recordSize - 1
  }
}

module.exports = {
  cmp: utils.cmp,

  lookup: function (ip) {
    if (!ip) {
      return null
    } else if (typeof ip === 'number') {
      return lookup4(ip)
    } else if (isIP(ip) === 4) {
      return lookup4(utils.aton4(ip))
    } else if (isIP(ip) === 6) {
      var ipv4 = get4mapped(ip)
      if (ipv4) {
        return lookup4(utils.aton4(ipv4))
      } else {
        return lookup6(utils.aton6(ip))
      }
    }

    return null
  },

  pretty: function (n) {
    if (typeof n === 'string') {
      return n
    } else if (typeof n === 'number') {
      return utils.ntoa4(n)
    } else if (n instanceof Array) {
      return utils.ntoa6(n)
    }

    return n
  },

  // Start watching for data updates. The watcher waits one minute for file transfer to
  // completete before triggering the callback.
  startWatchingDataUpdate: function (callback) {
    fsWatcher.makeFsWatchFilter(watcherName, geodatadir, 60 * 1000, function () {
      // Reload data
      async.series(
        [
          function (cb) {
            preload(cb)
          },
          function (cb) {
            preload6(cb)
          },
        ],
        callback
      )
    })
  },

  // Stop watching for data updates.
  stopWatchingDataUpdate: function () {
    fsWatcher.stopWatching(watcherName)
  },

  // clear data
  clear: function () {
    cache4 = JSON.parse(JSON.stringify(conf4))
    cache6 = JSON.parse(JSON.stringify(conf6))
  },

  // Reload data synchronously
  reloadDataSync: function () {
    preload()
    preload6()
  },

  // Reload data asynchronously
  reloadData: function (callback) {
    // Reload data
    async.series(
      [
        function (cb) {
          preload(cb)
        },
        function (cb) {
          preload6(cb)
        },
      ],
      callback
    )
  },
}

preload()
preload6()

// lookup4 = gen_lookup('geoip-country.dat', 4);
// lookup6 = gen_lookup('geoip-country6.dat', 16);
