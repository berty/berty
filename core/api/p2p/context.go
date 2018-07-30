package p2p

import "context"

type contextKey string

var senderKey = contextKey("sender")
var pubkeyKey = contextKey("pubkey")

func SetSender(ctx context.Context, sender string) context.Context {
	return context.WithValue(ctx, senderKey, sender)
}

func GetSender(ctx context.Context) string {
	sender, _ := ctx.Value(senderKey).(string)
	return sender
}

func SetPubkey(ctx context.Context, pubkey []byte) context.Context {
	return context.WithValue(ctx, pubkeyKey, pubkey)
}

func GetPubkey(ctx context.Context) []byte {
	pubkey, _ := ctx.Value(pubkeyKey).([]byte)
	return pubkey
}
