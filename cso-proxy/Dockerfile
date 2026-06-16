FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY main.go .
COPY cso.geojson .
RUN CGO_ENABLED=0 GOOS=linux go build -o cso_proxy main.go

FROM alpine
COPY --from=builder /app/cso_proxy /cso_proxy
EXPOSE 8080
# Command to run the executable
ENTRYPOINT ["/cso_proxy"]
