#!/usr/bin/env python3
"""
Enhanced local development server with PWA testing features.
Includes HTTPS support, proper headers, and service worker debugging.
"""

import http.server
import socketserver
import os
import ssl
import mimetypes
from urllib.parse import urlparse

class PWATestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers for PWA testing
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        # Service Worker requires HTTPS or localhost
        if self.path.endswith('sw.js'):
            self.send_header('Service-Worker-Allowed', '/')
            
        # Manifest headers
        if self.path.endswith('manifest.json'):
            self.send_header('Content-Type', 'application/manifest+json')
            
        super().end_headers()

    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Handle root path
        if path == '/':
            path = '/index.html'
        
        # URL rewriting rules (same as your existing server)
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

def create_self_signed_cert():
    """Create a self-signed certificate for HTTPS testing"""
    try:
        import ssl
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        import datetime
        
        # Generate private key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        
        # Create certificate
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
        ])
        
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.utcnow()
        ).not_valid_after(
            datetime.datetime.utcnow() + datetime.timedelta(days=30)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName(u"localhost"),
                x509.IPAddress(ipaddress.IPv4Address(u"127.0.0.1")),
            ]),
            critical=False,
        ).sign(private_key, hashes.SHA256())
        
        # Write certificate and key
        with open("server.crt", "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        with open("server.key", "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        return True
    except ImportError:
        return False

if __name__ == "__main__":
    PORT = 8000
    HTTPS_PORT = 8443
    
    print("🚀 PWA Development Server")
    print("=" * 50)
    
    # Start HTTP server
    print(f"📝 HTTP Server: http://localhost:{PORT}")
    print("   - Basic testing")
    print("   - URL rewriting enabled")
    
    # Try to start HTTPS server for full PWA testing
    https_available = False
    if os.path.exists("server.crt") and os.path.exists("server.key"):
        https_available = True
    elif create_self_signed_cert():
        https_available = True
        print("🔐 Created self-signed certificate for HTTPS testing")
    
    if https_available:
        print(f"🔒 HTTPS Server: https://localhost:{HTTPS_PORT}")
        print("   - Full PWA testing (Service Workers, Install prompt)")
        print("   - Accept the security warning in your browser")
    
    print("\n💡 Quick PWA Testing Tips:")
    print("   1. Open Chrome DevTools → Application tab")
    print("   2. Check 'Service Workers' section")
    print("   3. Check 'Manifest' section")
    print("   4. Use 'Storage' to clear cache between tests")
    print("\n🔧 Press Ctrl+C to stop the server\n")
    
    try:
        # Start HTTP server in a thread
        import threading
        
        httpd = socketserver.TCPServer(("", PORT), PWATestHandler)
        http_thread = threading.Thread(target=httpd.serve_forever)
        http_thread.daemon = True
        http_thread.start()
        
        # Start HTTPS server if available
        if https_available:
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain("server.crt", "server.key")
            
            httpsd = socketserver.TCPServer(("", HTTPS_PORT), PWATestHandler)
            httpsd.socket = context.wrap_socket(httpsd.socket, server_side=True)
            httpsd.serve_forever()
        else:
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n👋 Server stopped!")
        if 'httpd' in locals():
            httpd.shutdown()
        if 'httpsd' in locals():
            httpsd.shutdown()