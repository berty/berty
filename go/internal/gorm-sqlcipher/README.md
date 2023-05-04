a fork of `github.com/flyingtime/gorm-sqlcipher` that no longer exist

# GORM Sqlite Driver

![CI](https://github.com/go-gorm/sqlite/workflows/CI/badge.svg)

## USAGE

```go
import (
  sqlcipher "github.com/open-olive/gorm-sqlcipher"
  "gorm.io/gorm"
)

// https://github.com/mutecomm/go-sqlcipher
db, err := gorm.Open(sqlcipher.Open("gorm.db"), &gorm.Config{})
```

Checkout [https://gorm.io](https://gorm.io) for details.
