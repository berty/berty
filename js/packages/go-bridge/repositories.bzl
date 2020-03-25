load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@berty//go:repositories.bzl", "berty_go_repositories")

def berty_bridge_repositories():
    # utils
    maybe(
        git_repository,
        name = "bazel_skylib",
        remote = "https://github.com/bazelbuild/bazel-skylib",
        commit = "e59b620b392a8ebbcf25879fc3fde52b4dc77535",
        shallow_since = "1570639401 -0400",
    )
    maybe(
        http_archive,
        name = "build_bazel_rules_nodejs",
        sha256 = "ad4be2c6f40f5af70c7edf294955f9d9a0222c8e2756109731b25f79ea2ccea0",
        urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.38.3/rules_nodejs-0.38.3.tar.gz"],
    )

    # gomobile
    maybe(
        git_repository,
        name = "co_znly_rules_gomobile",
        remote = "https://github.com/znly/rules_gomobile",
        commit = "ef471f52c2b5cd7f7b8de417d9e6ded3f4d19e72",
        shallow_since = "1566492765 +0200",
    )
    maybe(
        git_repository,
        name = "build_bazel_rules_swift",
        remote = "https://github.com/bazelbuild/rules_swift.git",
        commit = "ebef63d4fd639785e995b9a2b20622ece100286a",
        shallow_since = "1570649187 -0700",
    )
    maybe(
        git_repository,
        name = "build_bazel_apple_support",
        remote = "https://github.com/bazelbuild/apple_support.git",
        commit = "8c585c66c29b9d528e5fcf78da8057a6f3a4f001",
        shallow_since = "1570646613 -0700",
    )

    berty_go_repositories()
