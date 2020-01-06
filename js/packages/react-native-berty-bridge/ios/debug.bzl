def dump(obj, obj_name):
    s = '\n' + _dumpstr(obj, obj_name)
    print(s)

def _dumpstr(root_obj, root_obj_name):
    BLACKLIST = [
        "InputFileConfiguredTarget.output_group",
        "Label.Label",
        "Label.relative",
        "License.to_json",
        "RuleConfiguredTarget.output_group",
        "ctx.action",
        "ctx.check_placeholders",
        "ctx.empty_action",
        "ctx.expand",
        "ctx.expand_location",
        "ctx.expand_make_variables",
        "ctx.file_action",
        "ctx.middle_man",
        "ctx.new_file",
        "ctx.resolve_command",
        "ctx.rule",
        "ctx.runfiles",
        "ctx.template_action",
        "ctx.tokenize",
        "fragments.apple",
        "fragments.cpp",
        "fragments.java",
        "fragments.jvm",
        "fragments.objc",
        "runfiles.symlinks",
        "struct.output_licenses",
        "struct.to_json",
        "struct.to_proto",
    ]
    MAXLINES = 4000
    ROOT_MAXDEPTH = 5

    # List of printable lines
    lines = []

    # Bazel doesn't allow a function to recursively call itself, so
    # use an explicit stack
    stack = [(root_obj, root_obj_name, 0, ROOT_MAXDEPTH)]
    # No while() in Bazel, so use for loop over large range
    for _ in range(MAXLINES):
        if len(stack) == 0:
            break
        obj, obj_name, indent, maxdepth = stack.pop()

        obj_type = type(obj)
        indent_str = ' '*indent
        line = '{indent_str}{obj_name}[{obj_type}]:'.format(
            indent_str=indent_str, obj_name=obj_name, obj_type=obj_type)

        if maxdepth == 0 or obj_type in ['dict', 'list', 'set', 'string']:
            # Dump value as string, inline
            line += ' ' + str(obj)
        else:
            # Dump all of value's fields on separate lines
            attrs = dir(obj)
            # Push each field to stack in reverse order, so they pop
            # in sorted order
            for attr in reversed(attrs):
                if "%s.%s" % (obj_type, attr) in BLACKLIST:
                    value = '<blacklisted attr (%s)>' % attr
                else:
                    value = getattr(obj, attr, '<getattr(%s) failed>' % attr)
                stack.append((value, attr, indent+4, maxdepth-1))
        lines.append(line)
    return '\n'.join(lines)
