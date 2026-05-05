import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PricesImproved API",
      version: "1.0.0",
      description:
        "API for tracking grocery prices, managing grocery lists, and analyzing price history.",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description:
            "Session cookie set after login. Swagger UI cannot auto-set cookies from login responses — use the browser or a tool like curl/Postman to log in first.",
        },
      },
      schemas: {
        PublicUser: {
          type: "object",
          properties: {
            id: { type: "string", example: "abc123" },
            email: { type: "string", example: "user@example.com" },
            name: { type: "string", example: "Jane Doe" },
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "user",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T12:00:00.000Z",
            },
          },
        },
        GroceryList: {
          type: "object",
          properties: {
            id: { type: "string", example: "list001" },
            name: { type: "string", example: "Weekly groceries" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T12:00:00.000Z",
            },
          },
        },
        GroceryItem: {
          type: "object",
          properties: {
            id: { type: "string", example: "item001" },
            listId: { type: "string", example: "list001" },
            name: { type: "string", example: "Milk" },
            category: {
              type: "string",
              enum: [
                "produce",
                "dairy",
                "bakery",
                "frozen",
                "household",
                "other",
              ],
              example: "dairy",
            },
            bought: { type: "boolean", example: false },
            price: {
              type: "number",
              nullable: true,
              example: 1.99,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T12:00:00.000Z",
            },
          },
        },
        BoughtList: {
          type: "object",
          properties: {
            id: { type: "string", example: "bl001" },
            name: { type: "string", example: "Weekly groceries - 2025-01-01" },
            location: {
              type: "string",
              nullable: true,
              example: "Tesco",
            },
            groceryListId: { type: "string", example: "list001" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T12:00:00.000Z",
            },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/BoughtItem" },
            },
          },
        },
        BoughtItem: {
          type: "object",
          properties: {
            id: { type: "string", example: "bi001" },
            boughtListId: { type: "string", example: "bl001" },
            name: { type: "string", example: "Milk" },
            category: {
              type: "string",
              enum: [
                "produce",
                "dairy",
                "bakery",
                "frozen",
                "household",
                "other",
              ],
              example: "dairy",
            },
            price: {
              type: "number",
              nullable: true,
              example: 1.99,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T12:00:00.000Z",
            },
          },
        },
        PricePoint: {
          type: "object",
          properties: {
            name: { type: "string", example: "Milk" },
            price: { type: "number", example: 1.99 },
            date: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T12:00:00.000Z",
            },
            location: {
              type: "string",
              nullable: true,
              example: "Tesco",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            name: { type: "string", example: "Milk" },
            category: { type: "string", example: "dairy" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Description of the error",
            },
          },
        },
      },
    },
    paths: {
      // ── Auth ──
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Log in",
          description: "Creates a session cookie on success.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "user@example.com",
                    },
                    password: {
                      type: "string",
                      format: "password",
                      example: "password123",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/PublicUser" },
                    },
                  },
                },
              },
            },
            400: { description: "Missing email or password" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Log out",
          description: "Destroys the session cookie.",
          responses: {
            204: { description: "Logged out" },
            500: { description: "Failed to sign out" },
          },
        },
      },
      // ── Health ──
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: {
              description: "Server is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { ok: { type: "boolean", example: true } },
                  },
                },
              },
            },
          },
        },
      },
      // ── Users ──
      "/api/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Current user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/PublicUser" },
                    },
                  },
                },
              },
            },
            401: { description: "Not authenticated" },
          },
        },
        patch: {
          tags: ["Users"],
          summary: "Update current user name",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: {
                      type: "string",
                      example: "Jane Doe",
                      maxLength: 200,
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/PublicUser" },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid name" },
            401: { description: "Not authenticated" },
          },
        },
      },
      // ── Admin Users ──
      "/api/admin/users": {
        get: {
          tags: ["Admin"],
          summary: "List all users (admin only)",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "List of all users",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      users: {
                        type: "array",
                        items: { $ref: "#/components/schemas/PublicUser" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Not authenticated" },
            403: { description: "Not an admin" },
          },
        },
      },
      "/api/admin/users/{userId}": {
        get: {
          tags: ["Admin"],
          summary: "Get a user by ID (admin only)",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "abc123",
            },
          ],
          responses: {
            200: {
              description: "User details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/PublicUser" },
                    },
                  },
                },
              },
            },
            401: { description: "Not authenticated" },
            403: { description: "Not an admin" },
            404: { description: "User not found" },
          },
        },
        patch: {
          tags: ["Admin"],
          summary: "Update a user's name or role (admin only)",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "abc123",
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      example: "New Name",
                      maxLength: 200,
                    },
                    role: {
                      type: "string",
                      enum: ["user", "admin"],
                      example: "admin",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/PublicUser" },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid input" },
            401: { description: "Not authenticated" },
            403: { description: "Not an admin" },
            404: { description: "User not found" },
          },
        },
      },
      // ── Grocery Lists ──
      "/api/grocery-lists": {
        get: {
          tags: ["Grocery Lists"],
          summary: "List grocery lists",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "User's grocery lists",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      lists: {
                        type: "array",
                        items: { $ref: "#/components/schemas/GroceryList" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Not authenticated" },
          },
        },
        post: {
          tags: ["Grocery Lists"],
          summary: "Create a grocery list",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: {
                      type: "string",
                      example: "Weekly groceries",
                      maxLength: 200,
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Created list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      list: { $ref: "#/components/schemas/GroceryList" },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid name" },
            401: { description: "Not authenticated" },
          },
        },
      },
      "/api/grocery-lists/{listId}": {
        get: {
          tags: ["Grocery Lists"],
          summary: "Get a grocery list by ID",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "listId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Grocery list details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      list: { $ref: "#/components/schemas/GroceryList" },
                    },
                  },
                },
              },
            },
            401: { description: "Not authenticated" },
            404: { description: "List not found" },
          },
        },
        delete: {
          tags: ["Grocery Lists"],
          summary: "Delete a grocery list",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "listId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            204: { description: "Deleted" },
            401: { description: "Not authenticated" },
            404: { description: "List not found" },
          },
        },
      },
      "/api/grocery-lists/{listId}/items": {
        get: {
          tags: ["Grocery Items"],
          summary: "List items in a grocery list",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "listId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Items in the list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      items: {
                        type: "array",
                        items: { $ref: "#/components/schemas/GroceryItem" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Not authenticated" },
            404: { description: "List not found" },
          },
        },
        post: {
          tags: ["Grocery Items"],
          summary: "Add an item to a grocery list",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "listId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "category"],
                  properties: {
                    name: {
                      type: "string",
                      example: "Milk",
                      maxLength: 100,
                      pattern: "^[A-Za-z0-9]+$",
                    },
                    category: {
                      type: "string",
                      enum: [
                        "produce",
                        "dairy",
                        "bakery",
                        "frozen",
                        "household",
                        "other",
                      ],
                      example: "dairy",
                    },
                    price: {
                      type: "number",
                      minimum: 0,
                      maximum: 10000000,
                      example: 1.99,
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Created item",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      item: {
                        $ref: "#/components/schemas/GroceryItem",
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid input" },
            401: { description: "Not authenticated" },
            404: { description: "List not found" },
          },
        },
      },
      "/api/grocery-lists/{listId}/items/{itemId}": {
        patch: {
          tags: ["Grocery Items"],
          summary: "Update a grocery item",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "listId", in: "path", required: true, schema: { type: "string" } },
            { name: "itemId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    bought: { type: "boolean", example: true },
                    name: {
                      type: "string",
                      example: "Whole Milk",
                      maxLength: 100,
                      pattern: "^[A-Za-z0-9]+$",
                    },
                    category: {
                      type: "string",
                      enum: [
                        "produce",
                        "dairy",
                        "bakery",
                        "frozen",
                        "household",
                        "other",
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated item",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      item: {
                        $ref: "#/components/schemas/GroceryItem",
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid input" },
            401: { description: "Not authenticated" },
            404: { description: "List or item not found" },
          },
        },
        delete: {
          tags: ["Grocery Items"],
          summary: "Delete a grocery item",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "listId", in: "path", required: true, schema: { type: "string" } },
            { name: "itemId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            204: { description: "Deleted" },
            401: { description: "Not authenticated" },
            404: { description: "List or item not found" },
          },
        },
      },
      "/api/grocery-lists/{listId}/end-grocery": {
        post: {
          tags: ["Grocery Lists"],
          summary: "Convert bought items into a bought list (end grocery session)",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "listId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    location: {
                      type: "string",
                      example: "Tesco",
                      maxLength: 200,
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Bought list created from bought items",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      boughtList: { $ref: "#/components/schemas/BoughtList" },
                    },
                  },
                },
              },
            },
            400: { description: "No bought items or invalid location" },
            401: { description: "Not authenticated" },
            404: { description: "List not found" },
          },
        },
      },
      // ── Bought Lists ──
      "/api/bought-lists": {
        get: {
          tags: ["Bought Lists"],
          summary: "List all bought lists",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "User's bought lists",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      boughtLists: {
                        type: "array",
                        items: { $ref: "#/components/schemas/BoughtList" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Not authenticated" },
          },
        },
      },
      "/api/bought-lists/{boughtListId}": {
        get: {
          tags: ["Bought Lists"],
          summary: "Get a bought list by ID",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "boughtListId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Bought list details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      boughtList: { $ref: "#/components/schemas/BoughtList" },
                    },
                  },
                },
              },
            },
            401: { description: "Not authenticated" },
            404: { description: "Bought list not found" },
          },
        },
        patch: {
          tags: ["Bought Lists"],
          summary: "Update a bought list location",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "boughtListId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    location: {
                      type: "string",
                      example: "Tesco",
                      maxLength: 200,
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated bought list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      boughtList: { $ref: "#/components/schemas/BoughtList" },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid location" },
            401: { description: "Not authenticated" },
            404: { description: "Bought list not found" },
          },
        },
        delete: {
          tags: ["Bought Lists"],
          summary: "Delete a bought list",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "boughtListId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            204: { description: "Deleted" },
            401: { description: "Not authenticated" },
            404: { description: "Bought list not found" },
          },
        },
      },
      "/api/bought-lists/{boughtListId}/items/{itemId}": {
        patch: {
          tags: ["Bought Items"],
          summary: "Update a bought item (price or category)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "boughtListId", in: "path", required: true, schema: { type: "string" } },
            { name: "itemId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    price: {
                      type: "number",
                      minimum: 0,
                      example: 2.49,
                      nullable: true,
                    },
                    category: {
                      type: "string",
                      enum: [
                        "produce",
                        "dairy",
                        "bakery",
                        "frozen",
                        "household",
                        "other",
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated item",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      item: { $ref: "#/components/schemas/BoughtItem" },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid input" },
            401: { description: "Not authenticated" },
            404: { description: "Bought list or item not found" },
          },
        },
      },
      // ── Price History ──
      "/api/price-history/products": {
        get: {
          tags: ["Price History"],
          summary: "List distinct product names with categories",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "List of unique products",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Not authenticated" },
          },
        },
      },
      "/api/price-history": {
        get: {
          tags: ["Price History"],
          summary: "Query price history points",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "product",
              in: "query",
              schema: { type: "string" },
              description: "Filter by product name (case-insensitive exact match)",
              example: "Milk",
            },
            {
              name: "category",
              in: "query",
              schema: {
                type: "string",
                enum: [
                  "produce",
                  "dairy",
                  "bakery",
                  "frozen",
                  "household",
                  "other",
                ],
              },
              description: "Filter by category",
            },
            {
              name: "from",
              in: "query",
              schema: { type: "string", format: "date" },
              description: "Start date (ISO format)",
              example: "2025-01-01",
            },
            {
              name: "to",
              in: "query",
              schema: { type: "string", format: "date" },
              description: "End date (ISO format)",
              example: "2025-12-31",
            },
          ],
          responses: {
            200: {
              description: "Price history points",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      points: {
                        type: "array",
                        items: { $ref: "#/components/schemas/PricePoint" },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Missing product or category, or invalid input" },
            401: { description: "Not authenticated" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Login and logout" },
      { name: "Health", description: "Server health check" },
      { name: "Users", description: "Current user profile" },
      { name: "Admin", description: "Admin-only user management" },
      { name: "Grocery Lists", description: "Create and manage grocery lists" },
      { name: "Grocery Items", description: "Items within grocery lists" },
      { name: "Bought Lists", description: "Completed shopping sessions" },
      { name: "Bought Items", description: "Items within bought lists" },
      { name: "Price History", description: "Query historical price data" },
    ],
  },
  apis: [], // Not using file-based JSDoc — spec is defined inline above
};

export const swaggerSpec = swaggerJsdoc(options);
