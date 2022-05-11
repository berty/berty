package aws

// all AWS SDK related things / things that interface directly with AWS should reside here

import (
	"errors"
	"fmt"
	"infratesting/logging"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/sts"
	"github.com/google/uuid"
)

var (
	region         string
	sess           *session.Session
	callerIdentity *sts.GetCallerIdentityOutput
)

func SetRegion(r string) {
	region = r
}

func GetSess() *session.Session {
	sess = session.Must(session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region: aws.String(region),
		},
		SharedConfigState: session.SharedConfigEnable,
	}))

	return sess
}

func GetEc2Session() ec2.EC2 {
	if sess == nil {
		sess = GetSess()
	}

	return *ec2.New(sess)
}

func GetStsSession() sts.STS {
	if sess == nil {
		sess = GetSess()
	}

	return *sts.New(sess)
}

func GetS3Session() s3.S3 {
	if sess == nil {
		sess = GetSess()
	}

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
		return instances, logging.LogErr(err)
	}

	// check if instance has "berty - infra" key-value tag
	for _, reservation := range diResp.Reservations {
		for _, instance := range reservation.Instances {
			for _, tag := range instance.Tags {
				if *tag.Key == Ec2TagBerty && *tag.Value == Ec2TagBertyValue {
					instances = append(instances, instance)
				}
			}
		}
	}

	return instances, logging.LogErr(err)
}

