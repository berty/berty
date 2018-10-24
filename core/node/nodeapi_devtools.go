package node

import (
	"context"
	crand "crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"math/rand"
	"os"
	"runtime"
	"strings"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/crypto/sigchain"
	"berty.tech/core/entity"
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
		if err := sc.Init(&kp, string(pubBytes)); err != nil {
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

func (n *Node) DeviceInfos(_ context.Context, input *node.Void) (*node.DeviceInfosOutput, error) {
	output := &node.DeviceInfosOutput{}

	// system, platform, os, etc
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "uptime", Value: fmt.Sprintf("%s", time.Since(n.createdAt))})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "OS", Value: runtime.GOOS})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "Arch", Value: runtime.GOARCH})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "CPUs", Value: fmt.Sprintf("%d", runtime.NumCPU())})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "Go version", Value: runtime.Version()})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "Go compiler", Value: runtime.Compiler})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "Go 'cgo' calls", Value: fmt.Sprintf("%d", runtime.NumCgoCall())})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "Go routines", Value: fmt.Sprintf("%d", runtime.NumGoroutine())})
	if hn, err := os.Hostname(); err != nil {
		output.Infos = append(output.Infos, &node.DeviceInfo{Key: "Hostname", Value: hn})
	}
	if exe, err := os.Executable(); err != nil {
		output.Infos = append(output.Infos, &node.DeviceInfo{Key: "Executable", Value: exe})
	}
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "pid", Value: fmt.Sprintf("%d", os.Getpid())})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "uid", Value: fmt.Sprintf("%d", os.Geteuid())})
	if wd, err := os.Getwd(); err != nil {
		output.Infos = append(output.Infos, &node.DeviceInfo{Key: "pwd", Value: wd})
	}

	// queues
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "queues: client events", Value: fmt.Sprintf("%d", len(n.clientEvents))})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "queues: clients", Value: fmt.Sprintf("%d", len(n.clientEventsSubscribers))})
	output.Infos = append(output.Infos, &node.DeviceInfo{Key: "queues: outgoing events", Value: fmt.Sprintf("%d", len(n.outgoingEvents))})

	// env
	for _, env := range os.Environ() {
		output.Infos = append(output.Infos, &node.DeviceInfo{Key: "env", Value: env})
	}

	return output, nil
}

func (n *Node) RunIntegrationTests(ctx context.Context, input *node.IntegrationTestInput) (*node.IntegrationTestOutput, error) {
	tests := listIntegrationTests()

	output := &node.IntegrationTestOutput{
		StartedAt: time.Now(),
		Name:      input.Name,
	}

	testFunc, ok := tests[input.Name]

	if ok == false {
		output.Success = false
		output.Verbose = "Test not found"
	} else {
		output.Success, output.Verbose = testrunner.TestRunner(input.Name, testFunc)
	}

	output.FinishedAt = time.Now()

	return output, nil
}
