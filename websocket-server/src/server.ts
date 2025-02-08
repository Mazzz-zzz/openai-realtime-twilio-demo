import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import dotenv from "dotenv";
import http from "http";
import { readFileSync } from "fs";
import { join } from "path";
import cors from "cors";
import { VapiClient } from "@vapi-ai/server-sdk";
import {
  handleCallConnection,
  handleFrontendConnection,
} from "./sessionManager";
import functions from "./functionHandlers";

dotenv.config();

const PORT = parseInt(process.env.PORT || "8081", 10);
const PUBLIC_URL = process.env.PUBLIC_URL || "";
const VAPI_API_KEY = process.env.VAPI_API_KEY;

if (!VAPI_API_KEY) {
  throw new Error("VAPI_API_KEY environment variable is required");
}

const client = new VapiClient({ token: VAPI_API_KEY });

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const twimlPath = join(__dirname, "twiml.xml");
const twimlTemplate = readFileSync(twimlPath, "utf-8");

app.get("/public-url", (req, res) => {
  res.json({ publicUrl: PUBLIC_URL });
});

app.all("/twiml", async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    
    if (!process.env.VAPI_ASSISTANT_ID) {
      throw new Error("VAPI_ASSISTANT_ID environment variable is required");
    }

    if (!process.env.VAPI_PHONE_NUMBER_ID) {
      throw new Error("VAPI_PHONE_NUMBER_ID environment variable is required");
    }

    const createCallRequest = {
      assistantId: process.env.VAPI_ASSISTANT_ID,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: {
        number: req.body.From ? (req.body.From.startsWith('+') ? req.body.From : `+${req.body.From}`) : undefined
      }
    };

    const call = await client.calls.create(createCallRequest);
    
    if (!call.monitor?.listenUrl) {
      throw new Error("Failed to get WebSocket URL from Vapi");
    }
    
    const wsUrl = call.monitor.listenUrl;
    console.log("Using WebSocket URL:", wsUrl);
    const twimlContent = twimlTemplate.replace("{{WS_URL}}", wsUrl);
    res.type("text/xml").send(twimlContent);
  } catch (error) {
    console.error("Error creating Vapi call:", error);
    res.status(500).send("Error generating TwiML response");
  }
});

// New endpoint to list available tools (schemas)
app.get("/tools", (req, res) => {
  res.json(functions.map((f) => f.schema));
});

let currentCall: WebSocket | null = null;
let currentLogs: WebSocket | null = null;

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length < 1) {
    ws.close();
    return;
  }

  const type = parts[0];

  if (type === "call") {
    if (currentCall) currentCall.close();
    currentCall = ws;
    handleCallConnection(currentCall);
  } else if (type === "logs") {
    if (currentLogs) currentLogs.close();
    currentLogs = ws;
    handleFrontendConnection(currentLogs);
  } else {
    ws.close();
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