// DescribeAMIs gets all valid berty AMI id's from amazon.
func DescribeAMIs(name string) (r *ec2.DescribeImagesOutput, err error) {
	ec2sess := GetEc2Session()

	if callerIdentity == nil {
		callerIdentity, err = GetCallerIdentity()
		if err != nil {
			return nil, logging.LogErr(err)
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

	return resp, logging.LogErr(err)
}

func GetLatestAMI(name string) (AmiID string, err error) {
	amis, err := DescribeAMIs(name)
	if err != nil {
		return AmiID, err
	}

	if len(amis.Images) == 0 {
		return AmiID, logging.LogErr(errors.New("no AMIs found, please us packer to create one"))
	}

	var latestAMI string
	var latestTime int64

	for _, ami := range amis.Images {
		t, err := creationDateToUnix(*ami.CreationDate)
		if err != nil {
			return AmiID, logging.LogErr(err)
		}

		if latestTime == 0 || t < latestTime {
			latestTime = t
			latestAMI = *ami.ImageId
		}
	}

	return latestAMI, logging.LogErr(err)
}

func creationDateToUnix(date string) (unix int64, err error) {
	t, err := time.Parse(time.RFC3339, date)
	if err != nil {
		return unix, err
	}

	unix = t.Unix()

	return unix, logging.LogErr(err)
}

// GetCallerIdentity gets the caller identity from AWS
// used to get AWS AMI's
func GetCallerIdentity() (*sts.GetCallerIdentityOutput, error) {
	if callerIdentity == nil {
		logging.Log("getting CalledIdentity & AMI's (AWS)")

		stssess := GetStsSession()

		r, err := stssess.GetCallerIdentity(&sts.GetCallerIdentityInput{})
		if err != nil {
			return nil, logging.LogErr(err)
		}
		callerIdentity = r

		return r, logging.LogErr(err)
	}

	return callerIdentity, nil
}

// GetUserId is a wrapper around GetCallerIdentity and only returns the UserId
func GetUserId() (id string, err error) {
	if callerIdentity == nil {
		callerIdentity, err = GetCallerIdentity()
		if err != nil {
			return "", logging.LogErr(err)
		}
	}

	return *callerIdentity.UserId, logging.LogErr(err)
}

// UploadFile uploads file/log to AWS bucket
// with path `path` and key `key`
func UploadFile(path, key string) error {
	f, err := os.Open(path)
	if err != nil {
		return logging.LogErr(err)
	}

	s3session := GetS3Session()

	bucketName, err := GetBucketName()
	if err != nil {
		return logging.LogErr(err)
	}

	_, err = s3session.PutObject(&s3.PutObjectInput{
		Body:   f,
		Bucket: &bucketName,
		Key:    &key,
	})
	return logging.LogErr(err)
}

// CreateBucket creates an s3 bucket
func CreateBucket() error {
	s3session := GetS3Session()

	name := fmt.Sprintf("%s-%s-%s", BucketNamePrefix, uuid.NewString()[:8], region)

	logging.Log(fmt.Sprintf("creating s3 bucket for logging: %s", name))
	_, err := s3session.CreateBucket(&s3.CreateBucketInput{
		Bucket: aws.String(name),
	})
	if err != nil {
		return logging.LogErr(err)
	}

	logging.Log("waiting for s3 bucket to be created")

	var created bool
	for i := 0; i <= 3; i += 1 {
		err = s3session.WaitUntilBucketExists(&s3.HeadBucketInput{
			Bucket: aws.String(name),
		})

		if err == nil {
			created = true
			break
		}
	}
	if created == false {
		logging.Log("tried waiting for s3 bucket to be created 3 times. still failed")
		return logging.LogErr(err)
	}

	logging.Log("tagging newly created bucket")

	_, err = s3session.PutBucketTagging(&s3.PutBucketTaggingInput{
		Bucket: aws.String(name),
		Tagging: &s3.Tagging{
			TagSet: []*s3.Tag{
				{
					Key:   aws.String(BucketTagKey),
					Value: aws.String(BucketTagValue),
				},
			},
		},
	})
	if err != nil {
		return logging.LogErr(err)
	}

	logging.Log("bucket successfully created")

	return nil
}

// BucketExists checks if the bucket with tag.Key 'Berty' exists on the current account
// returns false if not found, true if found
func BucketExists() (bool, error) {
	_, err := GetBucketName()
	if err != nil {
		if err.Error() == ErrBucketNotFound {
			return false, nil
		}

		return false, err
	}

	return true, nil

}

// GetBucketName returns the name of the bucket with the tag.Key 'Berty'
// returns error if it doesn't exist
func GetBucketName() (string, error) {
	s3session := GetS3Session()

	resp, err := s3session.ListBuckets(&s3.ListBucketsInput{})
	if err != nil {
		return "", logging.LogErr(err)
	}

	for _, bucket := range resp.Buckets {

		locationResp, err := s3session.GetBucketLocation(&s3.GetBucketLocationInput{
			Bucket: bucket.Name,
		})
		if err != nil {
			continue
		}

		if *locationResp.LocationConstraint == *sess.Config.Region {
			tagResp, err := s3session.GetBucketTagging(&s3.GetBucketTaggingInput{
				Bucket: bucket.Name,
			})

			if err != nil {
				if !strings.Contains(err.Error(), "NoSuchTagSet") {
					return "", logging.LogErr(err)
				}
			}

			if tagResp == nil {
				return "", logging.LogErr(errors.New(ErrTagRespNil))
			}

			for _, tags := range tagResp.TagSet {
				if *tags.Key == BucketTagKey {
					return *bucket.Name, nil
				}
			}
		}
	}

	// bucket doesn't exist, create it!
	err = CreateBucket()
	if err != nil {
		return "", logging.LogErr(err)
	} else {
		return GetBucketName()
	}

}

func IsValidRegion(region string) bool {
	for _, r := range Regions {
		if region == r {
			return true
		}
	}

	return false
}

func IsValidKeyPair(keyName string) (bool, error) {
	ec2sess := GetEc2Session()

	result, err := ec2sess.DescribeKeyPairs(&ec2.DescribeKeyPairsInput{
		KeyNames: []*string{
			aws.String(keyName),
		},
	})
	if err != nil {
		if strings.Contains(err.Error(), "InvalidKeyPair.NotFound") {
			return false, nil
		}
		return false, logging.LogErr(err)
	}

	for _, key := range result.KeyPairs {
		if *key.KeyName == keyName {
			return true, nil
		}
	}

	return false, nil
}
