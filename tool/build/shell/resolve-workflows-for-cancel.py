#!/usr/bin/env python3
import json
import requests

targetedWorkflows = [
    "Android",
    "Go",
    "JS",
    "iOS",
    "Protobuf"
]

ids = []
for i in json.loads(requests.get("https://api.github.com/repos/berty/berty/actions/workflows").text)["workflows"]:
    if i["name"] not in targetedWorkflows:
        continue
    ids.append(str(i["id"]))

print("::set-output name=IDS::" + ", ".join(ids))
