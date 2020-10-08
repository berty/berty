require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "go-bridge"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  go-bridge
                   DESC
  s.homepage     = "https://github.com/berty/go-bridge"
  s.license      = package["license"]
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Berty Technologies" => "oss@berty.tech" }
  s.platforms    = { :ios => "12.0", :tvos => "10.0" }
  s.source       = { :git => "https://github.com/berty/go-bridge.git", :tag => "#{s.version}" }

  s.source_files = 'ios/*.{h,m,swift}'
  s.requires_arc = true
  s.swift_version = '5.0'

  # exclude arm64 for simulator
  s.pod_target_xcconfig = { 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64' }
  s.user_target_xcconfig = { 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64' }

  s.ios.vendored_frameworks = 'ios/Frameworks/Bertybridge.framework'
  s.dependency "React"
  # s.dependency "..."
end
