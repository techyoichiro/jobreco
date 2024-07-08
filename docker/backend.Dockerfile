# ベースイメージを指定
FROM golang:1.22-alpine
# コンテナ内の作業ディレクトリを設定
WORKDIR /api/src

# ローカルのソースコードをコンテナにコピー
COPY . .

# モジュールの依存関係を整頓
RUN go get github.com/gin-gonic/gin
RUN go get github.com/go-sql-driver/mysql
RUN go get github.com/jinzhu/gorm

# モジュールの依存関係を整頓
RUN go mod tidy

# 公開予定のコンテナのポートを明示
EXPOSE 8080

# アプリケーションを実行
CMD ["go", "run", "cmd/main.go"]