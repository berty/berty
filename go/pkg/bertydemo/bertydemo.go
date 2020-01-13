package bertydemo

import (
	context "context"

	"berty.tech/berty/go/internal/ipfsutil"
	orbitdb "berty.tech/go-orbit-db"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
)

type BertyDemo struct {
	api ipfs_interface.CoreAPI
	odb orbitdb.OrbitDB
}

type Opts struct {
	OrbitDBDirectory string
}

func New(opts *Opts) (*BertyDemo, error) {
	ctx := context.Background()

	api, err := ipfsutil.NewInMemoryCoreAPI(ctx)
	if err != nil {
		return nil, err
	}

	if opts.OrbitDBDirectory == "" {
		opts.OrbitDBDirectory = ":memory:"
	}

	odb, err := orbitdb.NewOrbitDB(ctx, api, &orbitdb.NewOrbitDBOptions{Directory: &opts.OrbitDBDirectory})
	if err != nil {
		return nil, err
	}

	return &BertyDemo{api, odb}, nil
}

func (d *BertyDemo) OrbitDBLog(context.Context, *OrbitDBLog_Request) (*OrbitDBLog_Reply, error) {
	return &OrbitDBLog_Reply{}, nil
}

func (d *BertyDemo) Close() error {
	return nil
}
