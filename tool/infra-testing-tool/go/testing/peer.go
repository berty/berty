package testing

import (
	"context"
	"fmt"
	"infratesting/aws"
	"infratesting/config"
	"infratesting/iac/components/networking"
	"infratesting/server/grpc/server"
	"strconv"
	"sync"
	"time"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"github.com/aws/aws-sdk-go/service/ec2"
	"go.uber.org/zap"
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
func NewPeer(ctx context.Context, logger *zap.Logger, ip string, tags []*ec2.Tag) (p *Peer, err error) {
	p = &Peer{}

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

	cc, err := grpc.DialContext(ctx, p.GetHost(),
		grpc.WithInsecure(), grpc.WithBackoffConfig(grpc.BackoffConfig{
			MaxDelay: time.Second * 5,
		}))
	if err != nil {
		return nil, fmt.Errorf("unable to dial host: %w", err)
	}

	if deploy {
		if isPeer {
			// connecting to peer
			// but in deployment
			// meaning there will be no further testing
			// and there are looping connects if it fails
			for count := 1; ; count++ {
				switch {
				case count >= 60:
					return nil, fmt.Errorf("unable to test connection with peer")
				case count > 1:
					logger.Info("retry to connect", zap.Int("attempt", count))
					time.Sleep(time.Second)
				default:
				}

				temp := server.NewProxyClient(cc)

				resp, err := temp.IsProcessRunning(ctx, &server.IsProcessRunning_Request{})
				if err != nil || !resp.Running {
					logger.Warn("is process running", zap.Error(err))
					continue
				}

				_, err = temp.TestConnection(ctx, &server.TestConnection_Request{})
				if err != nil {
					logger.Warn("Test Connection failed", zap.Error(err))
					continue
				}

				_, err = temp.TestConnectionToPeer(ctx, &server.TestConnectionToPeer_Request{
					Tries: 1,
					Host:  "localhost",
					Port:  strconv.Itoa(networking.BertyGRPCPort),
				})
				if err != nil {
					logger.Warn("test connection to peer error", zap.Error(err))
					continue
				}

				// leave the loop
				break
			}
		} else {
			for count := 0; ; count++ {
				if count > 60 {
					return nil, fmt.Errorf("unable to connect test connection, timeout")
				}

				// node is not a peer
				// just connect to it, but don't connect to underlying peer
				p.P = server.NewProxyClient(cc)
				_, err = p.P.TestConnection(ctx, &server.TestConnection_Request{})
				if err != nil {
					logger.Error("unable to test connection", zap.Error(err))
					continue
				}

				break
			}
		}
	} else {
		if isPeer {
			// connecting to peer
			p.P = server.NewProxyClient(cc)
			_, err = p.P.TestConnection(ctx, &server.TestConnection_Request{})
			if err != nil {
				return nil, fmt.Errorf("unable to test connection: %w", err)
			}

			_, err = p.P.ConnectToPeer(ctx, &server.ConnectToPeer_Request{
				Host: "localhost",
				Port: "9091",
			})
			if err != nil {
				return nil, fmt.Errorf("unable to test connection: %w", err)
			}

		} else {
			// connecting to non peer

			// var cc *grpc.ClientConn
			// ctx := context.Background()

			// cc, err = grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
			p.P = server.NewProxyClient(cc)
			_, err = p.P.TestConnection(ctx, &server.TestConnection_Request{})
			if err != nil {
				return nil, fmt.Errorf("unable to test connection: %w", err)
			}
		}
	}

	logger.Info("successfully connected to host", zap.String("host", p.GetHost()))

	return p, nil
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
func GetAllEligiblePeers(ctx context.Context, logger *zap.Logger, tagKey string, tagValues []string) (peers []*Peer, err error) {
	instances, err := aws.DescribeInstances()
	if err != nil {
		return nil, fmt.Errorf("unable to describe instances: %w", err)
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

						p, err := NewPeer(ctx, logger, ip, instance.Tags)
						if err != nil {
							return nil, fmt.Errorf("unable create new peer: %w", err)
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

func GetAllPeers(ctx context.Context, logger *zap.Logger) (peers []*Peer, err error) {
	peers = []*Peer{}
	instances, err := aws.DescribeInstances()
	if err != nil {
		return nil, fmt.Errorf("unable to describe instances: %w", err)
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
			return nil, fmt.Errorf("unable to get all peers")
		}

		p, err := NewPeer(ctx, logger, ip, instance.Tags)
		if err != nil {
			return nil, fmt.Errorf("create new peer: %w", err)
		}

		p.Name = *instance.InstanceId
		peers = append(peers, p)
	}

	return peers, nil
}
