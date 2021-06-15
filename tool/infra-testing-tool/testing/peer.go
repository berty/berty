package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go/service/ec2"
	"google.golang.org/grpc"
	"infratesting/config"
	iacec2 "infratesting/iac/components/ec2"
	"strings"
	"sync"
)

type Peer struct {
	Name string

	Tags map[string]string

	Lock sync.Mutex

	Cc *grpc.ClientConn
	Messenger messengertypes.MessengerServiceClient
	Protocol  protocoltypes.ProtocolServiceClient

	Ip       string
	Groups   map[string]*protocoltypes.Group
	ConfigGroups []config.Group
	DevicePK []byte
	Messages []MessageHistory
	lastMessageID []byte
}

const (
	defaultGrpcPort = "9091"
)

// NewPeer returns a peer with default variables already instantiated
func NewPeer(ip string, tags []*ec2.Tag) (p Peer, err error) {
	p.Ip = ip

	p.Groups = make(map[string]*protocoltypes.Group)
	p.Tags = make(map[string]string)

	for _, tag := range tags {
		p.Tags[strings.ToLower(*tag.Key)] = *tag.Value
	}

	ctx := context.Background()
	cc, err := grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
	if err != nil {
		return p, err
	}

	p.Cc = cc

	p.getSvcClients()

	//resp, err := p.Messenger.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	//if err != nil {
	//	return p, err
	//}

	resp, err := p.Protocol.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return p, err
	}

	p.DevicePK = resp.DevicePK

	return p, err
}

func (p *Peer) getSvcClients() {
	p.Messenger = messengertypes.NewMessengerServiceClient(p.Cc)
	p.Protocol = protocoltypes.NewProtocolServiceClient(p.Cc)
}

func (p *Peer) GetHost() string {
	return fmt.Sprintf("%s:%s", p.Ip, defaultGrpcPort)
}

// MatchNodeToPeer matches nodes to peers (to get the group info)
// loop over peers
// loop over individual peers in config.Peer
// if tags are identical, consider match the groups
func (p *Peer) MatchNodeToPeer(c config.Config) {
		for _, cPeerNg := range c.Peer {
			// config.NodeGroup.Nodes
			for _, cIndividualPeer := range cPeerNg.Nodes {
				if p.Tags[iacec2.Ec2TagName] == cIndividualPeer.Name {
					p.ConfigGroups = cPeerNg.Groups
				}
			}
		}

}
