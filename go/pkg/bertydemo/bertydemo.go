package bertydemo

import context "context"

type BertyDemo struct {
}

func New() (*BertyDemo, error) {

	// cfg, err := createBuildConfig()
	// if err != nil {
	// 	panic(err)
	// }

	// // var err error
	// api, err := ipfsutil.NewConfigurableCoreAPI(ctx, cfg, ipfsutil.OptionMDNSDiscovery)
	// if err != nil {
	// 	panic(err)
	// }

	return &BertyDemo{}, nil
}

func (d *BertyDemo) TestUnary(context.Context, *TestUnary_Request) (*TestUnary_Reply, error) {
	return &TestUnary_Reply{}, nil
}

func (d *BertyDemo) Close() error {
	return nil
}
