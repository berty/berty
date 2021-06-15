package testing

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"infratesting/config"
	iacec2 "infratesting/iac/components/ec2"
)

var (
	sess    *session.Session
	ec2sess *ec2.EC2
)

func init() {
	var err error
	sess, err = session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region: aws.String("eu-central-1"),
		},
	})
	if err != nil {
		panic(err)
	}

	ec2sess = ec2.New(sess)
}

// DescribeInstances returns all ec2 instances
func DescribeInstances() (instances []*ec2.Instance, err error) {
	//get all running/pending instances
	diResp, err := ec2sess.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{
				Name: aws.String("instance-state-name"),
				Values: []*string{
					aws.String("running"),
					aws.String("pending"),
					aws.String("shutting-down"),
					aws.String("stopped"),
					aws.String("terminated"),
				},
			},
		},
	})

	if err != nil {
		return instances, err
	}


	// check if instance has "berty - infra" key-value tag
	for _, reservation := range diResp.Reservations {
		for _, instance := range reservation.Instances {
			for _, tag := range  instance.Tags {
				if *tag.Key == iacec2.Ec2TagBerty && *tag.Value == iacec2.Ec2TagBertyValue {
					instances = append(instances, instance)
				}
			}
		}
	}



	return instances, err
}

// GetAllEligiblePeers returns all peers who are potentially eligible to connect to via gRPC
func GetAllEligiblePeers() (peers []Peer, err error) {
	instances, err := DescribeInstances()
	if err != nil {
		return peers, err
	}

	for _, instance := range instances {
		if *instance.State.Name != "running" {
			continue
		}

		for _, tag := range instance.Tags {

			// if instance is peer
			if *tag.Key == iacec2.Ec2TagType && *tag.Value == config.NodeTypePeer {
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
