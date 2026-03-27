"""
Overclaw signal agent — minimal HTTP server.
Exposes POST /analyze for the Next.js web app to call.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

# Make sure the overclaw project root is on the path
sys.path.insert(0, os.path.dirname(__file__))

from agents.signal_agent import run

PORT = int(os.environ.get("OVERCLAW_PORT", "8001"))


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):  # noqa: A002
        print(f"[overclaw] {self.address_string()} - {format % args}")

    def do_POST(self):
        if self.path != "/analyze":
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)

        try:
            input_data = json.loads(body)
            result = run(input_data)
            payload = json.dumps(result).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(payload)
        except Exception as exc:
            print(f"[overclaw] error: {exc}")
            error = json.dumps({"error": str(exc)}).encode()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(error)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


if __name__ == "__main__":
    server = HTTPServer(("localhost", PORT), Handler)
    server.allow_reuse_address = True
    print(f"[overclaw] listening on http://localhost:{PORT}")
    server.serve_forever()
