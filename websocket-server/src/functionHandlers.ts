import { FunctionHandler } from "./types";

interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  description?: string;
  enum?: any[];
  format?: string;
}

const functions: FunctionHandler[] = [];

functions.push({
  schema: {
    name: "get_weather_from_coords",
    type: "function",
    description: "Get the current weather",
    parameters: {
      type: "object",
      properties: {
        latitude: {
          type: "number",
        },
        longitude: {
          type: "number",
        },
      },
      required: ["latitude", "longitude"],
    },
  },
  handler: async (args: { latitude: number; longitude: number }) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
    );
    const data = await response.json();
    const currentTemp = data.current?.temperature_2m;
    return JSON.stringify({ temp: currentTemp });
  },
});

functions.push({
  schema: {
    name: "book_appointment",
    type: "function",
    description: "Book an appointment in the calendar",
    parameters: {
      type: "object",
      properties: {
        service: {
          type: "string",
          enum: ["consultation", "follow_up", "general_appointment"],
          description: "Type of service requested"
        },
        datetime: {
          type: "string",
          format: "date-time",
          description: "Requested date and time for the appointment (ISO 8601 format)"
        },
        duration: {
          type: "integer",
          enum: [30, 60],
          description: "Duration of appointment in minutes"
        },
        customer: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" }
          },
          required: ["name", "email"]
        },
        notes: {
          type: "string"
        }
      },
      required: ["service", "datetime", "duration", "customer"]
    }
  } as const,
  handler: async (args: {
    service: string;
    datetime: string;
    duration: number;
    customer: {
      name: string;
      email: string;
      phone?: string;
    };
    notes?: string;
  }) => {
    // Mock response - in reality, this would interact with Google Calendar API
    const appointmentId = Math.random().toString(36).substring(7);
    const response = {
      success: true,
      appointmentId,
      confirmed: {
        service: args.service,
        datetime: args.datetime,
        duration: args.duration,
        customer: args.customer,
        notes: args.notes
      },
      calendarLink: `https://calendar.google.com/calendar/event?eid=${appointmentId}`,
      message: `Appointment successfully booked for ${args.customer.name} on ${new Date(args.datetime).toLocaleString()}`
    };
    
    return JSON.stringify(response);
  }
});

type AvailabilityResponse = {
  available_slots: Array<{
    start_time: string;  // ISO 8601 datetime
    end_time: string;    // ISO 8601 datetime
    duration: number;    // in minutes
  }>;
  timezone: string;
}

export default functions;
