load("@io_bazel_rules_go//go:def.bzl", "go_library")
load("@bazel_gazelle//:def.bzl", "gazelle")

# gazelle:ignore

go_library(
    name = "go_default_library",
    srcs = [
        "bio.go",
        "build.go",
        "cert.go",
        "ciphers.go",
        "ciphers_gcm.go",
        "conn.go",
        "ctx.go",
        "dh.go",
        "dhparam.go",
        "digest.go",
        "engine.go",
        "fips.go",
        "hmac.go",
        "hostname.c",
        "hostname.go",
        "http.go",
        "init.go",
        "init_posix.go",
        "init_windows.go",
        "key.go",
        "mapping.go",
        "md4.go",
        "md5.go",
        "net.go",
        "nid.go",
        "pem.go",
        "sha1.go",
        "sha256.go",
        "shim.c",
        "shim.h",
        "sni.c",
        "ssl.go",
        "tickets.go",
    ],
    cgo = True,
    clinkopts = select({
        "@bazel_tools//src/conditions:darwin": [
            "-L/usr/local/opt/openssl/lib"
        ],
        "//conditions:default": [],
    }) + [
        "-lssl",
        "-lcrypto",
    ],
    copts = select({
        "@bazel_tools//src/conditions:darwin": [
            "-I/usr/local/opt/openssl/include"
        ],
        "//conditions:default": [],
    }),
    importmap = "berty.tech/berty/go/vendor/github.com/libp2p/go-openssl",
    importpath = "github.com/libp2p/go-openssl",
    visibility = ["//visibility:public"],
    deps = [
        "//vendor/github.com/libp2p/go-openssl/utils:go_default_library",
        "//vendor/github.com/spacemonkeygo/spacelog:go_default_library",
    ],
)
