go-sqlcipher
==========
[![Build Status](https://travis-ci.org/xeodou/go-sqlcipher.svg?branch=master)](https://travis-ci.org/xeodou/go-sqlcipher)

SQLCipher driver conforming to the built-in database/sql interface and using the latest sqlite3 code.


which is
`3.20.1`

Working with sqlcipher version which is
`3.4.2`

It's wrapper with
 * [go-sqlite3](https://github.com/mattn/go-sqlite3) sqlite3 driver for go that using database/sql.
 * [SQLCipher](https://github.com/sqlcipher/sqlcipher) SQLCipher is an SQLite extension that provides 256 bit AES encryption of database files.
 * Using [openssl](https://github.com/openssl/openssl) as the 256 bit AES encryption.

*Have't build test in a windows machine or linux machine*
**Working in my macbook-air**
```
Configured with: --prefix=/Applications/Xcode.app/Contents/Developer/usr --with-gxx-include-dir=/usr/include/c++/4.2.1
Apple LLVM version 6.0 (clang-600.0.56) (based on LLVM 3.5svn)
Target: x86_64-apple-darwin14.3.0
Thread model: posix

OpenSSL 0.9.8zd 8 Jan 2015
built on: Mar  9 2015
platform: darwin64-x86_64-llvm
options:  bn(64,64) md2(int) rc4(ptr,char) des(idx,cisc,16,int) blowfish(idx)
compiler: -arch x86_64 -fmessage-length=0 -pipe -Wno-trigraphs -fpascal-strings -fasm-blocks -O3 -D_REENTRANT -DDSO_DLFCN -DHAVE_DLFCN_H -DL_ENDIAN -DMD32_REG_T=int -DOPENSSL_NO_IDEA -DOPENSSL_PIC -DOPENSSL_THREADS -DZLIB -mmacosx-version-min=10.6
OPENSSLDIR: "/System/Library/OpenSSL"

```

Installation
------------

This package can be installed with the go get command:

    go get github.com/xeodou/go-sqlcipher

_go-sqlcipher_ is *cgo* package.
If you want to build your app using go-sqlcipher, you need gcc.
However, if you install _go-sqlcipher_ with `go install github.com/xeodou/go-sqlcipher`, you don't need gcc to build your app anymore.

Documentation
-------------

API documentation can be found here: http://godoc.org/github.com/xeodou/go-sqlcipher

Examples can be found under the `./_example` directory

FAQ
---

The golang code is copy from [go-sqlite3](https://github.com/mattn/go-sqlite3)
If you have some issue, maybe you can find from https://github.com/mattn/go-sqlite3/issues

Here is some help from go-sqlite3 project.

* Want to build go-sqlite3 with libsqlite3 on my linux.

    Use `go build --tags "libsqlite3 linux"`

* Want to build go-sqlite3 with libsqlite3 on OS X.

    Install sqlite3 from homebrew: `brew install sqlite3`

    Use `go build --tags "libsqlite3 darwin"`

* Want to build go-sqlite3 with icu extension.

   Use `go build --tags "icu"`

   Available extensions: `json1`, `fts5`, `icu`

* Can't build go-sqlite3 on windows 64bit.

    > Probably, you are using go 1.0, go1.0 has a problem when it comes to compiling/linking on windows 64bit.
    > See: https://github.com/mattn/go-sqlite3/issues/27

* Getting insert error while query is opened.

    > You can pass some arguments into the connection string, for example, a URI.
    > See: [#39](https://github.com/mattn/go-sqlite3/issues/39)

* Do you want to cross compile? mingw on Linux or Mac?

    > See: [#106](https://github.com/mattn/go-sqlite3/issues/106)
    > See also: http://www.limitlessfx.com/cross-compile-golang-app-for-windows-from-linux.html

* Want to get time.Time with current locale

    Use `_loc=auto` in SQLite3 filename schema like `file:foo.db?_loc=auto`.

* Can I use this in multiple routines concurrently?

    Yes for readonly. But, No for writable. See [#50](https://github.com/mattn/go-sqlite3/issues/50), [#51](https://github.com/mattn/go-sqlite3/issues/51), [#209](https://github.com/mattn/go-sqlite3/issues/209), [#274](https://github.com/mattn/go-sqlite3/issues/274).

* Why is it racy if I use a `sql.Open("sqlite3", ":memory:")` database?

    Each connection to :memory: opens a brand new in-memory sql database, so if
    the stdlib's sql engine happens to open another connection and you've only
    specified ":memory:", that connection will see a brand new database. A
    workaround is to use "file::memory:?mode=memory&cache=shared". Every
    connection to this string will point to the same in-memory database. See
    [#204](https://github.com/mattn/go-sqlite3/issues/204) for more info.

* Print some waring messages like `warning: 'RAND_add' is deprecated: first deprecated in OS X 10.7`

    You can ignore these messages.

License
-------

MIT:

sqlite3-binding.c, sqlite3-binding.h, sqlite3ext.h

The -binding suffix was added to avoid build failures under gccgo.

In this repository, those files are amalgamation code that copied from SQLCipher. The license of those codes are depend on the license of SQLCipher.

In this repository, those files are an amalgamation of code that was copied from SQLite3. The license of that code is the same as the license of SQLite3.

Original repository https://github.com/mattn/go-sqlite3 is under MIT.


Author
------

[xeodou](https://xeodou.me)
