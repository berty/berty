require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "@berty-tech/react-native-core"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-core
                   DESC
  s.homepage     = "https://github.com/github_account/react-native-core"
  s.license      = "(Apache-2.0 OR MIT)"
  s.authors      = { "Berty Technologies" => "oss@berty-tech.tech" }
  s.platforms    = { :ios => "9.0", :tvos => "10.0" }
  s.source       = { :git => "https://github.com/github_account/react-native-core.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
	s.dependency 'AFNetworking', '~> 3.0'
  # s.dependency "..."
end
