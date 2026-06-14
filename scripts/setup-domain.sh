#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-jiritsu-menu.com}"
PROJECT="${2:-my-app}"

echo "=== 独自ドメイン設定: ${DOMAIN} ==="
echo ""

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx が見つかりません。"
  exit 1
fi

echo "1. ドメインの空き状況を確認..."
if ! npx vercel domains check "${DOMAIN}"; then
  echo "Error: ${DOMAIN} は取得できません。"
  exit 1
fi

echo ""
echo "2. ドメインを購入（支払い画面が開く場合があります）..."
echo "   スキップする場合は Ctrl+C で止め、すでに所有しているドメインだけ接続してください。"
npx vercel domains buy "${DOMAIN}" || true

echo ""
echo "3. プロジェクト ${PROJECT} にドメインを接続..."
npx vercel domains add "${DOMAIN}" "${PROJECT}"

echo ""
echo "4. 環境変数 NEXT_PUBLIC_SITE_URL を設定..."
printf '%s' "https://${DOMAIN}" | npx vercel env add NEXT_PUBLIC_SITE_URL production preview development --force

echo ""
echo "5. 本番へ再デプロイ..."
npx vercel --prod --yes

echo ""
echo "=== 完了 ==="
echo "選手画面: https://${DOMAIN}"
echo "管理画面: https://${DOMAIN}/admin"
echo ""
echo "DNS の反映には最大 48 時間かかることがあります。"
