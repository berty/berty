package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go/service/ec2"
	"google.golang.org/grpc"
	"infratesting/aws"
	"infratesting/config"
	iacec2 "infratesting/iac/components/ec2"
	"log"
	"strings"
	"sync"
	"time"
)

type Peer struct {
	Name string

	Tags map[string]string

	Lock sync.Mutex

	Cc        *grpc.ClientConn
	Messenger messengertypes.MessengerServiceClient
	Protocol  protocoltypes.ProtocolServiceClient

	Ip            string
	Groups        map[string]*protocoltypes.Group
	ConfigGroups  []config.Group
	DevicePK      []byte
	Messages      map[string][]MessageHistory
	lastMessageID map[string][]byte
}

const (
	defaultGrpcPort = "9091"
)

// NewPeer returns a peer with default variables already instantiated
func NewPeer(ip string, tags []*ec2.Tag) (p Peer, err error) {
	p.Ip = ip

	p.Groups = make(map[string]*protocoltypes.Group)
	p.Tags = make(map[string]string)
	p.Messages = make(map[string][]MessageHistory)
	p.lastMessageID = make(map[string][]byte)

	for _, tag := range tags {
		p.Tags[strings.ToLower(*tag.Key)] = *tag.Value
	}

	var cc *grpc.ClientConn
	ctx := context.Background()


	// connection retry logic

	var retries int

	var resp *protocoltypes.InstanceGetConfiguration_Reply
	for {

		if retries >= 6 {
			// failed more than 3 times, this is bad
			log.Printf("could not make connection with %s over grpc\n", p.GetHost())
			return p, err
		} else {
			cc, err = grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
			if err != nil {
				return p, err
			}

			p.Cc = cc
			p.getProtocolServiceClient()
			if p.Tags[iacec2.Ec2TagType] != config.NodeTypeReplication {
				p.getMessengerServiceClient()
			}

			resp, err = p.Protocol.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
			fmt.Println(err)
			fmt.Println(resp)
			if err != nil {
				fmt.Println("failed")
				retries += 1
				fmt.Println(retries)
				time.Sleep(time.Second * time.Duration(retries))
			} else {
				break
			}
		}
	}

	if resp != nil {
		p.DevicePK = resp.DevicePK
	} else {
		panic("something went wrong, DevicePK is unknown")
	}

	return p, err
}

func (p *Peer) getMessengerServiceClient() {
	p.Messenger = messengertypes.NewMessengerServiceClient(p.Cc)
}

func (p *Peer) getProtocolServiceClient() {
	p.Protocol = protocoltypes.NewProtocolServiceClient(p.Cc)
}

func (p *Peer) GetHost() string {
	return fmt.Sprintf("%s:%s", p.Ip, defaultGrpcPort)
}

// MatchNodeToPeer matches nodes to peers (to get the group info)
// loop over peers
// loop over individual peers in config.Peer
// if tags are identical, consider match the daemon
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

// GetAllEligiblePeers returns all peers who are potentially eligible to connect to via gRPC
func GetAllEligiblePeers(tagKey string, tagValues []string) (peers []Peer, err error) {
	instances, err := aws.DescribeInstances()
	if err != nil {
		return peers, err
	}

	for _, instance := range instances {
		if *instance.State.Name != "running" {
			continue
		}

		for _, tag := range instance.Tags {

			// if instance is peer
			if *tag.Key == tagKey {
				for _, value := range tagValues {
					if *tag.Value == value {
						p, err := NewPeer(*instance.PublicIpAddress, instance.Tags)
						if err != nil {
							return nil, err
						}
						p.Name = *instance.InstanceId

						peers = append(peers, p)
					}
				}
			}
		}
	}

	return peers, nil
}

