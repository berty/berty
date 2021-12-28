package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"sort"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
)

func argsMapToURL(m map[string]string) string {
	strs := make([]string, len(m))
	i := 0
	for k, v := range m {
		strs[i] = fmt.Sprintf("%s=%s", k, v)
		i++
	}
	sort.Strings(strs)
	return strings.Join(strs, "&")
}

func CMCAPICall(kind, path string, inArgs map[string]string, result interface{}, apiKey string, print bool) error {
	const APIBaseURL = "https://pro-api.coinmarketcap.com"

	if len(apiKey) == 0 {
		return errors.New("empty api key")
	}

	argsMap := make(map[string]string)
	for k, v := range inArgs {
		argsMap[k] = v
	}

	args := argsMapToURL(argsMap)

	var url string
	reader := io.Reader(nil)
	if kind == "GET" {
		url = fmt.Sprintf("%s%s?%s", APIBaseURL, path, args)
	} else {
		url = fmt.Sprintf("%s%s", APIBaseURL, path)
		reader = bytes.NewReader([]byte(args))
	}

	req, err := http.NewRequest(kind, url, reader)
	if err != nil {
		return fmt.Errorf("http.NewRequest: %s", err.Error())
	}

	req.Header.Add("X-CMC_PRO_API_KEY", apiKey)

	if kind != "GET" {
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		if print {
			log.Printf("%s %s BODY:%s", kind, url, args)
		}
	} else {
		if print {
			log.Printf("%s %s\n", kind, url)
		}
	}

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return fmt.Errorf("http.Client.Do: %s", err.Error())
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("bad response status: HTTP %d (%s)", resp.StatusCode, resp.Status)
	}

	if err := json.NewDecoder(resp.Body).Decode(result); err != nil {
		return fmt.Errorf("decode json: %s", err.Error())
	}

	return nil
}

type cmcPriceCacheDatum struct {
	Date  time.Time `json:"date"`
	Value float64   `json:"value"`
}

type cmcPriceCache struct {
	Data   map[string]cmcPriceCacheDatum `json:"data"`
	mutex  *sync.Mutex
	path   string
	key    string
	logger *zap.Logger
}

func loadCMCCachedPrices(logger *zap.Logger, cachePath string, key string) *cmcPriceCache {
	cacheBytes, err := ioutil.ReadFile(cachePath)
	if err != nil {
		return newCMCPriceCache(logger, cachePath, key)
	}
	var loaded cmcPriceCache
	if err := json.Unmarshal(cacheBytes, &loaded); err != nil {
		return newCMCPriceCache(logger, cachePath, key)
	}
	initCMCPriceCache(logger, cachePath, key, &loaded)
	return &loaded
}

func newCMCPriceCache(logger *zap.Logger, cachePath string, key string) *cmcPriceCache {
	c := cmcPriceCache{}
	initCMCPriceCache(logger, cachePath, key, &c)
	return &c
}

func initCMCPriceCache(logger *zap.Logger, cachePath string, key string, target *cmcPriceCache) {
	if target.Data == nil {
		target.Data = make(map[string]cmcPriceCacheDatum)
	}
	target.mutex = &sync.Mutex{}
	target.path = cachePath
	target.key = key
	target.logger = logger
}

func (c *cmcPriceCache) save() {
	dir := path.Dir(c.path)
	os.MkdirAll(dir, os.ModePerm)
	cacheBytes, err := json.Marshal(c)
	if err != nil {
		return
	}
	_ = ioutil.WriteFile(c.path, cacheBytes, os.ModePerm)
}

const (
	cmcCacheLatency = 30 * time.Minute
	cmcCacheQuote   = "EUR"
)

func (c *cmcPriceCache) get(symbol string) cmcPriceCacheDatum {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	datum, ok := c.Data[symbol]
	if !ok || time.Now().After(datum.Date.Add(cmcCacheLatency)) {
		// fetch
		priceCallArgs := map[string]string{
			"symbol":  symbol,
			"convert": cmcCacheQuote,
		}
		var ret cmcCryptoQuoteLatest
		if err := CMCAPICall("GET", "/v1/cryptocurrency/quotes/latest", priceCallArgs, &ret, c.key, true); err != nil {
			return cmcPriceCacheDatum{}
		}
		datum = cmcPriceCacheDatum{Date: time.Now(), Value: ret.Data[symbol].Quote[cmcCacheQuote].Price}
		c.Data[symbol] = datum
		c.save()
	}

	return datum
}

type cmcCryptoQuoteLatest struct {
	Data map[string]struct {
		Quote map[string]struct {
			Price float64 `json:"price"`
		} `json:"quote"`
	} `json:"data"`
	/*map[
		data:map[
			XCH:map[
				circulating_supply:0
				cmc_rank:2526
				date_added:2021-04-16T00:00:00.000Z
				id:9258
				is_active:1
				is_fiat:0
				last_updated:2021-05-03T17:44:02.000Z
				max_supply:<nil>
				name:Chia Network
				num_market_pairs:4
				platform:<nil>
				quote:map[
					EUR:map[
						last_updated:2021-05-03T17:44:15.000Z
						market_cap:0
						percent_change_1h:-2.77381915
						percent_change_24h:-0.71231468
						percent_change_30d:<nil>
						percent_change_60d:<nil>
						percent_change_7d:-1.57392158
						percent_change_90d:<nil>
						price:1287.1547554759227
						volume_24h:8.296586536547668e+06
					]
				]
				slug:chia-network
				symbol:XCH
				tags:[]
				total_supply:0
			]
		]
		status:map[
			credit_count:1
			elapsed:371
			error_code:0
			error_message:<nil>
			notice:<nil>
			timestamp:2021-05-03T17:45:00.688Z
		]
	]*/
}
