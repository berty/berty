package testing

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"infratesting/configParse"
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

func DescribeInstances() (instances []*ec2.Instance, err error) {
	//get all running/pending instances
	resp, err := ec2sess.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{
				Name: aws.String("instance-state-name"),
				Values: []*string{
					aws.String("running"),
					aws.String("pending"),
				},
			},
		},
	})

	if err != nil {
		return instances, err
	}

	for _, reservation := range resp.Reservations {
		instances = append(instances, reservation.Instances...)
	}

	return instances, err
}

func GetAllEligiblePeers() (peers []Peer, err error) {
	instances, err := DescribeInstances()
	if err != nil {
		return peers, err
	}

	for _, instance := range instances {
		for _, tag := range instance.Tags {
			// if instance is peer
			if *tag.Key == "Type" && *tag.Value == configParse.NodeTypePeer {
				p, err := NewPeer(*instance.PublicIpAddress)
				if err != nil {

				}
				peers = append(peers, p)
			}
		}
	}

	return peers, nil
}
