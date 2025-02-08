export const toolTemplates = [
  {
    name: "get_weather",
    type: "function",
    description: "Get the current weather",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string" },
      },
    },
  },
  {
    name: "ping_no_args",
    type: "function",
    description: "A simple ping tool with no arguments",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_user_nested_args",
    type: "function",
    description: "Fetch user profile by nested identifier",
    parameters: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            metadata: {
              type: "object",
              properties: {
                region: { type: "string" },
                role: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  {
    name: "calculate_route_more_properties",
    type: "function",
    description: "Calculate travel route with multiple parameters",
    parameters: {
      type: "object",
      properties: {
        start: { type: "string" },
        end: { type: "string" },
        mode: { type: "string", enum: ["car", "bike", "walk"] },
        options: {
          type: "object",
          properties: {
            avoid_highways: { type: "boolean" },
            scenic_route: { type: "boolean" },
          },
        },
      },
    },
  },
  {
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
            name: { 
              type: "string",
              description: "Full name of the customer"
            },
            email: { 
              type: "string",
              format: "email",
              description: "Email address for confirmation"
            },
            phone: { 
              type: "string",
              description: "Contact phone number"
            }
          },
          required: ["name", "email"]
        },
        notes: {
          type: "string",
          description: "Any additional notes or special requests"
        }
      },
      required: ["service", "datetime", "duration", "customer"]
    }
  }
];
