workflow "Test ipa" {
  on = "status"
  resolves = ["berty/test-github-actions/yolo-sauce@master"]
}

action "n0izn0iz/action-status-filter@master" {
  uses = "n0izn0iz/action-status-filter@master"
  args = ["ci/circleci: build"]
}

action "berty/test-github-actions/yolo-sauce@master" {
  uses = "berty/test-github-actions/yolo-sauce@master"
  needs = ["n0izn0iz/action-status-filter@master"]
  args = "client.rn.ios-beta Berty.ipa"
  secrets = ["SAUCE_USERNAME", "SAUCE_API_KEY"]
}
