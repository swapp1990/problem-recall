#!/bin/bash
# problem-recall deploy script
# Usage: ./deploy.sh
# Builds the Vite app and syncs dist/ to the droplet with an atomic swap.
#
# Uses tar+scp instead of rsync because rsync 3.4.1 hangs when invoked as
# a subprocess from agent harnesses. tar+scp is slower on warm runs but never hangs.

set -e

SERVER="root@64.225.33.214"
SSH_KEY="$HOME/.ssh/moltbot_rsa"
SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=15"
SCP="scp -i $SSH_KEY -o StrictHostKeyChecking=no"
REMOTE_BASE="/var/www/problem-recall"
LIVE_URL="https://leetcode.swapp1990.org"

cd "$(dirname "$0")"

echo "→ Building (vite)..."
npm run build

echo "→ Packaging dist..."
TAR_DIST=$(mktemp -u).tar.gz
tar -czf "$TAR_DIST" -C dist .

echo "→ Uploading..."
$SCP "$TAR_DIST" "$SERVER:/tmp/pr-dist.tar.gz"
rm -f "$TAR_DIST"

echo "→ Extracting on server (atomic swap)..."
$SSH "$SERVER" "set -e; \
  rm -rf $REMOTE_BASE.new && mkdir -p $REMOTE_BASE.new && \
  tar -xzf /tmp/pr-dist.tar.gz -C $REMOTE_BASE.new && \
  rm -rf $REMOTE_BASE.old && \
  if [ -d $REMOTE_BASE ]; then mv $REMOTE_BASE $REMOTE_BASE.old; fi && \
  mv $REMOTE_BASE.new $REMOTE_BASE && \
  rm -rf $REMOTE_BASE.old && \
  rm -f /tmp/pr-dist.tar.gz"

echo "→ Reloading nginx..."
$SSH "$SERVER" "nginx -t && systemctl reload nginx"

echo "✅ Deploy complete — $LIVE_URL"
