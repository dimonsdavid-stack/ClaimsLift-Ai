import http.server
import socketserver
import json
import datetime
import uuid

PORT = 8000

class ClaimLiftHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if "/api/v1/claims" in self.path:
            response = [
                {
                    "id": str(uuid.uuid4()),
                    "external_claim_id": "CLM-99238",
                    "payer": "Aetna",
                    "patient_ref": "PT-001",
                    "billed_amount": 1500.0,
                    "status": "pending_review",
                    "created_at": datetime.datetime.utcnow().isoformat()
                }
            ]
        elif "/api/v1/appeal-drafts" in self.path:
            response = [
                {
                    "id": str(uuid.uuid4()),
                    "recovery_workflow_id": str(uuid.uuid4()),
                    "payer": "BlueCross",
                    "draft_text": "We are appealing this denial based on medical necessity...",
                    "compliance_status": "pending_review",
                    "created_at": datetime.datetime.utcnow().isoformat()
                }
            ]
        elif "/api/v1/agent-runs" in self.path:
            response = [
                {
                    "id": str(uuid.uuid4()),
                    "agent_name": "RecoveryOrchestrator",
                    "status": "completed",
                    "model_cost": 0.04,
                    "created_at": datetime.datetime.utcnow().isoformat()
                }
            ]
        else:
            response = {"status": "ok", "service": "ClaimLift Test API"}
            
        self.wfile.write(json.dumps(response).encode())

with socketserver.TCPServer(("", PORT), ClaimLiftHandler) as httpd:
    print(f"Mock ClaimLift API Server running on port {PORT}")
    print("Serving endpoints: /api/v1/claims, /api/v1/appeal-drafts, /api/v1/agent-runs")
    httpd.serve_forever()
