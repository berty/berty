load("@berty//go:config.bzl", "berty_go_config")
load("@co_znly_rules_gomobile//:repositories.bzl", "gomobile_repositories")
load("@build_bazel_apple_support//lib:repositories.bzl", "apple_support_dependencies")
load("@build_bazel_rules_swift//swift:repositories.bzl", "swift_rules_dependencies")

def berty_bridge_config():
    # fetch and config berty go dependencies
    berty_go_config()

    # config gomobile repositories
    gomobile_repositories()

    # config ios
    apple_support_dependencies()
    swift_rules_dependencies()
