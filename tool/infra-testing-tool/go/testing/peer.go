package testing

import (
	"context"
	"fmt"
	"infratesting/aws"
	"infratesting/config"
	"infratesting/iac/components/networking"
	"infratesting/logging"
	"infratesting/server/grpc/server"
	"strconv"
	"sync"
	"time"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"github.com/aws/aws-sdk-go/service/ec2"
	"google.golang.org/grpc"
)

type Peer struct {
	Name string

	Tags map[string]string

	Lock sync.Mutex

	Cc *grpc.ClientConn
	P  server.ProxyClient

	Ip           string
	Groups       map[string]*protocoltypes.Group
	ConfigGroups []config.Group
	Reliability  config.Reliability
}

var deploy bool

// SetDeploy sets the global variable deploy to true
func SetDeploy() {
	deploy = true
}

// NewPeer returns a peer with default variables already instantiated
func NewPeer(ip string, tags []*ec2.Tag) (p Peer, err error) {
	p.Ip = ip

	p.Groups = make(map[string]*protocoltypes.Group)
	p.Tags = make(map[string]string)

	var isPeer bool

	for _, tag := range tags {
		p.Tags[*tag.Key] = *tag.Value

		if *tag.Key == aws.Ec2TagType && *tag.Value == config.NodeTypePeer {
			isPeer = true
		}

	}

	if deploy {
		if isPeer {
			// connecting to peer
			// but in deployment
			// meaning there will be no further testing
			// and there are looping connects if it fails
			var count int
			for {
				var cc *grpc.ClientConn
				var err error
				ctx := context.Background()
				cc, _ = grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())

				temp := server.NewProxyClient(cc)

				resp, err := temp.IsProcessRunning(ctx, &server.IsProcessRunning_Request{})
				if err != nil || !resp.Running {
					count += 1
					time.Sleep(time.Second * 5)
				}

				_, err = temp.TestConnection(ctx, &server.TestConnection_Request{})
				if err != nil {
					count += 1
					time.Sleep(time.Second * 5)
				} else {
					_, err = temp.TestConnectionToPeer(ctx, &server.TestConnectionToPeer_Request{
						Tries: 1,
						Host:  "localhost",
						Port:  strconv.Itoa(networking.BertyGRPCPort),
					})
					if err != nil {
						count += 1
						time.Sleep(time.Second * 5)
					} else {
						break
					}
				}

				logging.Log("waiting ...")
				if count > 60 {
					logging.Log("timeout")
					return p, logging.LogErr(err)
				}

			}
		} else {
			var count int
			for {
				// node is not a peer
				// just connect to it, but don't connect to underlying peer
				var cc *grpc.ClientConn
				ctx := context.Background()

				cc, _ = grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
				p.P = server.NewProxyClient(cc)

				_, err = p.P.TestConnection(ctx, &server.TestConnection_Request{})

				if err != nil {
					if count > 60 {
						return p, logging.LogErr(err)
					} else {
						count += 1
						time.Sleep(time.Second * 5)
					}
				} else {
					break
				}
			}
		}
	} else {
		if isPeer {
			// connecting to peer

			var cc *grpc.ClientConn
			ctx := context.Background()

			cc, _ = grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
			p.P = server.NewProxyClient(cc)

			_, err = p.P.TestConnection(ctx, &server.TestConnection_Request{})
			if err != nil {
				return p, logging.LogErr(err)
			}

			_, err = p.P.ConnectToPeer(ctx, &server.ConnectToPeer_Request{
				Host: "localhost",
				Port: "9091",
			})
			if err != nil {
				return p, logging.LogErr(err)
			}

		} else {
			// connecting to non peer

			var cc *grpc.ClientConn
			ctx := context.Background()

			cc, _ = grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
			p.P = server.NewProxyClient(cc)

			_, err = p.P.TestConnection(ctx, &server.TestConnection_Request{})
			if err != nil {
				return p, logging.LogErr(err)
			}

		}
	}

	return p, err
}

func (p *Peer) GetHost() string {
	return fmt.Sprintf("%s:%d", p.Ip, networking.ServerGRPCPort)
}

// MatchNodeToPeer matches nodes to peers (to get the group info)
// loop over peers
// loop over individual peers in config.Peer
// if tags are identical, consider match the server
func (p *Peer) MatchNodeToPeer(c config.Config) {
	for _, cPeerNg := range c.Peer {
		// config.NodeGroup.Nodes
		for _, cIndividualPeer := range cPeerNg.Nodes {
			if p.Tags[aws.Ec2TagName] == cIndividualPeer.Name {
				p.ConfigGroups = cPeerNg.Groups
				p.Reliability = cIndividualPeer.NodeAttributes.Reliability
			}
		}
	}
}

// GetAllEligiblePeers returns all peers who are potentially eligible to connect to via gRPC
func GetAllEligiblePeers(tagKey string, tagValues []string) (peers []Peer, err error) {
	instances, err := aws.DescribeInstances()
	if err != nil {
		return peers, logging.LogErr(err)
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

						var ip string
						for _, ni := range instance.NetworkInterfaces {
							if ni.Association != nil {
								if *ni.Association.PublicIp != "" {
									ip = *ni.Association.PublicIp
									break
								}
							}
						}

						if ip == "" {
							panic("peer not publicly accessible")
						}

						p, err := NewPeer(ip, instance.Tags)
						if err != nil {
							return nil, logging.LogErr(err)
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

func GetAllPeers() (peers []Peer, err error) {
	instances, err := aws.DescribeInstances()
	if err != nil {
		return peers, logging.LogErr(err)
	}

	for _, instance := range instances {
		if *instance.State.Name != "running" {
			continue
		}

		var ip string
		for _, ni := range instance.NetworkInterfaces {
			if ni.Association != nil {
				if *ni.Association.PublicIp != "" {
					ip = *ni.Association.PublicIp
					break
				}
			}
		}

		if ip == "" {
			panic("peer not publicly accessible")
		}

		p, err := NewPeer(ip, instance.Tags)
		if err != nil {
			return nil, logging.LogErr(err)
		}
		p.Name = *instance.InstanceId

		peers = append(peers, p)

	}

	return peers, err
}
