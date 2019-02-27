// from https://gist.github.com/aleclarson/4a0bd67f8aad2af0669638374a91d9c5/revisions

func RCTLogError(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTSwiftLog.error(message, file: file, line: line)
}

func RCTLogWarn(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTSwiftLog.warn(message, file: file, line: line)
}

func RCTLogInfo(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTSwiftLog.info(message, file: file, line: line)
}

func RCTLog(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTSwiftLog.log(message, file: file, line: line)
}

func RCTLogTrace(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTSwiftLog.trace(message, file: file, line: line)
}
