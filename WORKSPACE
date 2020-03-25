workspace(name = "berty")

load("@berty//go:repositories.bzl", "berty_go_repositories")

# fetch berty repos

berty_go_repositories()

# check bazel version

load("@build_bazel_rules_nodejs//:index.bzl", "check_bazel_version")

check_bazel_version("2.0.0")

# config go berty

load("@berty//go:config.bzl", "berty_go_config")

berty_go_config()
