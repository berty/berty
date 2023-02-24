# gh-bench-hook

Serverless function that publish benchmark results on a remote repository results without providing a privileged GITHUB_TOKEN.

``` text
                                                    ┌───────────────┬───────────┐
                                                    │Benchmark-Repo             │
                                                    ├ ─ ─ ─ ─ ─ ─ ─ ┘           │
                                                    │    ┌─────────────────┐    │
                                                    │    │                 │    │
                                                    │    │  Action Update  │    │
                               Trigger──────────────┼───▶│    Benchmark    │    │
                                 │                  │    │                 │    │
                                 │                  │    │                 │    │
                                 │                  │    └─────────────────┘    │
                                 │                  │             ▲             │
                                 │                  └─────────────┼─────────────┘
                                 │                                │
                                 │                                │
                                 │                                │
                         ┌──────────────┐                       Fetch
    ┌ ─ ─ ─ ─ ─ ┐        │              │                      Artifact
     priviliged  ────────┼◎ Serverless  │                         │
    └ ─ ─ ─ ─ ─ ┘        │              │                         │
                         └──────────────┘                         │
                                 ▲                                │
                                 │                                │
                                 │                    ┌───────────┼─┬──────────┐
                                 │                    │ Berty-Repo│            │
                                 │                    ├ ─ ─ ─ ─ ─ ▼ ┘          │
                                 │                    │    ┌─────────────┐     │
                                 │                    │    │             │     │
                                 │                    │    │   Action    │     │
                              Webhook─────────────────┼────│  Generate   │     │
                                                      │    │ Benchmarks  │     │
                                                      │    │             │     │
                                                      │    └─────────────┘     │
                                                      │                        │
                                                      └────────────────────────┘
```

Based on https://github.com/scaleway/serverless-scaleway-functions/tree/master/examples/go.
