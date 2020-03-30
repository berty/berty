package bertydemo

import (
	"context"
	crand "crypto/rand"
	"encoding/hex"
	"encoding/json"
	"sync"
	"time"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/stores/operation"
	cid "github.com/ipfs/go-cid"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
)

type Service struct {
	log       *zap.Logger
	api       ipfs_interface.CoreAPI
	odb       orbitdb.OrbitDB
	logs      map[string]orbitdb.EventLogStore
	logsMutex *sync.Mutex
}

type Opts struct {
	Logger           *zap.Logger
	CoreAPI          ipfs_interface.CoreAPI
	OrbitDBDirectory string
}

func New(opts *Opts) (*Service, error) {
	var err error
	var log *zap.Logger

	ctx := context.Background()

	if log = opts.Logger; log == nil {
		log = zap.NewNop()
	}

	log = log.Named("bertydemo")

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

	if err := odb.RegisterAccessControllerType(bertyprotocol.NewSimpleAccessController); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	logs := make(map[string]orbitdb.EventLogStore)

	logsMutex := &sync.Mutex{}

	return &Service{log, api, odb, logs, logsMutex}, nil
}

func intPtr(i int) *int {
	return &i
}

func (s *Service) logFromToken(ctx context.Context, token string) (orbitdb.EventLogStore, error) {
	s.logsMutex.Lock()
	defer s.logsMutex.Unlock()

	if log, ok := s.logs[token]; ok {
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
	ks := &bertyprotocol.BertySignedKeyStore{}
	err = ks.SetKey(sigk)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	pubkb, err := sigk.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	sigkb, err = cryptoutil.SeedFromEd25519PrivateKey(sigk)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	g := &bertytypes.Group{PublicKey: pubkb, Secret: sigkb}
	opts, err := bertyprotocol.DefaultOrbitDBOptions(g, &orbitdb.CreateDBOptions{}, ks, "log")
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	log, err := s.odb.Log(ctx, "DemoLog", opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	s.logs[token] = log
	return log, nil
}

func (s *Service) LogToken(ctx context.Context, _ *LogToken_Request) (*LogToken_Reply, error) {
	sigk, _, err := crypto.GenerateEd25519Key(crand.Reader)
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

func (s *Service) LogAdd(ctx context.Context, req *LogAdd_Request) (*LogAdd_Reply, error) {
	log, err := s.logFromToken(ctx, req.GetLogToken())
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

func (s *Service) LogGet(ctx context.Context, req *LogGet_Request) (*LogGet_Reply, error) {
	log, err := s.logFromToken(ctx, req.GetLogToken())
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
	amount := -1
	if opts.GetAmount() != 0 {
		amount = int(opts.GetAmount())
	}
	return &orbitdb.StreamOptions{
		GT:     maybeDecodeCid(opts.GetGT()),
		GTE:    maybeDecodeCid(opts.GetGTE()),
		LT:     maybeDecodeCid(opts.GetLT()),
		LTE:    maybeDecodeCid(opts.GetLTE()),
		Amount: intPtr(amount),
	}
}

func (s *Service) LogList(ctx context.Context, req *LogList_Request) (*LogList_Reply, error) {
	log, err := s.logFromToken(ctx, req.GetLogToken())
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

func (s *Service) LogStream(req *LogStream_Request, srv DemoService_LogStreamServer) error {
	// Hack using List until go-orbit-db Stream is fixed
	ctx := srv.Context()
	token := req.GetLogToken()
	log, err := s.logFromToken(ctx, token)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	opts := decodeStreamOptions(req.GetOptions())
	if opts == nil {
		opts = &orbitdb.StreamOptions{
			Amount: intPtr(-1),
		}
	}
	s.log.Debug("logstream listening", zap.String("token", token), zap.Stringer("since", opts.GT))
	defer s.log.Debug("logstream stopped to listen", zap.String("token", token))

	dc := ctx.Done()
	for {
		if dc != nil {
			select {
			case _, done := <-dc:
				if done {
					return nil
				}
			default:
			}
		} // else we are in an infinite loop
		ops, err := log.List(ctx, opts)
		if err != nil {
			return err
		}
		l := len(ops)
		if l > 0 {
			for i := 0; i < l; i++ {
				pop := convertLogOperationToProtobufLogOperation(ops[i])
				jsoned, _ := json.Marshal(pop)
				s.log.Debug("LogStream", zap.String("token", token), zap.String("json", string(jsoned)))
				if err = srv.Send(pop); err != nil {
					return err
				}
			}
			if *opts.Amount != -1 && *opts.Amount <= l {
				return nil
			}
			lastOpCid := ops[l-1].GetEntry().GetHash()
			opts.GT = &lastOpCid
			if *opts.Amount != -1 {
				*opts.Amount -= l
			}
		}
		time.Sleep(1 * time.Second)
	}
}

func (s *Service) Close() error {
	return s.odb.Close()
}
