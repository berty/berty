workflow "Test with ipa" {
  resolves = ["Upload to sauce"]
  on = "status"
}

action "On build success" {
  uses = "n0izn0iz/action-status-filter@master"
  args = ["ci/circleci: build-client"]
}

action "Upload to sauce" {
  uses = "berty/test-github-actions/yolo-sauce@master"
  args = "client.rn.ios-beta Berty.ipa"
  secrets = ["SAUCE_USERNAME", "SAUCE_API_KEY"]
  needs = ["On build success"]
}
