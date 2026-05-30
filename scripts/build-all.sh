#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
(cd frontend && npm install && npm run build)
(cd backend && mvn -q -DskipTests package)
