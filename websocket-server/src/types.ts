import { WebSocket } from "ws";

export interface Session {
  twilioConn?: WebSocket;
  frontendConn?: WebSocket;
  config?: any;
  streamSid?: string;
}

export interface FunctionCallItem {
  name: string;
  arguments: string;
  call_id?: string;
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: any[];
  format?: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface FunctionSchema {
  name: string;
  type: "function";
  description?: string;
  parameters: {
    type: string;
    properties: Record<string, JSONSchemaProperty>;
    required?: string[];
  };
}

export interface FunctionHandler {
  schema: FunctionSchema;
  handler: (args: any) => Promise<string>;
}
