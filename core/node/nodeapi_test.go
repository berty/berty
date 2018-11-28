package node

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"

	nodeapi "berty.tech/core/api/node"
	"berty.tech/core/api/node/graphql"
	gqlgen "berty.tech/core/api/node/graphql/graph/generated"
	"berty.tech/core/entity"
	"berty.tech/core/network/netutil"
	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/grpc"
)

func TestPagination(t *testing.T) {
	var (
		ctx      = context.Background()
		alice    *Node
		gs       *grpc.Server
		resolver gqlgen.ResolverRoot
	)

	Convey("prepare graphql service", t, func() {
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

		resolver = graphql.New(nodeapi.NewServiceClient(conn)).Resolvers

		go func() {
			gs.Serve(ic.Listener())
		}()
		go func() {
			alice.Start(false, false)
		}()
	})

	Convey("testing pagination with 6 entries, 2 per-page (6%2=0)", t, func() {
		p := &nodeapi.Pagination{
			First: 2,
		}
		out, err := resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)
		expected := nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_0", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_0"},
				{Node: &entity.Contact{ID: "abcde_1", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_1"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor: "abcde_0",
				EndCursor:   "abcde_1",
				HasNextPage: true,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		p = &nodeapi.Pagination{
			First: 2,
			After: "abcde_1",
		}
		out, err = resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)

		expected = nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_2", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_2"},
				{Node: &entity.Contact{ID: "abcde_3", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_3"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor:     "abcde_2",
				EndCursor:       "abcde_3",
				HasPreviousPage: true,
				HasNextPage:     true,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		p = &nodeapi.Pagination{
			First: 2,
			After: "abcde_3",
		}
		out, err = resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)
		expected = nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_4", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_4"},
				{Node: &entity.Contact{ID: "abcde_5", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_5"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor:     "abcde_4",
				EndCursor:       "abcde_5",
				HasPreviousPage: true,
				HasNextPage:     false,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))
		//fmt.Println(toIndentedJSON(out))
		//fmt.Println(toIndentedJSON(expected))
	})
	Convey("testing pagination with 6 entries, 4 per-page (6%4=2)", t, func() {
		p := &nodeapi.Pagination{
			First: 4,
		}
		out, err := resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)
		expected := nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_0", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_0"},
				{Node: &entity.Contact{ID: "abcde_1", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_1"},
				{Node: &entity.Contact{ID: "abcde_2", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_2"},
				{Node: &entity.Contact{ID: "abcde_3", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_3"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor: "abcde_0",
				EndCursor:   "abcde_3",
				HasNextPage: true,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		p = &nodeapi.Pagination{
			First: 4,
			After: "abcde_3",
		}
		out, err = resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)
		expected = nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_4", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_4"},
				{Node: &entity.Contact{ID: "abcde_5", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_5"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor:     "abcde_4",
				EndCursor:       "abcde_5",
				HasPreviousPage: true,
				HasNextPage:     false,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))
	})
	Convey("testing pagination with 6 entries, 4 per-page, reverse order (6%4=2)", t, func() {
		p := &nodeapi.Pagination{
			OrderDesc: true,
			First:     4,
			//OrderBy:   "id",
		}
		out, err := resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)
		expected := nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_5", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_5"},
				{Node: &entity.Contact{ID: "abcde_4", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_4"},
				{Node: &entity.Contact{ID: "abcde_3", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_3"},
				{Node: &entity.Contact{ID: "abcde_2", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_2"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor:     "abcde_5",
				EndCursor:       "abcde_2",
				HasPreviousPage: false,
				HasNextPage:     true,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		p = &nodeapi.Pagination{
			OrderDesc: true,
			First:     4,
			After:     "abcde_2",
		}
		out, err = resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)
		expected = nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_1", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_1"},
				{Node: &entity.Contact{ID: "abcde_0", Status: entity.Contact_IsTrustedFriend}, Cursor: "abcde_0"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor:     "abcde_1",
				EndCursor:       "abcde_0",
				HasPreviousPage: true,
				HasNextPage:     false,
			},
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
