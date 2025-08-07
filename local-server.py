#!/usr/bin/env python3
"""
Simple local development server with URL rewriting for clean URLs.
This handles routes like /signup -> signup.html for local development.
"""

import http.server
import socketserver
import os
import mimetypes
from urllib.parse import urlparse

class URLRewriteHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Handle root path
        if path == '/':
            path = '/index.html'
        
        # URL rewriting rules
        url_mappings = {
            '/signup': '/signup.html',
            '/home': '/home.html', 
            '/play': '/play.html',
            '/pack-puzzles': '/pack-puzzles.html',
            '/store': '/store.html',
            '/settings': '/settings.html',
            '/statistics': '/statistics.html',
            '/product-overview': '/product-overview.html',
            '/purchase-confirmation': '/purchase-confirmation.html',
            '/privacy-policy': '/privacy-policy.html',
            '/terms-and-conditions': '/terms-and-conditions.html',
            '/cookies-policy': '/cookies-policy.html'
        }
        
        # Apply URL rewriting
        if path in url_mappings:
            path = url_mappings[path]
            
        # Preserve query string
        if parsed_path.query:
            path += '?' + parsed_path.query
            
        # Update the path for the request
        self.path = path
        
        # Call the parent handler
        super().do_GET()

if __name__ == "__main__":
    PORT = 8001
    
    import socket
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    
    print(f"🚀 Local development server starting on:")
    print(f"   Local: http://localhost:{PORT}")
    print(f"   Network: http://{local_ip}:{PORT}")
    print(f"   Alternative: http://192.168.4.53:{PORT}")
    print("\n📱 For mobile testing:")
    print(f"   1. Connect phone to same WiFi")
    print(f"   2. Go to http://192.168.4.53:{PORT}")
    print(f"   3. Add to home screen")
    print(f"   4. Installed app will use your local server!")
    print("\n📝 URL rewriting enabled:")
    print("   /signup -> /signup.html")
    print("   /home -> /home.html") 
    print("   /play -> /play.html")
    print("   /pack-puzzles -> /pack-puzzles.html")
    print("   etc...")
    print("\n✨ Now your local server matches your live site's URL structure!")
    print("🔧 Press Ctrl+C to stop the server\n")
    
    with socketserver.TCPServer(("0.0.0.0", PORT), URLRewriteHandler) as httpd:
        httpd.serve_forever()