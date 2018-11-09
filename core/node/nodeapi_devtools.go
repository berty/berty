package node

import (
	"bufio"
	"context"
	crand "crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"io"
	"math/rand"
	"strings"
	"time"

	"berty.tech/core"
	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/crypto/sigchain"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/deviceinfo"
	"berty.tech/core/sql"
	"berty.tech/core/testrunner"
	"github.com/brianvoe/gofakeit"
	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
)

func (n *Node) GenerateFakeData(_ context.Context, input *node.Void) (*node.Void, error) {
	// FIXME: enable mutext, but allow calling submethod, i.e., node.CreateConversation
	//n.handleMutex.Lock()
	//defer n.handleMutex.Unlock()

	contacts := []*entity.Contact{}
	for i := 0; i < 10; i++ {
		var (
			username   = gofakeit.Username()
			devicename = fmt.Sprintf("%s's phone", username)
		)
		if rand.Intn(3) > 0 {
			username = fmt.Sprintf("%s %s", gofakeit.FirstName(), gofakeit.LastName())
		}

		priv, err := rsa.GenerateKey(crand.Reader, 512)
		if err != nil {
			return nil, errors.Wrap(err, "failed to generate rsa key")
		}
		privBytes, err := x509.MarshalPKCS8PrivateKey(priv)
		if err != nil {
			return nil, errors.Wrap(err, "failed to marshal private key")
		}
		pubBytes, err := x509.MarshalPKIXPublicKey(priv.Public())
		if err != nil {
			return nil, errors.Wrap(err, "failed to marshal public key")
		}
		kp := keypair.InsecureCrypto{}
		if err := kp.SetPrivateKeyData(privBytes); err != nil {
			return nil, errors.Wrap(err, "failed to set private key in kp")
		}
		sc := sigchain.SigChain{}
		if err := sc.Init(&kp, pubBytes); err != nil {
			return nil, errors.Wrap(err, "failed to init sigchain")
		}
		scBytes, err := proto.Marshal(&sc)
		if err != nil {
			return nil, errors.Wrap(err, "failed to marshal sigchain")
		}
		contact := &entity.Contact{
			ID:          base64.StdEncoding.EncodeToString(pubBytes),
			DisplayName: username,
			Status:      entity.Contact_Status(rand.Intn(5) + 1),
			Sigchain:    scBytes,
			Devices: []*entity.Device{
				{
					ID:         base64.StdEncoding.EncodeToString(pubBytes),
					Name:       devicename,
					Status:     entity.Device_Status(rand.Intn(3) + 1),
					ApiVersion: p2p.Version,
				},
			},
		}
		if err := n.sql.Set("gorm:association_autoupdate", true).Save(&contact).Error; err != nil {
			return nil, errors.Wrap(err, "failed to save contacts")
		}
		contacts = append(contacts, contact)
	}

	for i := 0; i < 10; i++ {
		contactsMembers := []*entity.Contact{}
		for j := 0; j < rand.Intn(2)+1; j++ {
			contactsMembers = append(contactsMembers, &entity.Contact{
				ID: contacts[rand.Intn(len(contacts))].ID,
			})
		}
		if _, err := n.ConversationCreate(context.Background(), &node.ConversationCreateInput{
			Contacts: contactsMembers,
			Title:    strings.Title(fmt.Sprintf("%s %s", gofakeit.HipsterWord(), gofakeit.HackerNoun())),
			Topic:    gofakeit.HackerPhrase(),
		}); err != nil {
			return nil, errors.Wrap(err, "failed to create conversation")
		}
	}

	return &node.Void{}, nil
}

func (n *Node) NodeInfos() (map[string]string, error) {
	infos := map[string]string{}

	infos["runtime: versions"] = fmt.Sprintf("core=%s (p2p=%d, node=%d)", core.Version, p2p.Version, node.Version)

	infos["time: node uptime"] = fmt.Sprintf("%s", time.Since(n.createdAt))
	infos["time: node db creation"] = fmt.Sprintf("%s", time.Since(n.config.CreatedAt))

	sqlStats := []string{}
	for _, table := range sql.AllTables() {
		var count uint32
		if err := n.sql.Table(table).Count(&count).Error; err != nil {
			sqlStats = append(sqlStats, fmt.Sprintf("%s: %v", table, err))
		} else {
			sqlStats = append(sqlStats, fmt.Sprintf("%s: %d", table, count))
		}
	}
	infos["sql: entries"] = strings.Join(sqlStats, "\n")

	infos["queues: client events"] = fmt.Sprintf("%d", len(n.clientEvents))
	infos["queues: clients"] = fmt.Sprintf("%d", len(n.clientEventsSubscribers))
	infos["queues: outgoing events"] = fmt.Sprintf("%d", len(n.outgoingEvents))

	infos["node: pubkey"] = n.b64pubkey
	infos["node: sigchain"] = n.sigchain.ToJSON()

	return infos, nil
}

func (n *Node) DeviceInfos(_ context.Context, input *node.Void) (*deviceinfo.DeviceInfos, error) {
	entries, err := n.NodeInfos()
	if err != nil {
		return nil, err
	}

	// append runtime
	for key, value := range deviceinfo.Runtime() {
		entries[key] = value
	}

	return deviceinfo.FromMap(entries), nil
}

func (n *Node) RunIntegrationTests(ctx context.Context, input *node.IntegrationTestInput) (*node.IntegrationTestOutput, error) {
	tests := listIntegrationTests()

	output := &node.IntegrationTestOutput{
		StartedAt: time.Now().UTC(),
		Name:      input.Name,
	}

	testFunc, ok := tests[input.Name]

	if ok == false {
		output.Success = false
		output.Verbose = "Test not found"
	} else {
		output.Success, output.Verbose = testrunner.TestRunner(input.Name, testFunc)
	}

	output.FinishedAt = time.Now().UTC()

	return output, nil
}

func (n *Node) AppVersion(_ context.Context, input *node.Void) (*node.AppVersionOutput, error) {
	return &node.AppVersionOutput{Version: core.Version}, nil
}

func (n *Node) Panic(_ context.Context, input *node.Void) (*node.Void, error) {
	panic("panic from client")
}

func (n *Node) DebugRequeueEvent(_ context.Context, input *node.DebugEventRequeueInput) (*p2p.Event, error) {
	event := p2p.Event{}

	if err := n.sql.First(&event, "ID = ?", input.EventID).Error; err != nil {
		return nil, errors.Wrap(err, "unable to fetch event")
	}

	if err := n.EventRequeue(&event); err != nil {
		return nil, errors.Wrap(err, "unable to requeue event")
	}

	return &event, nil
}

func (n *Node) DebugRequeueAll(_ context.Context, _ *node.Void) (*node.Void, error) {
	if _, err := n.EventsRetry(time.Now()); err != nil {
		return nil, errors.Wrap(err, "unable to requeue events")
	}

	return &node.Void{}, nil
}

func (n *Node) LogStream(input *node.LogStreamInput, stream node.Service_LogStreamServer) error {
	if n.ring == nil {
		return fmt.Errorf("ring not configured")
	}

	// FIXME: support Continue
	// FIXME: support LogLevel
	// FIXME: support Namespaces
	// FIXME: support Last

	r, w := io.Pipe()

	go func() {
		n.ring.WriteTo(w)
		w.Close()
	}()

	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		err := stream.Send(&node.LogEntry{
			Line: scanner.Text(),
		})
		if err != nil {
			return err
		}
	}
	return nil
}
