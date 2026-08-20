#!/usr/bin/env bash
# Verifies that the Apple App Site Association file is served correctly.
#
#   ./scripts/verify-aasa.sh                 # checks https://1800limo.com
#   ./scripts/verify-aasa.sh https://staging.example.com
#
# Apple requires the file to be served over HTTPS, with no redirect, as
# Content-Type: application/json, and as raw JSON (not the Angular index.html).

set -uo pipefail

BASE="${1:-https://1800limo.com}"
URL="$BASE/.well-known/apple-app-site-association"
TEAM_ID="JFCY24UU7R"
PASSENGER_APPID="$TEAM_ID.com.Limo.-1800LimoUserApp"
DRIVER_APPID="$TEAM_ID.com.1800limous.app"

fail=0
ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$1"; }
bad()  { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; fail=1; }

echo "Checking $URL"
echo

headers=$(curl -sS -o /tmp/aasa.body -w '%{http_code}\n%{content_type}\n%{num_redirects}\n%{url_effective}\n' "$URL" 2>/dev/null)
status=$(echo "$headers" | sed -n '1p')
ctype=$(echo  "$headers" | sed -n '2p')
redirects=$(echo "$headers" | sed -n '3p')
final=$(echo  "$headers" | sed -n '4p')

[ "$status" = "200" ] && ok "HTTP 200" || bad "expected HTTP 200, got $status"

case "$ctype" in
	application/json*) ok "Content-Type: $ctype" ;;
	*)                 bad "expected Content-Type application/json, got '${ctype:-<none>}'" ;;
esac

[ "$redirects" = "0" ] && ok "no redirects" || bad "$redirects redirect(s), ended at $final"

if grep -qi '<!doctype html' /tmp/aasa.body; then
	bad "served Angular index.html instead of the AASA JSON (SPA fallback is swallowing the path)"
else
	ok "not the Angular index.html"
fi

if python3 -m json.tool /tmp/aasa.body > /dev/null 2>&1; then
	ok "valid JSON"
else
	bad "body is not valid JSON"
fi

for appid in "$PASSENGER_APPID" "$DRIVER_APPID"; do
	if grep -q "$appid" /tmp/aasa.body; then
		ok "contains appID $appid"
	else
		bad "missing appID $appid"
	fi
done

echo
echo "Apple's CDN copy (what devices actually fetch; may lag by up to ~24h):"
echo "  https://app-site-association.cdn-apple.com/a/v1/${BASE#https://}"
echo

exit $fail
