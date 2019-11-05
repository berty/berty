load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")

def berty_go_repositories():
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

    # go
    maybe(
        http_archive,
        name = "io_bazel_rules_go",
        urls = [
            "https://storage.googleapis.com/bazel-mirror/github.com/bazelbuild/rules_go/releases/download/v0.20.1/rules_go-v0.20.1.tar.gz",
            "https://github.com/bazelbuild/rules_go/releases/download/v0.20.1/rules_go-v0.20.1.tar.gz",
        ],
        sha256 = "842ec0e6b4fbfdd3de6150b61af92901eeb73681fd4d185746644c338f51d4c0",
        patches = [
            "@berty_go//:third_party/io_bazel_rules_go/PR-2181-rebase-0.20.1.patch",
        ],
        patch_tool = "git",
        patch_args = ["apply"],
    )

    # protobuf
    maybe(
        git_repository,
        name = "com_google_protobuf",
        commit = "d09d649aea36f02c03f8396ba39a8d4db8a607e4",
        shallow_since = "1571943965 -0700",
        remote = "https://github.com/protocolbuffers/protobuf",
    )

    # gazelle
    maybe(
        http_archive,
        name = "bazel_gazelle",
        sha256 = "7fc87f4170011201b1690326e8c16c5d802836e3a0d617d8f75c3af2b23180c4",
        urls = [
            "https://storage.googleapis.com/bazel-mirror/github.com/bazelbuild/bazel-gazelle/releases/download/0.18.2/bazel-gazelle-0.18.2.tar.gz",
            "https://github.com/bazelbuild/bazel-gazelle/releases/download/0.18.2/bazel-gazelle-0.18.2.tar.gz",
        ],
    )

    # golangci-lint
    maybe(
        http_archive,
        name = "com_github_atlassian_bazel_tools",
        strip_prefix = "bazel-tools-a2138311856f55add11cd7009a5abc8d4fd6f163",
        sha256 = "9db3d3eededb398ae7d5a00b428d32b59577da0b3f4b4eb07daf710509008bfc",
        urls = ["https://github.com/atlassian/bazel-tools/archive/a2138311856f55add11cd7009a5abc8d4fd6f163.zip"],
    )
