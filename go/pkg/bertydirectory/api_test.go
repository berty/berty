package bertydirectory

import (
	"context"
	"crypto"
	"crypto/ed25519"
	crand "crypto/rand"
	"fmt"
	"io"
	"net"
	"testing"
	"time"

	sqlite "github.com/flyingtime/gorm-sqlcipher"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"
	"google.golang.org/grpc"
	"google.golang.org/grpc/test/bufconn"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/bertyvcissuer"
	"berty.tech/berty/v2/go/pkg/directorytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/verifiablecredstypes"
)

func getVCIssuer(t *testing.T) *bertyvcissuer.VCIssuer {
	t.Helper()

	_, issuerPriv, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	vcIssuer, err := bertyvcissuer.New(&bertyvcissuer.Config{
		ServerRootURL: "http://localhost/",
		IssuerSignKey: issuerPriv,
		Flow: &bertyvcissuer.FlowConfig{
			Type:          verifiablecredstypes.FlowType_FlowTypeCode,
			CodeGenerator: bertyvcissuer.CodeGeneratorZero,
			CodeSenderClient: &bertyvcissuer.PhoneCodeSenderMockService{
				Logger: zap.NewNop(),
			},
		},
	})

	require.NoError(t, err)

	return vcIssuer
}

func getBertyIDWebLink(t *testing.T, accountPK, rdvSeed []byte) string {
	t.Helper()

	id1 := &messengertypes.BertyID{
		DisplayName:          "displayName",
		PublicRendezvousSeed: rdvSeed,
		AccountPK:            accountPK,
	}
	link1 := id1.GetBertyLink()
	_, web1, err := bertylinks.MarshalLink(link1)
	require.NoError(t, err)

	return web1
}

func getTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	db, err := gorm.Open(sqlite.Open(fmt.Sprintf("file:memdb%d?mode=memory&cache=shared", time.Now().UnixNano())), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		t.Fatal(err)
	}

	return db
}

func getVCSignedProof(t *testing.T, vcIssuer *bertyvcissuer.VCIssuer, bertyWebLink, identifier string) []byte {
	t.Helper()

	signedProof, err := vcIssuer.CreateSignedProof(bertyWebLink, identifier)
	require.NoError(t, err)
	require.NotNil(t, signedProof)

	return signedProof
}

func getVCSignedProofDateRange(t *testing.T, vcIssuer *bertyvcissuer.VCIssuer, bertyWebLink, identifier string, notBefore, notAfter time.Time) []byte {
	t.Helper()

	signedProof, err := vcIssuer.CreateSignedProofForPeriod(bertyWebLink, identifier, notBefore, notAfter)

	require.NoError(t, err)
	require.NotNil(t, signedProof)

	return signedProof
}

func getBertyAccountKeyPair(t *testing.T) (ed25519.PublicKey, ed25519.PrivateKey) {
	t.Helper()

	pk, sk, err := ed25519.GenerateKey(crand.Reader)
	require.NoError(t, err)

	return pk, sk
}

func TestDirectoryService_Register(t *testing.T) {
	vcIssuer := getVCIssuer(t)

	rdvSeed1 := []byte("testrdvseed")
	accountPub1, _ := getBertyAccountKeyPair(t)

	rdvSeed2 := []byte("testrdvseed2")
	accountPub2, _ := getBertyAccountKeyPair(t)

	web1 := getBertyIDWebLink(t, accountPub1, rdvSeed1)
	web1NewSeed := getBertyIDWebLink(t, accountPub1, rdvSeed2)
	web2 := getBertyIDWebLink(t, accountPub2, rdvSeed2)

	db := getTestDB(t)

	dirService, err := New(db, nil)
	require.NoError(t, err)

	signedProofNoBertyID := getVCSignedProof(t, vcIssuer, "", "+33123456789")
	signedProof := getVCSignedProof(t, vcIssuer, web1, "+33123456789")
	signedProofExpired := getVCSignedProofDateRange(t, vcIssuer, web1, "+33123456789", time.UnixMilli(0), time.UnixMilli(123))
	signedProof2 := getVCSignedProof(t, vcIssuer, web2, "+33123456789")

	// Registering with a bogus vc
	reply, err := dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProofNoBertyID,
		ProfileURI:         web1,
	})
	require.Error(t, err)
	require.Nil(t, reply)

	// Registering with an expired proof
	reply, err = dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProofExpired,
		ProfileURI:         web1,
	})
	require.Error(t, err)
	require.Nil(t, reply)

	// Valid initial registration
	reply, err = dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof,
		ProfileURI:         web1,
	})
	require.NoError(t, err)
	require.NotNil(t, reply)

	// Renewing registration
	reply, err = dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof,
		ProfileURI:         web1,
	})
	require.NoError(t, err)
	require.NotNil(t, reply)

	// Renewing with another seed
	reply, err = dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof,
		ProfileURI:         web1NewSeed,
	})
	require.Error(t, err)
	require.Nil(t, reply)

	// Renewing with another seed, enforcing it
	reply, err = dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential:      signedProof,
		ProfileURI:              web1NewSeed,
		OverwriteExistingRecord: true,
	})
	require.NoError(t, err)
	require.NotNil(t, reply)

	// Overwrite with another pk, while locked
	reply, err = dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential:      signedProof2,
		ProfileURI:              web2,
		OverwriteExistingRecord: true,
	})
	require.ErrorIs(t, err, errcode.ErrServicesDirectoryRecordLockedAndCantBeReplaced)
	require.Nil(t, reply)

	// Renewing registration, setting a locked until date
	reply, err = dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof,
		ProfileURI:         web1NewSeed,
		LockedUntilDate:    time.Now().Add(time.Millisecond * 10).UnixNano(),
	})
	require.NoError(t, err)
	require.NotNil(t, reply)

	time.Sleep(time.Millisecond * 11)

	// Overwrite with another pk, while unlocked
	reply, err = dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential:      signedProof2,
		ProfileURI:              web2,
		OverwriteExistingRecord: true,
		ExpirationDate:          time.Now().Add(time.Millisecond * 10).UnixNano(),
	})
	require.NoError(t, err)
	require.NotNil(t, reply)

	time.Sleep(time.Millisecond * 11)

	// Overwrite with another pk, while expired
	reply, err = dirService.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof,
		ProfileURI:         web1,
	})
	require.NoError(t, err)
	require.NotNil(t, reply)
}

