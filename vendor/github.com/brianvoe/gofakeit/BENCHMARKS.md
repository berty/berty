go test -bench=. -benchmem
goos: darwin  
goarch: amd64  
pkg: github.com/brianvoe/gofakeit  

||||||
|-|-|-|-|-|
|BenchmarkAddress-8              	|  500000|	      2433 ns/op|	     255 B/op|	       7 allocs/op|
|BenchmarkStreet-8               	| 2000000|	       882 ns/op|	      62 B/op|	       3 allocs/op|
|BenchmarkStreetNumber-8         	| 5000000|	       378 ns/op|	      36 B/op|	       2 allocs/op|
|BenchmarkStreetPrefix-8         	|10000000|	       126 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkStreetName-8           	|10000000|	       127 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkStreetSuffix-8         	|10000000|	       129 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkCity-8                 	| 5000000|	       366 ns/op|	      15 B/op|	       1 allocs/op|
|BenchmarkState-8                	|10000000|	       134 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkStateAbr-8             	|10000000|	       131 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkZip-8                  	| 3000000|	       426 ns/op|	       9 B/op|	       1 allocs/op|
|BenchmarkCountry-8              	|10000000|	       153 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkCountryAbr-8           	|10000000|	       145 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkLatitude-8             	|50000000|	        25.1 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkLongitude-8            	|50000000|	        25.1 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkLatitudeInRange-8      	|50000000|	        29.5 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkLongitudeInRange-8     	|50000000|	        30.7 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkBeerName-8             	|20000000|	       110 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkBeerStyle-8            	|10000000|	       130 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkBeerHop-8              	|20000000|	       111 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkBeerYeast-8            	|20000000|	       111 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkBeerMalt-8             	|10000000|	       121 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkBeerIbu-8              	|20000000|	        77.0 ns/op|	       8 B/op|	       1 allocs/op|
|BenchmarkBeerAlcohol-8          	| 5000000|	       357 ns/op|	      40 B/op|	       3 allocs/op|
|BenchmarkBeerBlg-8              	| 5000000|	       362 ns/op|	      48 B/op|	       3 allocs/op|
|BenchmarkBool-8                 	|50000000|	        36.4 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkColor-8                	|20000000|	       116 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkSafeColor-8            	|20000000|	       105 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkHexColor-8             	| 3000000|	       539 ns/op|	      24 B/op|	       3 allocs/op|
|BenchmarkRGBColor-8             	|20000000|	       107 ns/op|	      32 B/op|	       1 allocs/op|
|BenchmarkCompany-8              	| 5000000|	       371 ns/op|	      22 B/op|	       1 allocs/op|
|BenchmarkCompanySuffix-8        	|20000000|	        99.9 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkBuzzWord-8             	|20000000|	       107 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkBS-8                   	|20000000|	       108 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkContact-8              	| 1000000|	      1268 ns/op|	     178 B/op|	       7 allocs/op|
|BenchmarkPhone-8                	| 3000000|	       473 ns/op|	      16 B/op|	       1 allocs/op|
|BenchmarkEmail-8                	| 2000000|	       753 ns/op|	     130 B/op|	       5 allocs/op|
|BenchmarkCurrency-8             	|10000000|	       126 ns/op|	      32 B/op|	       1 allocs/op|
|BenchmarkCurrencyShort-8        	|20000000|	       112 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkCurrencyLong-8         	|20000000|	       117 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkDate-8                 	| 5000000|	       365 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkDateRange-8            	|10000000|	       172 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkMonth-8                	|30000000|	        48.4 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkDay-8                  	|30000000|	        44.1 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkWeekDay-8              	|30000000|	        45.7 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkYear-8                 	|20000000|	        81.9 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkHour-8                 	|30000000|	        42.9 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkMinute-8               	|30000000|	        43.9 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkSecond-8               	|30000000|	        43.9 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkNanoSecond-8           	|30000000|	        45.1 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkMimeType-8             	|20000000|	       111 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkExtension-8            	|10000000|	       122 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkGenerate-8             	| 1000000|	      1756 ns/op|	     414 B/op|	      11 allocs/op|
|BenchmarkHackerPhrase-8         	|  300000|	      4890 ns/op|	    2296 B/op|	      26 allocs/op|
|BenchmarkHackerAbbreviation-8   	|20000000|	       107 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkHackerAdjective-8      	|20000000|	       109 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkHackerNoun-8           	|20000000|	       111 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkHackerVerb-8           	|10000000|	       121 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkHackerIngverb-8        	|20000000|	       104 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkHipsterWord-8          	|20000000|	       112 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkHipsterSentence-8      	| 1000000|	      2114 ns/op|	     782 B/op|	       9 allocs/op|
|BenchmarkHipsterParagraph-8     	|   50000|	     39502 ns/op|	   18499 B/op|	     170 allocs/op|
|BenchmarkImageURL-8             	|10000000|	       124 ns/op|	      38 B/op|	       3 allocs/op|
|BenchmarkDomainName-8           	| 3000000|	       571 ns/op|	      76 B/op|	       3 allocs/op|
|BenchmarkDomainSuffix-8         	|20000000|	       111 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkURL-8                  	| 1000000|	      1316 ns/op|	     278 B/op|	       8 allocs/op|
|BenchmarkHTTPMethod-8           	|20000000|	       110 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkIPv4Address-8          	| 3000000|	       442 ns/op|	      48 B/op|	       5 allocs/op|
|BenchmarkIPv6Address-8          	| 3000000|	       595 ns/op|	      96 B/op|	       7 allocs/op|
|BenchmarkUsername-8             	| 5000000|	       351 ns/op|	      16 B/op|	       2 allocs/op|
|BenchmarkPassword-8             	| 1000000|	      1355 ns/op|	     432 B/op|	       7 allocs/op|
|BenchmarkJob-8                  	| 2000000|	       793 ns/op|	      86 B/op|	       2 allocs/op|
|BenchmarkJobTitle-8             	|20000000|	       106 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkJobDescriptor-8        	|20000000|	       109 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkJobLevel-8             	|10000000|	       126 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkLogLevel-8             	|10000000|	       135 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkName-8                 	| 5000000|	       338 ns/op|	      17 B/op|	       1 allocs/op|
|BenchmarkFirstName-8            	|10000000|	       118 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkLastName-8             	|20000000|	       115 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkNamePrefix-8           	|20000000|	       112 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkNameSuffix-8           	|10000000|	       121 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkNumber-8               	|50000000|	        37.6 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkUint8-8                	|50000000|	        31.4 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkUint16-8               	|50000000|	        31.3 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkUint32-8               	|50000000|	        29.3 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkUint64-8               	|50000000|	        37.5 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkInt8-8                 	|50000000|	        31.5 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkInt16-8                	|50000000|	        31.5 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkInt32-8                	|50000000|	        29.6 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkInt64-8                	|50000000|	        38.8 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkFloat32-8              	|50000000|	        27.9 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkFloat64-8              	|50000000|	        28.5 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkNumerify-8             	| 3000000|	       384 ns/op|	      16 B/op|	       1 allocs/op|
|BenchmarkShuffleInts-8          	| 5000000|	       253 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkCreditCard-8           	| 1000000|	      1091 ns/op|	      88 B/op|	       4 allocs/op|
|BenchmarkCreditCardType-8       	|20000000|	       100 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkCreditCardNumber-8     	| 2000000|	       610 ns/op|	      16 B/op|	       1 allocs/op|
|BenchmarkCreditCardExp-8        	|10000000|	       147 ns/op|	       5 B/op|	       1 allocs/op|
|BenchmarkCreditCardCvv-8        	|10000000|	       149 ns/op|	       3 B/op|	       1 allocs/op|
|BenchmarkSSN-8   	                |10000000|	       124 ns/op|	      16 B/op|	       1 allocs/op|
|BenchmarkGender-8               	|30000000|	        40.8 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkPerson-8               	|  200000|	      6834 ns/op|	     820 B/op|	      26 allocs/op|
|BenchmarkSimpleStatusCode-8     	|20000000|	        84.6 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkStatusCode-8           	|20000000|	        83.0 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkLetter-8               	|20000000|	        65.8 ns/op|	       4 B/op|	       1 allocs/op|
|BenchmarkLexify-8               	| 5000000|	       243 ns/op|	       8 B/op|	       1 allocs/op|
|BenchmarkShuffleStrings-8       	| 5000000|	       259 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkUUID-8                 	|20000000|	       116 ns/op|	      48 B/op|	       1 allocs/op|
|BenchmarkUserAgent-8            	| 1000000|	      1319 ns/op|	     305 B/op|	       5 allocs/op|
|BenchmarkChromeUserAgent-8      	| 2000000|	       988 ns/op|	     188 B/op|	       5 allocs/op|
|BenchmarkFirefoxUserAgent-8     	| 1000000|	      1715 ns/op|	     386 B/op|	       7 allocs/op|
|BenchmarkSafariUserAgent-8      	| 1000000|	      1513 ns/op|	     551 B/op|	       7 allocs/op|
|BenchmarkOperaUserAgent-8       	| 1000000|	      1038 ns/op|	     216 B/op|	       5 allocs/op|
|BenchmarkWord-8                 	|20000000|	       106 ns/op|	       0 B/op|	       0 allocs/op|
|BenchmarkSentence-8             	| 1000000|	      2081 ns/op|	     721 B/op|	      10 allocs/op|
|BenchmarkParagraph-8            	|   50000|	     37894 ns/op|	   16105 B/op|	     172 allocs/op|