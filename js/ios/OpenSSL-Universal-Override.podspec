Pod::Spec.new do |s|
  s.name         = "OpenSSL-Universal"
  s.version      = "1.1.180"
  s.summary      = "OpenSSL for iOS"
  s.description  = "OpenSSL is an SSL/TLS and Crypto toolkit. Supports iOS 64 bits archs including Simulator (arm64,armv64e,x86_64)."
  s.homepage     = "https://github.com/krzyzanowskim/OpenSSL"
  s.license	     = { :type => 'OpenSSL (OpenSSL/SSLeay)' }
  s.source       = { :git => "https://github.com/krzyzanowskim/OpenSSL.git", :tag => "1.1.180" }

  s.authors       =  {'Mark J. Cox' => 'mark@openssl.org',
                     'Ralf S. Engelschall' => 'rse@openssl.org',
                     'Dr. Stephen Henson' => 'steve@openssl.org',
                     'Ben Laurie' => 'ben@openssl.org',
                     'Lutz Jänicke' => 'jaenicke@openssl.org',
                     'Nils Larsch' => 'nils@openssl.org',
                     'Richard Levitte' => 'nils@openssl.org',
                     'Bodo Möller' => 'bodo@openssl.org',
                     'Ulf Möller' => 'ulf@openssl.org',
                     'Andy Polyakov' => 'appro@openssl.org',
                     'Geoff Thorpe' => 'geoff@openssl.org',
                     'Holger Reif' => 'holger@openssl.org',
                     'Paul C. Sutton' => 'geoff@openssl.org',
                     'Eric A. Young' => 'eay@cryptsoft.com',
                     'Tim Hudson' => 'tjh@cryptsoft.com',
                     'Justin Plouffe' => 'plouffe.justin@gmail.com'}

  s.requires_arc = false
  s.default_subspec = 'Static'
  s.ios.deployment_target = '12.0'

  s.subspec 'Static' do |sp|
    sp.ios.deployment_target = '12.0'
    sp.ios.source_files        = 'tor-deps/include/openssl/**/*.h'
    sp.ios.public_header_files = 'tor-deps/include/openssl/**/*.h'
    sp.ios.header_dir          = 'openssl'
    sp.ios.preserve_paths      = 'tor-deps/lib/libcrypto.a', 'ios/lib/libssl.a'
    sp.ios.vendored_libraries  = 'tor-deps/lib/libcrypto.a', 'ios/lib/libssl.a'
  end
end
