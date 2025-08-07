#!/bin/bash
# Quick PWA testing script

echo "🚀 Starting quick PWA test server..."
echo "📱 Testing at: http://localhost:8000"
echo "🔧 Press Ctrl+C to stop"
echo ""
echo "💡 Quick DevTools shortcuts:"
echo "   - Cmd+Shift+I (DevTools)"
echo "   - Application tab → Service Workers"
echo "   - Application tab → Manifest"
echo ""

cd "$(dirname "$0")"
python3 local-server.py