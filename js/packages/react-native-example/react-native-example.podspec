require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-example"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-example
                   DESC
  s.homepage     = "https://github.com/berty/react-native-example"
  s.license      = package["license"]
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Berty Technologies" => "oss@berty.tech" }
  s.platforms    = { :ios => "9.0", :tvos => "10.0" }
  s.source       = { :git => "https://github.com/berty/react-native-example.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency 'AFNetworking', '~> 3.0'
  # s.dependency "..."
end
