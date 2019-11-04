load("@rules_jvm_external//:defs.bzl", "maven_install")

def berty_app_config():
    # install maeven package
    maven_install(
        artifacts = [
            "com.facebook.infer.annotation:infer-annotation:0.11.2",
            "javax.inject:javax.inject:1",
            "androidx.appcompat:appcompat:1.0.2",
            "com.facebook.fresco:fresco:2.0.0",
            "com.facebook.fresco:imagepipeline-okhttp3:2.0.0",
            "com.facebook.soloader:soloader:0.6.0",
            "com.google.code.findbugs:jsr305:3.0.2",
            "com.squareup.okhttp3:okhttp:3.12.1",
            "com.squareup.okhttp3:okhttp-urlconnection:3.12.1",
            "com.squareup.okio:okio:1.15.0",
        ],
        repositories = [
            "https://repo1.maven.org/maven2/",
            "https://maven.google.com/",
            "https://jcenter.bintray.com/",
            # "https://dl.bintray.com/facebook/maven/",
        ],
    )
