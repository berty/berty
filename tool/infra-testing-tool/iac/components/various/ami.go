package various

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/aws/aws-sdk-go/service/sts"
	"infratesting/iac"
	"log"
)

var (
	sess    *session.Session
	ec2sess *ec2.EC2
	stssess *sts.STS
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
	stssess = sts.New(sess)

}

type Ami struct {
	AmiID string
}

func NewAmi() Ami {
	return Ami{}
}

func (c Ami) GetTemplate() string {
	return AmiTemplate
}

// GetId should never be called but is required to make it an HCLComponent
func (c Ami) GetId() string {
	return ""
}

func (c Ami) GetType() string {
	return AmiType
}

func (c Ami) Validate() (iac.Component, error) {
	log.Println("getting CalledIdentity & AMI's")
	r, err := stssess.GetCallerIdentity(&sts.GetCallerIdentityInput{})
	if err != nil {
		return c, err
	}

	resp, err := ec2sess.DescribeImages(&ec2.DescribeImagesInput{
		Filters: []*ec2.Filter{
			{
				Name: aws.String("name"),
				Values: []*string{
					aws.String(AmiDefaultName),
				},
			},
		},
		Owners: []*string{r.Account},
	})

	if err != nil {
		return c, err
	}

	c.AmiID = *resp.Images[0].ImageId
	return c, nil
}
