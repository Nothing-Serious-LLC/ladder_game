#!/usr/bin/env python3
"""
Simple local development server with URL rewriting for clean URLs.
This handles routes like /signup -> signup.html for local development.
"""

import http.server
import socketserver
import socket
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

def get_lan_ip() -> str:
    """Get the LAN IP address by opening a dummy UDP socket."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            # Doesn't send packets; just used to get the chosen interface IP
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        # Fallback to hostname resolution
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"


def find_available_port(start_port: int, max_tries: int = 20) -> int:
    """Find an available port starting from start_port."""
    port = start_port
    for _ in range(max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("0.0.0.0", port))
                return port
            except OSError:
                port += 1
    return start_port


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    DEFAULT_PORT = 8001
    PORT = find_available_port(DEFAULT_PORT)

    lan_ip = get_lan_ip()

    print("🚀 Local development server starting on:")
    print(f"   Local:   http://localhost:{PORT}")
    print(f"   Network: http://{lan_ip}:{PORT}")
    print("\n📱 For mobile testing:")
    print("   1. Connect phone to the same Wi‑Fi")
    print(f"   2. Go to http://{lan_ip}:{PORT}")
    print("   3. (Optional) Add to home screen")
    print("\n📝 URL rewriting enabled:")
    print("   /signup -> /signup.html")
    print("   /home -> /home.html")
    print("   /play -> /play.html")
    print("   /pack-puzzles -> /pack-puzzles.html")
    print("   etc...")
    print("\n✨ Now your local server matches your live site's URL structure!")
    print("🔧 Press Ctrl+C to stop the server\n")

    with ReusableTCPServer(("0.0.0.0", PORT), URLRewriteHandler) as httpd:
        try:
            httpd.serve_forever()
        finally:
            httpd.server_close()