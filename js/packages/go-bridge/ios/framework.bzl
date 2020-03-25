load("@build_bazel_rules_apple//apple:versioning.bzl", "apple_bundle_version")
load("@build_bazel_rules_apple//apple:ios.bzl", "ios_static_framework")
load("@bazel_tools//tools/build_defs/pkg:pkg.bzl", "pkg_tar")
load("@co_znly_rules_gomobile//:objc.bzl", "gobind_objc")

_MODULE_MAP_TPL = """\
framework module {name} {{
{headers}

    export *
}}
"""

_UMBRELLA_HEADER_TPL = """\
#ifndef __{name}_FRAMEWORK_H__
#define __{name}_FRAMEWORK_H__

{includes}

#endif
"""

def _module_map_impl(ctx):
    headers = [ hdr.basename for hdr in ctx.attr.objc.output_groups.hdrs.to_list()]
    headers.append(ctx.attr.bundle_id + ".h")
    ctx.actions.write(ctx.outputs.module_map, _MODULE_MAP_TPL.format(
        name = ctx.attr.bundle_id,
        headers = "\n".join([
            "header \"{}\"".format(hdr)
        for hdr in headers
        ]),
    ))

def _umbrella_header_impl(ctx):
    ctx.actions.write(ctx.outputs.umbrella, _UMBRELLA_HEADER_TPL.format(
        name = ctx.attr.bundle_id,
        includes = "\n".join([
            "#include \"{}\"".format(hdr.basename)
        for hdr in ctx.attr.objc.output_groups.hdrs.to_list()
        ]),
    ))


#TODO: postprocess action

# def _postprocess_impl(ctx):
#     ctx.actions.run(
#         outputs = [],
#         cmd = "ls .",
#     )


# postprocess = rule(
#     implementation = _postprocess_impl,
#     attrs = {
#         "script": attr.string(
#             exec
#             mandatory = True,
#         ),
#         "framework": attr.label(
#             mandatory = True,
#         ),
#     },
# )


module_map = rule(
    implementation = _module_map_impl,
    attrs = {
        "bundle_id": attr.string(
            mandatory = True,
        ),
        "objc": attr.label(
            mandatory = True,
        ),
    },
    outputs = {
        "module_map": "module.modulemap"
    },
)

umbrella_header = rule(
    implementation = _umbrella_header_impl,
    attrs = {
        "bundle_id": attr.string(
            mandatory = True,
        ),
        "objc": attr.label(
            mandatory = True,
        ),
    },
    outputs = {
        "umbrella": "umbrella.h"
    },
)

def gen_framework(name, bundle_name):
    gobind_objc(
        name = "bridge",
        objc_prefix = "",
        tags = [],
        deps = [
            "@berty//go/framework/gobridge:go_default_library",
        ],
        gc_linkopts = [
            "-compressdwarf=false",
        ]
    )

    native.objc_import(
        name = "bridge_lib",
        hdrs = [":bridge.objc.hdrs"],
        alwayslink = True,
        archives = [
            ":bridge.objc.binary"
        ],
    )

    apple_bundle_version(
        name = "bridge_version",
        build_label_pattern = "bridge_{version}/build_{build}",
        build_version = "{version}.{build}",
        capture_groups = {
            "version": "\d+\.\d+",
            "build": "\d+",
        },
        short_version_string = "{version}",
        fallback_build_label = "bridge_99.99/build_999",
    )

    ios_static_framework(
        name = "bridge_sdk",
        bundle_name = bundle_name,
        minimum_os_version = "9.0",
        version = ":bridge_version",
        deps = [
            ":bridge_lib",
        ],
    )

    module_map(
        name = "modules",
        bundle_id = bundle_name,
        objc = ":bridge.objc",
    )

    umbrella_header(
        name = "umbrella",
        bundle_id = bundle_name,
        objc = ":bridge.objc",
    )

    native.genrule(
        name = "bridge_umbrella",
        srcs = [":umbrella"],
        outs = [bundle_name + ".h"],
        cmd = "cat $< > $@",
    )

    native.filegroup(
        name = "bridge_resources",
        srcs = native.glob(["*.plist"]),
    )

    native.genrule(
        name = "bridge_binary",
        srcs = [":bridge_sdk.apple_static_library"],
        outs = [bundle_name],
        cmd = "cat $< > $@",
    )

    pkg_tar(
        name = "bridge_framework_binary",
        package_dir = "Versions/A",
        srcs = [":bridge_binary"],
    )

    pkg_tar(
        name = "bridge_framework_headers",
        package_dir = "Versions/A/Headers",
        srcs = [
            ":bridge_umbrella",
            ":bridge.objc.hdrs",
        ],
    )

    pkg_tar(
        name = "bridge_framework_modules",
        package_dir = "Versions/A/Modules",
        srcs = [":modules"],
    )

    pkg_tar(
        name = "bridge_framework_resources",
        package_dir = "Versions/A/Resources",
        srcs = [":bridge_resources"],
    )

    symls = {}
    symls["Modules"] = "Versions/A/Modules"
    symls["Headers"] = "Versions/A/Headers"
    symls["Resources"] = "Versions/A/Resources"
    symls[bundle_name] =  "Versions/A/" + bundle_name
    symls["Versions/Current"] = "A"

    pkg_tar(
        name = name,
        extension = "tar.gz",
        symlinks = symls,
        deps = [
            ":bridge_framework_modules",
            ":bridge_framework_binary",
            ":bridge_framework_resources",
            ":bridge_framework_headers",
        ],
    )

    # postprocess(
    #     name = name,
    #     script = "bazel_process_framework.sh",
    #     framework = ":framework",
    # )
