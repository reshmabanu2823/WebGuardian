export class WebTraceSocketManager {
  requestId: string;
  onMessage: (payload: any) => void;
  onError: (error: any) => void;
  ws: WebSocket | null;
  isConnecting: boolean;

  constructor(requestId: string, onMessageCallback: (payload: any) => void, onErrorCallback: (error: any) => void) {
    this.requestId = requestId;
    this.onMessage = onMessageCallback;
    this.onError = onErrorCallback;
    this.ws = null;
    this.isConnecting = false;
  }

  connect() {
    if (this.ws || this.isConnecting) return;

    this.isConnecting = true;
    const wsUrl = `ws://localhost:8000/api/v1/track/${this.requestId}`;
    
    console.log(`[WebTrace WS] Connecting to ${wsUrl}...`);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log(`[WebTrace WS] Connected to tracking channel for request: ${this.requestId}`);
      this.isConnecting = false;
    };

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (this.onMessage) this.onMessage(payload);
      } catch (err) {
        console.error('[WebTrace WS] Error parsing message payload:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.error('[WebTrace WS] WebSocket error:', err);
      this.isConnecting = false;
      if (this.onError) this.onError(err);
    };

    this.ws.onclose = () => {
      console.log(`[WebTrace WS] Connection closed for request: ${this.requestId}`);
      this.ws = null;
      this.isConnecting = false;
    };
  }

  sendLocation(role: 'victim' | 'responder', latitude: number, longitude: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = {
        role,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn('[WebTrace WS] Socket not ready to send location.');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
