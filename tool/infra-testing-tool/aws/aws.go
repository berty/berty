package aws

// all AWS SDK related things / things that interface directly with AWS should reside here
import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/sts"
	iacec2 "infratesting/iac/components/ec2"
	"log"
	"os"
)

var (
	sess    *session.Session

	callerIdentity *sts.GetCallerIdentityOutput
)

func init() {
	sess = session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))
}

func GetEc2Session() ec2.EC2 {
	return *ec2.New(sess)
}

func GetStsSession() sts.STS {
	return *sts.New(sess)
}

func GetS3Session() s3.S3 {
	return *s3.New(sess)
}

// DescribeInstances returns all ec2 instances
func DescribeInstances() (instances []*ec2.Instance, err error) {
	ec2sess := GetEc2Session()

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
			for _, tag := range instance.Tags {
				if *tag.Key == iacec2.Ec2TagBerty && *tag.Value == iacec2.Ec2TagBertyValue {
					instances = append(instances, instance)
				}
			}
		}
	}

	return instances, err
}

func GetImages(name string) (r *ec2.DescribeImagesOutput, err error) {
	ec2sess := GetEc2Session()

	callerIdentity, err := GetCallerIdentity()

	if err != nil {
		return nil, err
	}

	// describes all AMI's with AmiDefaultName
	resp, err := ec2sess.DescribeImages(&ec2.DescribeImagesInput{
		Filters: []*ec2.Filter{
			{
				Name: aws.String("name"),
				Values: []*string{
					aws.String(name),
				},
			},
		},
		Owners: []*string{callerIdentity.Account},
	})

	return resp, err
}


func GetCallerIdentity() (*sts.GetCallerIdentityOutput, error){
	if callerIdentity == nil {
		log.Println("getting CalledIdentity & AMI's (AWS)")

		stssess := GetStsSession()


		// gets caller identity to get accountid
		r, err := stssess.GetCallerIdentity(&sts.GetCallerIdentityInput{})
		if err != nil {
			return nil, err
		}
		callerIdentity = r

		return r, err
	}

	return callerIdentity, nil
}

func UploadFile(path, key string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}

	s3session := GetS3Session()

	_, err = s3session.PutObject(&s3.PutObjectInput{
		Body: f,
		Bucket: aws.String(iacec2.Ec2LogBucket),
		Key: &key,
	})
	return err
}
