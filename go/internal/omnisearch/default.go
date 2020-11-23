package omnisearch

import (
	"context"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/initutil"
)

func DefaultSearch(ctx context.Context, manager *initutil.Manager, parentsStr ...string) (<-chan *ResultReturn, error) {
	var rdvpAddrs []string
	{
		i := len(config.Config.P2P.RDVP)
		rdvpAddrs = make([]string, i)
		for i > 0 {
			i--
			rdvpAddrs[i] = config.Config.P2P.RDVP[i].Maddr
		}
	}
	var parents []interface{}
	{
		i := len(parentsStr)
		parents = make([]interface{}, i)
		for i > 0 {
			i--
			parents[i] = parentsStr[i]
		}
	}

	cor, err := NewCoordinator(ctx,
		CAddProvider(
			NewMirror(manager),
			NewManagerFromManager,
			NewRdvpConstructorFromStr(rdvpAddrs...),
		),
		CAddParser(
			NewParser(),
		),
		CAddEngine(
			NewEngine,
		),
	)
	if err != nil {
		return nil, err
	}
	return cor.Do(ctx, parents...), nil
}
