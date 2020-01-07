require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-berty-bridge"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-berty-bridge
                   DESC
  s.homepage     = "https://github.com/berty/react-native-berty-bridge"
  s.license      = package["license"]
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Berty Technologies" => "oss@berty.tech" }
  s.platforms    = { :ios => "9.0", :tvos => "10.0" }
  s.source       = { :git => "https://github.com/berty/react-native-berty-bridge.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true
  s.swift_version = '5.0'

  s.ios.vendored_frameworks = 'ios/Frameworks/Bertybridge.framework'
  s.dependency "React"
  # s.dependency "..."
end
