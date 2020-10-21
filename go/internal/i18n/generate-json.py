#!/usr/bin/env python3
import sys
import os
import json

# This script generates the translation files for crowdin from i18n.go.
# For an example of format see: go/internal/inituil/i18n.go.

# Move to go/.
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(os.path.dirname(sys.argv[0])))))

# listI18ns will list all `i18n.go` across the go repo.
def listI18ns(path):
    for i in os.listdir(path):
        ijoin = os.path.join(path, i)
        if os.path.isfile(ijoin):
            if i == "i18n.go":
                yield ijoin
            continue
        for j in listI18ns(ijoin):
            yield j

total = {}
for path in listI18ns("."):
    with open(path, "r") as f:
        t = f.read()
        # package parsing loop
        package = t.split("package ")
        if len(package) < 2:
            print("Can't find \"package\" in: " + i)
            sys.exit(1)
        package = package[1].split("\n")[0]
        # package now holds the package name

        # Now we parse the variables
        varContent = t.split("var (")
        if len(varContent) < 2:
            print("Can't find \"var (\" in: " + i)
            sys.exit(1)
        varContent = varContent[1].split(")")[0].split("\n")
        # varContent now hold a list of all the variables.
        variables = {}
        for i in varContent:
            name = i.split("i18n")
            if len(name) < 2:
                # Might just be an empty line or other
                continue
            name = name[1].split(" ")[0]
            # name now holds the name of the variable
            content = i.split('"')
            if len(content) < 2:
                continue
            content = content[1].split('"')[0]
            # content now holds the content of the variable
            # Now we will unescape it and save it
            variables[name] = json.loads('"' + content + '"')
        total[os.path.dirname(path) + "#" + package] = variables

# Writing the output
with open("internal/i18n/locales/en.json", "w") as f:
    f.write(json.dumps(total, indent=2, sort_keys=True) + "\n")
