package aws

// all AWS SDK related things / things that interface directly with AWS should reside here

import (
	"errors"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/sts"
	iacec2 "infratesting/iac/components/ec2"
	"log"
	"os"
	"time"
)

var (
	sess    *session.Session

	callerIdentity *sts.GetCallerIdentityOutput
)

// init creates aws parent session from which we make other sessions
func init() {
	sess = session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	// check if s3 bucket is present for logs
	exists, err := BucketExists(iacec2.Ec2LogBucket)
	if err != nil {
		log.Println("WARNING! EC2 logging bucket DOES NOT exist or something went wrong! Error:")
		log.Println(err)
	}

	if !exists {
		// bucket doesn't exist, create it!
		err = CreateBucket(iacec2.Ec2LogBucket)
		if err != nil {
			log.Println(err)
		}
	}

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

// DescribeAMIs gets all valid berty AMI id's from amazon.
func DescribeAMIs(name string) (r *ec2.DescribeImagesOutput, err error) {
	ec2sess := GetEc2Session()

	if callerIdentity == nil {
		callerIdentity, err = GetCallerIdentity()
		if err != nil {
			return nil, err
		}
	}

	// describes all AMI's
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

func GetLatestAMI(name string) (AmiID string, err error) {
	amis, err := DescribeAMIs(name)
	if err != nil {
		return AmiID, err
	}

	if len(amis.Images) == 0 {
		return AmiID, errors.New("no AMIs found, please us packer to create one")
	}

	var latestAMI string
	var latestTime int64

	for _, ami := range amis.Images {
		t, err := creationDateToUnix(*ami.CreationDate)
		if err != nil {
			return AmiID, err
		}

		if latestTime == 0 || t < latestTime {
			latestTime = t
			latestAMI = *ami.ImageId
		}
	}

	return latestAMI, err
}

func creationDateToUnix(date string) (unix int64, err error) {
	t, err := time.Parse(time.RFC3339, date)
	if err != nil {
		return unix, err
	}

	unix = t.Unix()

	return unix, err
}


// GetCallerIdentity gets the caller identity from AWS
// used to get AWS AMI's
func GetCallerIdentity() (*sts.GetCallerIdentityOutput, error){
	if callerIdentity == nil {
		log.Println("getting CalledIdentity & AMI's (AWS)")

		stssess := GetStsSession()

		r, err := stssess.GetCallerIdentity(&sts.GetCallerIdentityInput{})
		if err != nil {
			return nil, err
		}
		callerIdentity = r

		return r, err
	}

	return callerIdentity, nil
}

// GetUserId is a wrapper around GetCallerIdentity and only returns the UserId
func GetUserId() (id string, err error) {
	if callerIdentity == nil {
		callerIdentity, err = GetCallerIdentity()
		if err != nil {
			return "", err
		}
	}

	return *callerIdentity.UserId, err
}

// UploadFile uploads file/log to AWS bucket
// with path `path` and key `key`
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

// CreateBucket creates an s3 bucket
func CreateBucket(name string) error {
	s3session := GetS3Session()

	log.Println("creating s3 bucket for logging")
	_, err := s3session.CreateBucket(&s3.CreateBucketInput{
		Bucket: aws.String(name),
	})

	log.Println("waiting for s3 bucket to be created")

	var created bool
	for i := 0; i <= 3; i += 1 {
		err = s3session.WaitUntilBucketExists(&s3.HeadBucketInput{
			Bucket:              aws.String(name),
		})

		if err == nil {
			created = true
			break
		}
	}
	if created == false {
		log.Println("tried waiting for s3 bucket to be created 3 times. still failed. reason:")
		panic(err)
	}


	return err
}

// BucketExists checks if the bucket with name `name` exists on the current account
// returns false if not found, true if found
func BucketExists(name string) (bool, error) {
	s3session := GetS3Session()

	resp, err := s3session.ListBuckets(&s3.ListBucketsInput{})
	if err != nil {
		return false, err
	}

	for _, bucket := range resp.Buckets {
		if *bucket.Name == name {
			return true, nil
		}
	}

	return false, nil
}

// TODO:
// what happens if the bucket name is already taken?


