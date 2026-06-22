#!/usr/bin/env bash
# ============================================================
#  BootForge — Cloudflare R2 Asset Upload Script
#  Usage: bash scripts/upload-to-r2.sh
#
#  Prerequisites:
#    1. Create a Cloudflare R2 bucket named "bootforge-assets"
#    2. Get your R2 credentials (Account ID, Access Key, Secret Key)
#    3. Run: rclone config  → create remote named "r2" with type "s3"
#         Provider: Cloudflare
#         Access Key ID: <your R2 access key>
#         Secret Access Key: <your R2 secret key>
#         Endpoint: https://<account-id>.r2.cloudflarestorage.com
#    4. Make bucket public in Cloudflare dashboard → R2 → your bucket → Settings → Public access
#    5. Set NEXT_PUBLIC_R2_BASE_URL in Vercel dashboard to your public bucket URL
#       e.g. https://pub-xxxxxxxx.r2.dev
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ASSETS_ROOT="$(dirname "$PROJECT_ROOT")"  # bootanimation-gallery/

EXTRACTED_DIR="$ASSETS_ROOT/extracted"
PREVIEWS_DIR="$ASSETS_ROOT/previews"
ZIPS_DIR="$ASSETS_ROOT/source-zips"

RCLONE_REMOTE="r2:bootforge-assets"

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║     BootForge → Cloudflare R2 Upload      ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# ── Check rclone is installed ─────────────────────────────
RCLONE_CMD="rclone"
if ! command -v rclone &> /dev/null; then
  if [ -f "$SCRIPT_DIR/bin/rclone" ]; then
    RCLONE_CMD="$SCRIPT_DIR/bin/rclone"
  else
    echo "❌ rclone is not installed, and standalone binary was not found at $SCRIPT_DIR/bin/rclone."
    exit 1
  fi
fi

echo "✅ rclone found: $($RCLONE_CMD version | head -1)"
echo ""

# ── Step 1: Generate manifest.json for each animation ────
echo "📋 Step 1: Generating frame manifests..."
echo ""

MANIFEST_COUNT=0
for folder in "$EXTRACTED_DIR"/*/; do
  folder_name=$(basename "$folder")
  manifest_path="$folder/manifest.json"

  # Build manifest: { "part0": ["frame_00.png", ...], "part1": [...] }
  python3 - "$folder" "$manifest_path" << 'PYTHON'
import sys, os, json

folder = sys.argv[1].rstrip('/')
manifest_path = sys.argv[2]
manifest = {}

for item in sorted(os.listdir(folder)):
  item_path = os.path.join(folder, item)
  if os.path.isdir(item_path) and item.startswith("part"):
    files = sorted(
      [f for f in os.listdir(item_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))],
      key=lambda x: x
    )
    manifest[item] = files

with open(manifest_path, 'w') as f:
  json.dump(manifest, f, separators=(',', ':'))

print(f"  ✓ {os.path.basename(folder)} → {sum(len(v) for v in manifest.values())} frames across {len(manifest)} parts")
PYTHON

  MANIFEST_COUNT=$((MANIFEST_COUNT + 1))
done

echo ""
echo "   Generated $MANIFEST_COUNT manifests"
echo ""

# ── Step 2: Upload extracted frames + manifests ───────────
echo "📤 Step 2: Uploading extracted frames to R2..."
echo "   Source: $EXTRACTED_DIR"
echo "   Dest:   $RCLONE_REMOTE/extracted/"
echo ""

$RCLONE_CMD sync "$EXTRACTED_DIR" "$RCLONE_REMOTE/extracted" \
  --transfers=32 \
  --checkers=16 \
  --progress \
  --header-upload "Cache-Control:public, max-age=31536000, immutable" \
  --exclude="**/.DS_Store"

echo ""
echo "✅ Extracted frames uploaded"
echo ""

# ── Step 3: Upload previews (GIFs + cover PNGs) ───────────
echo "📤 Step 3: Uploading previews (GIFs + covers) to R2..."
echo "   Source: $PREVIEWS_DIR"
echo "   Dest:   $RCLONE_REMOTE/previews/"
echo ""

$RCLONE_CMD sync "$PREVIEWS_DIR" "$RCLONE_REMOTE/previews" \
  --transfers=16 \
  --checkers=8 \
  --progress \
  --header-upload "Cache-Control:public, max-age=31536000, immutable" \
  --exclude="**/.DS_Store"

echo ""
echo "✅ Previews uploaded"
echo ""

# ── Step 4: Upload source ZIPs ────────────────────────────
echo "📤 Step 4: Uploading source ZIPs to R2..."
echo "   Source: $ZIPS_DIR"
echo "   Dest:   $RCLONE_REMOTE/source-zips/"
echo ""

$RCLONE_CMD sync "$ZIPS_DIR" "$RCLONE_REMOTE/source-zips" \
  --transfers=8 \
  --checkers=4 \
  --progress \
  --header-upload "Cache-Control:public, max-age=31536000, immutable" \
  --exclude="**/.DS_Store"

echo ""
echo "✅ Source ZIPs uploaded"
echo ""

# ── Step 5: Update animations.json with R2 URLs ───────────
echo "🔗 Step 5: Updating animations.json with R2 URLs..."
echo ""
echo "   ⚠️  Set your R2 public URL in the prompt below."
R2_URL="$1"
if [ -z "$R2_URL" ]; then
  read -p "   Enter your R2 public URL (e.g. https://pub-abc123.r2.dev): " R2_URL
fi
R2_URL="${R2_URL%/}"  # strip trailing slash

DATA_FILE="$SCRIPT_DIR/../src/data/animations.json"

# Replace local paths with R2 URLs using sed
sed -i \
  -e "s|/previews/|${R2_URL}/previews/|g" \
  -e "s|/source-zips/|${R2_URL}/source-zips/|g" \
  -e "s|/extracted/|${R2_URL}/extracted/|g" \
  "$DATA_FILE"

echo "   ✅ animations.json updated with R2 URLs"
echo ""

# ── Step 6: Set env var reminder ─────────────────────────
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🎉 Upload complete! Final step:                      ║"
echo "║                                                       ║"
echo "║  Add this to Vercel environment variables:            ║"
echo "║  NEXT_PUBLIC_R2_BASE_URL = ${R2_URL}"
echo "║                                                       ║"
echo "║  Then run: git add . && git commit -m 'feat: r2 cdn'  ║"
echo "║            git push                                   ║"
echo "║  Vercel will auto-deploy from GitHub.                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
