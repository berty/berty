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
		So(alice.sql.Where("1=1").Delete(&entity.Contact{}).Error, ShouldBeNil)
		for i := 0; i < 5; i++ {
			So(alice.sql.Save(&entity.Contact{ID: fmt.Sprintf("abcde_%d", i)}).Error, ShouldBeNil)
		}
		So(alice.sql.Model(entity.Contact{}).Where("1=1").UpdateColumn("created_at", nil).UpdateColumn("updated_at", nil).Error, ShouldBeNil)
		//alice.sql = alice.sql.Debug() // FIXME: remove

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
			alice.Start()
		}()
	})

	Convey("testing pagination", t, func() {
		// test1: first=2, after=nil
		p := &nodeapi.Pagination{
			First: 2,
		}
		out, err := resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)
		expected := nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_0"}, Cursor: "abcde_0"},
				{Node: &entity.Contact{ID: "abcde_1"}, Cursor: "abcde_1"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor: "abcde_0",
				EndCursor:   "abcde_1",
				HasNextPage: true,
				Count:       2,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		// test2: first=2, after=abcde_2
		p = &nodeapi.Pagination{
			First: 2,
			After: "abcde_1",
		}
		out, err = resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)

		expected = nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_2"}, Cursor: "abcde_2"},
				{Node: &entity.Contact{ID: "abcde_3"}, Cursor: "abcde_3"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor:     "abcde_2",
				EndCursor:       "abcde_3",
				HasPreviousPage: true,
				HasNextPage:     true,
				Count:           2,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		// test3: first=2, after=abcde_3
		p = &nodeapi.Pagination{
			First: 2,
			After: "abcde_3",
		}
		out, err = resolver.Query().ContactList(ctx, &entity.Contact{}, p.OrderBy, p.OrderDesc, &p.First, &p.After, &p.Last, &p.Before)
		So(err, ShouldBeNil)
		expected = nodeapi.ContactListConnection{
			Edges: []*nodeapi.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_4"}, Cursor: "abcde_4"},
			},
			PageInfo: &nodeapi.PageInfo{
				StartCursor:     "abcde_4",
				EndCursor:       "abcde_4",
				HasPreviousPage: true,
				HasNextPage:     false,
				Count:           1,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))
		//fmt.Println(toIndentedJSON(out))
		//fmt.Println(toIndentedJSON(expected))
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