func TestDirectoryService_Unregister(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	_, c, conn := NewDirectoryServiceGRPC(ctx, t)
	defer conn.Close()

	vcIssuer := getVCIssuer(t)

	rdvSeed1 := []byte("testrdvseed")
	accountPub1, _ := getBertyAccountKeyPair(t)

	rdvSeed2 := []byte("testrdvseed2")
	accountPub2, _ := getBertyAccountKeyPair(t)

	phone1 := "+33123456789"
	phone2 := "+33234567890"

	web1 := getBertyIDWebLink(t, accountPub1, rdvSeed1)
	web2 := getBertyIDWebLink(t, accountPub2, rdvSeed2)

	signedProof := getVCSignedProof(t, vcIssuer, web1, phone1)
	signedProof2 := getVCSignedProof(t, vcIssuer, web2, phone2)

	_, unlockSK1, err := ed25519.GenerateKey(crand.Reader)
	require.NoError(t, err)

	unlockPK2, unlockSK2, err := ed25519.GenerateKey(crand.Reader)
	require.NoError(t, err)

	registered1, err := c.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof,
		ProfileURI:         web1,
	})
	require.NoError(t, err)
	require.NotNil(t, registered1)

	registered2, err := c.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof2,
		ProfileURI:         web2,
		UnlockKey:          unlockPK2,
	})
	require.NoError(t, err)
	require.NotNil(t, registered2)

	// Not supported (no key on registration)
	_, err = c.Unregister(context.TODO(), &directorytypes.Unregister_Request{
		DirectoryIdentifier:  registered1.DirectoryIdentifier,
		DirectoryRecordToken: registered1.DirectoryRecordToken,
		UnlockSig:            nil,
	})
	require.Error(t, err)

	// No sig provided
	_, err = c.Unregister(context.TODO(), &directorytypes.Unregister_Request{
		DirectoryIdentifier:  registered2.DirectoryIdentifier,
		DirectoryRecordToken: registered2.DirectoryRecordToken,
		UnlockSig:            nil,
	})
	require.Error(t, err)

	sig, err := unlockSK1.Sign(crand.Reader, []byte(registered2.DirectoryRecordToken), crypto.Hash(0))
	require.NoError(t, err)

	// Invalid sig provided
	_, err = c.Unregister(context.TODO(), &directorytypes.Unregister_Request{
		DirectoryIdentifier:  registered2.DirectoryIdentifier,
		DirectoryRecordToken: registered2.DirectoryRecordToken,
		UnlockSig:            sig,
	})
	require.Error(t, err)

	sig, err = unlockSK2.Sign(crand.Reader, []byte(registered2.DirectoryRecordToken), crypto.Hash(0))
	require.NoError(t, err)

	// Valid sig provided
	_, err = c.Unregister(context.TODO(), &directorytypes.Unregister_Request{
		DirectoryIdentifier:  registered2.DirectoryIdentifier,
		DirectoryRecordToken: registered2.DirectoryRecordToken,
		UnlockSig:            sig,
	})
	require.NoError(t, err)

	// Already unregistered
	_, err = c.Unregister(context.TODO(), &directorytypes.Unregister_Request{
		DirectoryIdentifier:  registered2.DirectoryIdentifier,
		DirectoryRecordToken: registered2.DirectoryRecordToken,
		UnlockSig:            sig,
	})
	require.Error(t, err)

	// Already expired
	_, err = c.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential:      signedProof2,
		ProfileURI:              web2,
		OverwriteExistingRecord: true,
		ExpirationDate:          time.Now().Add(time.Millisecond * 10).UnixNano(),
	})
	require.NoError(t, err)

	time.Sleep(time.Millisecond * 11)

	_, err = c.Unregister(context.TODO(), &directorytypes.Unregister_Request{
		DirectoryIdentifier:  registered2.DirectoryIdentifier,
		DirectoryRecordToken: registered2.DirectoryRecordToken,
		UnlockSig:            sig,
	})
	require.Error(t, err)
}

