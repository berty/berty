# Ready to go Grafana Dashboard

Here are some prebuilt dashboards that you can add to your Grafana instance. To
import follow the Grafana docs [here](https://grafana.com/docs/grafana/latest/dashboards/export-import/#import-dashboard)

## Setup

To make sure you're emitting the correct metrics you'll have to register the
metrics with a Prometheus Registerer. For example:

``` go
import (
    // ...
	rcmgr "github.com/libp2p/go-libp2p/p2p/host/resource-manager"
	rcmgrObs "github.com/libp2p/go-libp2p/p2p/host/resource-manager/obs"

	"github.com/prometheus/client_golang/prometheus"
)

    func SetupResourceManager() (network.ResourceManager, error) {
        rcmgrObs.MustRegisterWith(prometheus.DefaultRegisterer)

        str, err := rcmgrObs.NewStatsTraceReporter()
        if err != nil {
            return nil, err
        }

        return rcmgr.NewResourceManager(limiter, rcmgr.WithTraceReporter(str))
    }
```

## Updating Dashboard json

Use the share functionality on an existing dashboard, and make sure to toggle
"Export for sharing externally". See the [Grafana
Docs](https://grafana.com/docs/grafana/latest/dashboards/export-import/#exporting-a-dashboard)
for more details.
