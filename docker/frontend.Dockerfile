# ベースイメージを指定
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app/src

# キャッシュ利用で効率化するために別でコピー
COPY /src/package*.json .

# ソースコードをコピー
COPY ./src .

# 依存関係をインストール
RUN npm install

# アプリケーションをビルド
RUN npm run build

# ポート番号を指定
EXPOSE 3000

# アプリケーションを起動
CMD ["npm","run","dev"]