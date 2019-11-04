load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

def berty_app_repositories():
    # utils
    maybe(
        http_archive,
        name = "rules_jvm_external",
        sha256 = "79c9850690d7614ecdb72d68394f994fef7534b292c4867ce5e7dec0aa7bdfad",
        strip_prefix = "rules_jvm_external-2.8",
        url = "https://github.com/bazelbuild/rules_jvm_external/archive/2.8.zip",
    )
    maybe(
        http_archive,
        name = "build_bazel_rules_nodejs",
        sha256 = "ad4be2c6f40f5af70c7edf294955f9d9a0222c8e2756109731b25f79ea2ccea0",
        urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.38.3/rules_nodejs-0.38.3.tar.gz"],
    )
