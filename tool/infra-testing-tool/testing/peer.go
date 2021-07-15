package testing

import (
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go/service/ec2"
	"google.golang.org/grpc"
	"infratesting/aws"
	"infratesting/config"
	"infratesting/daemon/grpc/daemon"
	iacec2 "infratesting/iac/components/ec2"
	"strconv"
	"strings"
	"sync"
)

type Peer struct {
	Name string

	Tags map[string]string

	Lock sync.Mutex

	Cc        *grpc.ClientConn
	P	daemon.ProxyClient

	Ip            string
	Groups        map[string]*protocoltypes.Group
	ConfigGroups  []config.Group
}

const (
	daemonGRPCPort = 7091
	internalDaemonGRPCPort = 9091
)

// NewPeer returns a peer with default variables already instantiated
func NewPeer(ip string, tags []*ec2.Tag) (p Peer, err error) {
	p.Ip = ip

	fmt.Println(ip)

	p.Groups = make(map[string]*protocoltypes.Group)
	p.Tags = make(map[string]string)

	var isReplication bool

	for _, tag := range tags {
		p.Tags[strings.ToLower(*tag.Key)] = *tag.Value

		if *tag.Key == iacec2.Ec2TagType && *tag.Value == config.NodeTypeReplication {
			isReplication = true
		}

	}

	if !isReplication {
		var cc *grpc.ClientConn
		ctx := context.Background()

		cc, err = grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
		p.P = daemon.NewProxyClient(cc)


		_, err = p.P.ConnectToPeer(ctx, &daemon.ConnectToPeer_Request{
			Host: "localhost",
			Port: strconv.Itoa(internalDaemonGRPCPort),
		})
		if err != nil {
			return p, err
		}

	}

	return p, err
}

func (p *Peer) GetHost() string {
	return fmt.Sprintf("%s:%d", p.Ip, daemonGRPCPort)
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
func GetAllEligiblePeers(tagKey, tagValue string) (peers []Peer, err error) {
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
			if *tag.Key == tagKey && *tag.Value == tagValue {
				p, err := NewPeer(*instance.PublicIpAddress, instance.Tags)
				if err != nil {
					return nil, err
				}
				p.Name = *instance.InstanceId

				peers = append(peers, p)
			}
		}
	}

	return peers, nil
}