type expectedResult struct {
	uri string
	vc  []byte
}

func queryEntriesAndCompare(t *testing.T, client directorytypes.DirectoryServiceClient, query []string, expectedResults map[string]*expectedResult) {
	foundNumbers := map[string]*expectedResult{}

	queryClient, err := client.Query(context.TODO(), &directorytypes.Query_Request{
		DirectoryIdentifiers: query,
	})
	require.NoError(t, err)

	for {
		val, err := queryClient.Recv()
		if err != nil {
			if err == io.EOF {
				break
			}
		}

		foundNumbers[val.DirectoryIdentifier] = &expectedResult{
			uri: val.ProfileURI,
			vc:  val.VerifiedCredential,
		}
	}

	require.Equal(t, len(expectedResults), len(foundNumbers))
	for expectedK, expectedV := range expectedResults {
		foundV, ok := foundNumbers[expectedK]
		require.True(t, ok)
		require.Equal(t, expectedV.vc, foundV.vc)
		require.Equal(t, expectedV.uri, foundV.uri)
	}
}

func NewDirectoryServiceGRPC(ctx context.Context, t *testing.T) (*DirectoryService, directorytypes.DirectoryServiceClient, *grpc.ClientConn) {
	t.Helper()

	const bufSize = 1024 * 1024

	lis := bufconn.Listen(bufSize)
	s := grpc.NewServer()

	db := getTestDB(t)

	dirService, err := New(db, nil)
	require.NoError(t, err)

	directorytypes.RegisterDirectoryServiceServer(s, dirService)

	go func() {
		if err := s.Serve(lis); err != nil {
			panic(err)
		}
	}()

	bufDialer := func(context.Context, string) (net.Conn, error) {
		return lis.Dial()
	}

	conn, err := grpc.DialContext(ctx, "bufnet", grpc.WithContextDialer(bufDialer), grpc.WithInsecure())
	require.NoError(t, err)

	return dirService, directorytypes.NewDirectoryServiceClient(conn), conn
}

func TestDirectoryService_Query(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	_, c, conn := NewDirectoryServiceGRPC(ctx, t)
	defer conn.Close()

	vcIssuer := getVCIssuer(t)

	rdvSeed1 := []byte("testrdvseed")
	accountPub1, _ := getBertyAccountKeyPair(t)

	rdvSeed2 := []byte("testrdvseed2")
	accountPub2, _ := getBertyAccountKeyPair(t)

	phone1 := "+33123456789"
	phone2 := "+33234567890"
	phoneUnknown := "+447123456789"

	web1 := getBertyIDWebLink(t, accountPub1, rdvSeed1)
	web2 := getBertyIDWebLink(t, accountPub2, rdvSeed2)

	signedProof := getVCSignedProof(t, vcIssuer, web1, phone1)
	signedProof2 := getVCSignedProof(t, vcIssuer, web2, phone2)

	_, err := c.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof,
		ProfileURI:         web1,
	})
	require.NoError(t, err)

	_, err = c.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof2,
		ProfileURI:         web2,
	})
	require.NoError(t, err)

	queryEntriesAndCompare(t, c, []string{}, map[string]*expectedResult{})
	queryEntriesAndCompare(t, c, []string{phoneUnknown}, map[string]*expectedResult{})
	queryEntriesAndCompare(t, c, []string{phoneUnknown, phone1}, map[string]*expectedResult{phone1: {uri: web1, vc: signedProof}})
	queryEntriesAndCompare(t, c, []string{phoneUnknown, phone1, phone2}, map[string]*expectedResult{phone1: {uri: web1, vc: signedProof}, phone2: {uri: web2, vc: signedProof2}})
	queryEntriesAndCompare(t, c, []string{phone2}, map[string]*expectedResult{phone2: {uri: web2, vc: signedProof2}})

	// querying an expired record
	_, err = c.Register(context.TODO(), &directorytypes.Register_Request{
		VerifiedCredential: signedProof2,
		ProfileURI:         web2,
		ExpirationDate:     time.Now().Add(time.Millisecond * 10).UnixNano(),
	})
	require.NoError(t, err)
	time.Sleep(time.Millisecond * 11)

	queryEntriesAndCompare(t, c, []string{phoneUnknown, phone1}, map[string]*expectedResult{phone1: {uri: web1, vc: signedProof}})
}
