package host

// Dynamic filter allow to

import (
	"net"

	filter "github.com/libp2p/go-maddr-filter"
	"go.uber.org/zap"
)

var privateCIDR = []string{
	"127.0.0.0/8",    // IPv4 loopback
	"10.0.0.0/8",     // RFC1918
	"172.16.0.0/12",  // RFC1918
	"192.168.0.0/16", // RFC1918
	"::1/128",        // IPv6 loopback
	"fe80::/10",      // IPv6 link-local
	"fc00::/7",       // IPv6 unique local addr
}

type block []net.IPNet

var (
	privateIP block
)

var all = []block{privateIP}

type ContextFilters struct {
	lf *filter.Filters
}

func NewContextFilters(f *filter.Filters) *ContextFilters {
	return &ContextFilters{f}
}

func (f *ContextFilters) Filters() *filter.Filters {
	return f.lf
}

func (f *ContextFilters) AcceptPublicIPOnly() {
	f.deny(privateIP)
	f.defaultAction(filter.ActionAccept)
	logger().Debug("filters ip accept public only")
}

func (f *ContextFilters) AcceptPrivateIPOnly() {
	f.accept(privateIP)
	f.defaultAction(filter.ActionDeny)
	logger().Debug("filters ip accept private only")
}

func (f *ContextFilters) AcceptAll() {
	f.clear()
	f.defaultAction(filter.ActionAccept)
	logger().Debug("filters ip accept all")
}

func (f *ContextFilters) DenyAll() {
	f.clear()
	f.defaultAction(filter.ActionDeny)
	logger().Debug("filters ip deny all")
}

func (f *ContextFilters) defaultAction(a filter.Action) {
	f.lf.DefaultAction = a
}

func (f *ContextFilters) clear() {
	for _, block := range all {
		for _, ipnet := range block {
			f.lf.RemoveLiteral(ipnet)
		}
	}
}

func (f *ContextFilters) deny(bl block) {
	for _, ipnet := range bl {
		f.lf.AddFilter(ipnet, filter.ActionDeny)
	}
}

func (f *ContextFilters) accept(bl block) {
	for _, ipnet := range bl {
		f.lf.AddFilter(ipnet, filter.ActionAccept)
	}
}

func init() {
	// init privateIP
	for _, cidr := range privateCIDR {
		_, ipnet, err := net.ParseCIDR(cidr)
		if err != nil {
			logger().Fatal("cannot parse cidr", zap.Error(err), zap.String("cidr", cidr))
		}

		privateIP = append(privateIP, *ipnet)
	}
}
