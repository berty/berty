package bertydemo

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go-orbit-db/stores/operation"
	cid "github.com/ipfs/go-cid"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/pkg/errcode"
)

type Client struct {
	api       ipfs_interface.CoreAPI
	odb       orbitdb.OrbitDB
	logs      map[string]orbitdb.EventLogStore
	logsMutex sync.Mutex
}

type Opts struct {
	CoreAPI          ipfs_interface.CoreAPI
	OrbitDBDirectory string
}

func New(opts *Opts) (*Client, error) {
	var err error

	ctx := context.Background()

	api := opts.CoreAPI
	if api == nil {
		// @NOTE(gfanton): CoreAPI is not mendatory here, but it's strongly recommended
		// because node lifecycle should not depend on bertydemo
		// Also (except in test) we should ALWAYS use CoreAPI instead of node directly
		api, _, err = ipfsutil.NewInMemoryCoreAPI(ctx)
		if err != nil {
			return nil, err
		}
	}

	if opts.OrbitDBDirectory == "" {
		opts.OrbitDBDirectory = ":memory:"
	}

	odb, err := orbitdb.NewOrbitDB(ctx, api, &orbitdb.NewOrbitDBOptions{Directory: &opts.OrbitDBDirectory})
	if err != nil {
		return nil, err
	}

	logs := make(map[string]orbitdb.EventLogStore)

	return &Client{api, odb, logs, sync.Mutex{}}, nil
}

func intPtr(i int) *int {
	return &i
}

func (d *Client) logFromToken(ctx context.Context, token string) (orbitdb.EventLogStore, error) {
	d.logsMutex.Lock()
	defer d.logsMutex.Unlock()

	if log, ok := d.logs[token]; ok {
		// I tried to avoid this map but orbitdb recreates log instances and looses operations even when fed with the same args
		return log, nil
	}
	sigkb, err := hex.DecodeString(token)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	sigk, err := crypto.UnmarshalEd25519PrivateKey(sigkb)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	ks := orbitutil.NewBertySignedKeyStore()
	err = ks.SetKey(sigk)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	g := &group.Group{PubKey: sigk.GetPublic(), SigningKey: sigk}
	opts, err := orbitutil.DefaultOptions(g, &orbitdb.CreateDBOptions{}, ks)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	log, err := d.odb.Log(ctx, "DemoLog", opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	d.logs[token] = log
	return log, nil
}

func (d *Client) LogToken(ctx context.Context, _ *LogToken_Request) (*LogToken_Reply, error) {
	sigk, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	sigkb, err := sigk.Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	return &LogToken_Reply{LogToken: hex.EncodeToString(sigkb)}, nil
}

func operationCidString(op operation.Operation) string {
	return op.GetEntry().GetHash().String()
}

func (d *Client) LogAdd(ctx context.Context, req *LogAdd_Request) (*LogAdd_Reply, error) {
	log, err := d.logFromToken(ctx, req.GetLogToken())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	op, err := log.Add(ctx, req.GetData())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	return &LogAdd_Reply{Cid: operationCidString(op)}, nil
}

func convertLogOperationToProtobufLogOperation(op operation.Operation) *LogOperation {
	if op == nil {
		return nil
	}
	return &LogOperation{
		Name:  op.GetOperation(),
		Value: op.GetValue(),
		Cid:   operationCidString(op),
	}
}

func (d *Client) LogGet(ctx context.Context, req *LogGet_Request) (*LogGet_Reply, error) {
	log, err := d.logFromToken(ctx, req.GetLogToken())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	c, err := cid.Decode(req.GetCid())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	op, err := log.Get(ctx, c)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	pop := convertLogOperationToProtobufLogOperation(op)
	return &LogGet_Reply{Operation: pop}, nil
}

func maybeDecodeCid(str string) *cid.Cid {
	c, err := cid.Decode(str)
	if err != nil {
		return nil
	}
	return &c
}

func decodeStreamOptions(opts *LogStreamOptions) *orbitdb.StreamOptions {
	if opts == nil {
		return nil
	}
	return &orbitdb.StreamOptions{
		GT:     maybeDecodeCid(opts.GetGT()),
		GTE:    maybeDecodeCid(opts.GetGTE()),
		LT:     maybeDecodeCid(opts.GetLT()),
		LTE:    maybeDecodeCid(opts.GetLTE()),
		Amount: intPtr(int(opts.GetAmount())),
	}
}

func (d *Client) LogList(ctx context.Context, req *LogList_Request) (*LogList_Reply, error) {
	log, err := d.logFromToken(ctx, req.GetLogToken())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	opts := decodeStreamOptions(req.GetOptions())

	ops, err := log.List(ctx, opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	protoOps := make([]*LogOperation, len(ops))
	for i, op := range ops {
		protoOps[i] = convertLogOperationToProtobufLogOperation(op)
	}

	return &LogList_Reply{Operations: protoOps}, nil
}

func (d *Client) LogStream(req *LogStream_Request, srv DemoService_LogStreamServer) error {
	// Hack using List until go-orbit-db Stream is fixed
	ctx, cancel := context.WithCancel(srv.Context())
	defer cancel()

	log, err := d.logFromToken(ctx, req.GetLogToken())
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	// @NOTE(gfanton): first listing should be done on client side,
	// im just keeping the logic here

	cops := make(chan operation.Operation, 1)

	mu := sync.Mutex{}
	cond := sync.NewCond(&mu)
	var listedcid []*cid.Cid = nil

	mu.Lock()
	// then subscribe to next event
	go log.Subscribe(ctx, func(e events.Event) {
		mu.Lock()
		defer mu.Unlock()

		var op operation.Operation
		var err error

		switch evt := e.(type) {
		case *stores.EventWrite:
			op, err = operation.ParseOperation(evt.Entry)
		case *stores.EventReplicateProgress:
			op, err = operation.ParseOperation(evt.Entry)
		default:
			return
		}

		if err != nil {
			fmt.Printf("unable to parse operation: %s\n", err.Error())
			return
		}

		// check if
		if len(listedcid) > 0 {
			if listedcid[0] == nil {
				cond.Wait() // wait for list to be fulfilled
			}

			// check if we already sent this event
			for _, lcid := range listedcid {
				if lcid == nil {
					break
				} else if lcid.String() == op.GetEntry().GetHash().String() {
					return
				}
			}

			// if event has not been sent yet we can free listedcid
			listedcid = nil
		}

		cops <- op
	})

	opts := decodeStreamOptions(req.GetOptions())
	if opts == nil {
		opts = &orbitdb.StreamOptions{}
	}

	// list existing ops
	ops, err := log.List(ctx, opts)
	if err != nil {
		mu.Unlock()
		return err
	}

	listedcid = make([]*cid.Cid, len(ops))
	go func() {
		mu.Lock()
		defer mu.Unlock()
		defer cond.Broadcast()

		// send previously listed ops
		for i, op := range ops {
			ccid := op.GetEntry().GetHash()
			listedcid[i] = &ccid
			select {
			case cops <- op:
			case <-ctx.Done():
			}
		}
	}()

	mu.Unlock()

	// loop over ops channel
	for {
		var op operation.Operation

		select {
		case op = <-cops:
		case <-ctx.Done():
			return ctx.Err()
		}

		pop := convertLogOperationToProtobufLogOperation(op)
		jsoned, _ := json.Marshal(pop)
		fmt.Println(string(jsoned))
		if err = srv.Send(pop); err != nil {
			return err
		}
	}
}

func (d *Client) Close() error {
	return d.odb.Close()

}
