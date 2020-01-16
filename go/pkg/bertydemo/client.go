package bertydemo

import (
	context "context"
	"errors"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/orbitutil/identityberty"
	"berty.tech/berty/go/internal/orbitutil/storegroup"
	"berty.tech/berty/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller"
	"berty.tech/go-orbit-db/stores/operation"
	"github.com/google/uuid"
	cid "github.com/ipfs/go-cid"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type Client struct {
	api  ipfs_interface.CoreAPI
	odb  orbitdb.OrbitDB
	logs map[string]orbitdb.EventLogStore
	ks   *identityberty.BertySignedKeyStore
}

type Opts struct {
	OrbitDBDirectory string
}

func New(opts *Opts) (*Client, error) {
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

	ks := identityberty.NewBertySignedKeyStore()

	logs := make(map[string]orbitdb.EventLogStore)

	return &Client{api, odb, logs, ks}, nil
}

func boolPtr(b bool) *bool {
	return &b
}

func intPtr(i int) *int {
	return &i
}

func eventLogOptions(ks *identityberty.BertySignedKeyStore, req *Log_Request) (*orbitdb.CreateDBOptions, error) {
	var err error
	var options *orbitdb.CreateDBOptions

	options = &orbitdb.CreateDBOptions{}

	options.Create = boolPtr(true)

	access := make(map[string][]string)
	for _, me := range req.ManifestAccess {
		access[me.Key] = make([]string, len(me.Values))
		for i, v := range me.Values {
			access[me.Key][i] = v
		}
	}

	options.AccessController = accesscontroller.NewSimpleManifestParams(
		req.ManifestType,
		access)

	options.Keystore = ks

	options.Identity, err = ks.GetIdentityProvider().CreateIdentity(&identityprovider.CreateIdentityOptions{
		Type:     req.IdentityType,
		Keystore: ks,
		ID:       req.IdentityId,
	})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return options, nil
}

func (d *Client) registeredLogFromOpts(ctx context.Context, name string, opts *orbitdb.CreateDBOptions) (*string, error) {
	log, err := d.odb.Log(ctx, name, opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	// maybe replace by rand string or smth better
	handle := uuid.New().String()
	d.logs[handle] = log

	return &handle, nil
}

func (d *Client) Log(ctx context.Context, req *Log_Request) (*Log_Reply, error) {
	opts, err := eventLogOptions(d.ks, req)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	handle, err := d.registeredLogFromOpts(ctx, req.Name, opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	return &Log_Reply{LogHandle: *handle}, nil
}

func (d *Client) GroupToLog(ctx context.Context, req *GroupToLog_Request) (*GroupToLog_Reply, error) {
	gpk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPubKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	gsigk, err := crypto.UnmarshalEd25519PrivateKey(req.GroupSigningKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	err = d.ks.SetKey(gsigk)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	g := &group.Group{PubKey: gpk, SigningKey: gsigk}
	opts, err := storegroup.DefaultOptions(g, &orbitdb.CreateDBOptions{}, d.ks)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	handle, err := d.registeredLogFromOpts(ctx, req.Name, opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	return &GroupToLog_Reply{LogHandle: *handle}, nil
}

func (d *Client) AddKey(ctx context.Context, req *AddKey_Request) (*AddKey_Reply, error) {
	key, err := crypto.UnmarshalEd25519PrivateKey(req.PrivKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	err = d.ks.SetKey(key)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	return &AddKey_Reply{}, nil
}

func (d *Client) getLogByHandle(handle string) (orbitdb.EventLogStore, error) {
	if log, exists := d.logs[handle]; exists {
		return log, nil
	}
	return nil, errcode.TODO.Wrap(errors.New("no such log"))
}

func (d *Client) LogAdd(ctx context.Context, req *LogAdd_Request) (*LogAdd_Reply, error) {
	log, err := d.getLogByHandle(req.LogHandle)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	_, err = log.Add(ctx, req.Data)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	return &LogAdd_Reply{}, nil
}

func opToProtoOp(op operation.Operation) Log_Operation {
	return Log_Operation{Name: op.GetOperation(), Value: op.GetValue()}
}

func (d *Client) LogGet(ctx context.Context, req *LogGet_Request) (*LogGet_Reply, error) {
	log, err := d.getLogByHandle(req.LogHandle)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	c, err := cid.Decode(req.Cid)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	op, err := log.Get(ctx, c)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	pop := opToProtoOp(op)
	return &LogGet_Reply{Op: &pop}, nil
}

func maybeDecodeCid(str string) *cid.Cid {
	c, err := cid.Decode(str)
	if err != nil {
		return nil
	}
	return &c
}

func decodeStreamOptions(opts *Log_StreamOptions) *orbitdb.StreamOptions {
	if opts == nil {
		return nil
	}
	return &orbitdb.StreamOptions{
		GT:     maybeDecodeCid(opts.GT),
		GTE:    maybeDecodeCid(opts.GTE),
		LT:     maybeDecodeCid(opts.LT),
		LTE:    maybeDecodeCid(opts.LTE),
		Amount: intPtr(int(opts.Amount)),
	}
}

func (d *Client) LogList(ctx context.Context, req *LogList_Request) (*LogList_Reply, error) {
	log, err := d.getLogByHandle(req.LogHandle)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	opts := decodeStreamOptions(req.Options)

	ops, err := log.List(ctx, opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	var protoOps LogList_Operations
	for i, op := range ops {
		pop := opToProtoOp(op)
		protoOps.Ops[i] = &pop
	}

	return &LogList_Reply{Ops: &protoOps}, nil
}

func (d *Client) LogStream(req *LogStream_Request, srv DemoService_LogStreamServer) error {
	log, err := d.getLogByHandle(req.LogHandle)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	opts := decodeStreamOptions(req.Options)

	var ch chan operation.Operation
	err = log.Stream(srv.Context(), ch, opts)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	for op := range ch {
		pop := opToProtoOp(op)
		if err = srv.Send(&pop); err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func (d *Client) Close() error {
	return nil
}
