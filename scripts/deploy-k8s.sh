#!/usr/bin/env bash
set -e
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mysql-redis-rabbitmq.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml
