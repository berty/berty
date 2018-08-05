package floodsub

import (
	pb "github.com/libp2p/go-floodsub/pb"
)

func NewMessageCache(gossip, history int) *MessageCache {
	return &MessageCache{
		msgs:    make(map[string]*pb.Message),
		history: make([][]CacheEntry, history),
		gossip:  gossip,
	}
}

type MessageCache struct {
	msgs    map[string]*pb.Message
	history [][]CacheEntry
	gossip  int
}

type CacheEntry struct {
	mid    string
	topics []string
}

func (mc *MessageCache) Put(msg *pb.Message) {
	mid := msgID(msg)
	mc.msgs[mid] = msg
	mc.history[0] = append(mc.history[0], CacheEntry{mid: mid, topics: msg.GetTopicIDs()})
}

func (mc *MessageCache) Get(mid string) (*pb.Message, bool) {
	m, ok := mc.msgs[mid]
	return m, ok
}

func (mc *MessageCache) GetGossipIDs(topic string) []string {
	var mids []string
	for _, entries := range mc.history[:mc.gossip] {
		for _, entry := range entries {
			for _, t := range entry.topics {
				if t == topic {
					mids = append(mids, entry.mid)
					break
				}
			}
		}
	}
	return mids
}

func (mc *MessageCache) Shift() {
	last := mc.history[len(mc.history)-1]
	for _, entry := range last {
		delete(mc.msgs, entry.mid)
	}
	for i := len(mc.history) - 2; i >= 0; i-- {
		mc.history[i+1] = mc.history[i]
	}
	mc.history[0] = nil
}
