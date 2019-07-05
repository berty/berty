package node

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"testing"

	nodeapi "berty.tech/core/api/node"
	"berty.tech/core/entity"
	netutil "berty.tech/network/helper"
	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/grpc"
)

func TestPagination(t *testing.T) {
	var (
		ctx    = context.Background()
		alice  *Node
		gs     *grpc.Server
		client nodeapi.ServiceClient
	)

	Convey("prepare client grpc", t, func() {
		// grpc
		gs = grpc.NewServer()

		// node
		alice, _ = testNode(t, WithNodeGrpcServer(gs))
		So(alice.sql(nil).Where("1=1").Delete(&entity.Contact{}).Error, ShouldBeNil)
		for i := 0; i < 6; i++ {
			So(alice.sql(nil).Save(&entity.Contact{
				ID:     fmt.Sprintf("abcde_%d", i),
				Status: entity.Contact_IsTrustedFriend,
			}).Error, ShouldBeNil)
		}
		So(alice.sql(nil).Model(entity.Contact{}).Where("1=1").UpdateColumn("created_at", nil).UpdateColumn("updated_at", nil).Error, ShouldBeNil)
		// alice.sql = alice.sql(nil).Debug() // temporarily uncomment this line to have gorm debug

		// graphql service
		ic := netutil.NewIOGrpc()
		icdialer := ic.NewDialer()
		dialOpts := append([]grpc.DialOption{
			grpc.WithInsecure(),
			grpc.WithDialer(icdialer),
		})
		conn, err := grpc.Dial("", dialOpts...)
		So(err, ShouldBeNil)
		client = nodeapi.NewServiceClient(conn)

		go func() {
			gs.Serve(ic.Listener())
		}()
		go func() {
			alice.Start(context.Background(), false, false)
		}()
	})

	Convey("testing pagination with 6 entries, 2 per-page (6%2=0)", t, func() {
		stream, err := client.ContactList(ctx, &nodeapi.ContactListInput{
			Paginate: &nodeapi.Pagination{
				First: 2,
			},
		})
		So(err, ShouldBeNil)

		expected := []*entity.Contact{
			&entity.Contact{ID: "abcde_0", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_1", Status: entity.Contact_IsTrustedFriend},
		}
		out := []*entity.Contact{}
		for {
			contact, err := stream.Recv()
			if err == io.EOF {
				break
			}
			So(err, ShouldBeNil)
			out = append(out, contact)
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		stream, err = client.ContactList(ctx, &nodeapi.ContactListInput{
			Paginate: &nodeapi.Pagination{
				First: 2,
				After: "abcde_3",
			},
		})
		So(err, ShouldBeNil)

		expected = []*entity.Contact{
			&entity.Contact{ID: "abcde_4", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_5", Status: entity.Contact_IsTrustedFriend},
		}

		out = []*entity.Contact{}
		for {
			contact, err := stream.Recv()
			if err == io.EOF {
				break
			}
			So(err, ShouldBeNil)
			out = append(out, contact)
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))
		//fmt.Println(toIndentedJSON(out))
		//fmt.Println(toIndentedJSON(expected))
	})
	Convey("testing pagination with 6 entries, 4 per-page (6%4=2)", t, func() {

		stream, err := client.ContactList(ctx, &nodeapi.ContactListInput{
			Paginate: &nodeapi.Pagination{
				First: 4,
			},
		})
		So(err, ShouldBeNil)

		expected := []*entity.Contact{
			&entity.Contact{ID: "abcde_0", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_1", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_2", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_3", Status: entity.Contact_IsTrustedFriend},
		}
		out := []*entity.Contact{}
		for {
			contact, err := stream.Recv()
			if err == io.EOF {
				break
			}
			So(err, ShouldBeNil)
			out = append(out, contact)
		}

		stream, err = client.ContactList(ctx, &nodeapi.ContactListInput{
			Paginate: &nodeapi.Pagination{
				First: 4,
				After: "abcde_3",
			},
		})
		So(err, ShouldBeNil)

		expected = []*entity.Contact{
			&entity.Contact{ID: "abcde_4", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_5", Status: entity.Contact_IsTrustedFriend},
		}

		out = []*entity.Contact{}
		for {
			contact, err := stream.Recv()
			if err == io.EOF {
				break
			}
			So(err, ShouldBeNil)
			out = append(out, contact)
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))
	})
	Convey("testing pagination with 6 entries, 4 per-page, reverse order (6%4=2)", t, func() {
		stream, err := client.ContactList(ctx, &nodeapi.ContactListInput{
			Paginate: &nodeapi.Pagination{
				First:     4,
				OrderDesc: true,
			},
		})
		So(err, ShouldBeNil)

		expected := []*entity.Contact{
			&entity.Contact{ID: "abcde_5", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_4", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_3", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_2", Status: entity.Contact_IsTrustedFriend},
		}

		out := []*entity.Contact{}
		for {
			contact, err := stream.Recv()
			if err == io.EOF {
				break
			}
			So(err, ShouldBeNil)
			out = append(out, contact)
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		stream, err = client.ContactList(ctx, &nodeapi.ContactListInput{
			Paginate: &nodeapi.Pagination{
				OrderDesc: true,
				First:     4,
				After:     "abcde_2",
			},
		})
		So(err, ShouldBeNil)

		expected = []*entity.Contact{
			&entity.Contact{ID: "abcde_1", Status: entity.Contact_IsTrustedFriend},
			&entity.Contact{ID: "abcde_0", Status: entity.Contact_IsTrustedFriend},
		}
		out = []*entity.Contact{}
		for {
			contact, err := stream.Recv()
			if err == io.EOF {
				break
			}
			So(err, ShouldBeNil)
			out = append(out, contact)
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))
	})
}

func toJSON(input interface{}) string {
	out, _ := json.Marshal(input)
	return string(out)
}

func toIndentedJSON(input interface{}) string {
	out, _ := json.MarshalIndent(input, "", "  ")
	return string(out)
}
