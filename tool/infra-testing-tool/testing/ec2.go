package testing

import (
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
)

func GetEc2Information() (s []string) {
	sess, err := session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region: aws.String("eu-central-1"),
		},
	})
	if err != nil {
		panic(err)
	}

	ec2sess := ec2.New(sess)


	input := &ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{
				Name: aws.String("instance-state-name"),
				Values: []*string{
					aws.String("running"),
					aws.String("pending"),
				},
			},
		},
	}

	resp, err := ec2sess.DescribeInstances(input)
	if err != nil {
		panic(err)
	}

	for _, reservation := range resp.Reservations {
		for _, instance := range reservation.Instances {

			var name string
			var nodeType string

			for _, tag := range instance.Tags {
				if *tag.Key == "Name" {
					name = *tag.Value
				}

				if *tag.Key == "Type" {
					nodeType = *tag.Value
				}
			}

			s = append(s, fmt.Sprintf("%s, %s, %s, %s\n", name, nodeType, *instance.InstanceId, *instance.PublicIpAddress))
		}
	}

	return s
}
