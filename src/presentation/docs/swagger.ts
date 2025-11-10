import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CMS Customer API',
    version: '1.0.0',
    description: 'A RESTful API for managing customer data with Clean Architecture',
    contact: {
      name: 'API Support',
      email: 'hushanid@gmail.com',
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Customers',
      description: 'Customer management endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
  components: {
    schemas: {
      Customer: {
        type: 'object',
        required: ['customerId', 'firstName', 'lastName', 'email', 'dateCreated'],
        properties: {
          customerId: {
            type: 'string',
            format: 'uuid',
            description: 'Unique customer identifier',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          firstName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            description: 'Customer first name',
            example: 'John',
          },
          lastName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            description: 'Customer last name',
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 100,
            description: 'Customer email address (unique)',
            example: 'john.doe@example.com',
          },
          phoneNumber: {
            type: 'string',
            maxLength: 20,
            nullable: true,
            description: 'Customer phone number',
            example: '+1-555-0101',
          },
          address: {
            type: 'string',
            maxLength: 200,
            nullable: true,
            description: 'Street address',
            example: '123 Main St',
          },
          city: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'City name',
            example: 'New York',
          },
          state: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'State or province',
            example: 'NY',
          },
          country: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Country name',
            example: 'USA',
          },
          dateCreated: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2024-01-10T10:30:00.000Z',
          },
        },
      },
      CreateCustomerRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email'],
        properties: {
          firstName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'John',
          },
          lastName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 100,
            example: 'john.doe@example.com',
          },
          phoneNumber: {
            type: 'string',
            maxLength: 20,
            example: '+1-555-0101',
          },
          address: {
            type: 'string',
            maxLength: 200,
            example: '123 Main St',
          },
          city: {
            type: 'string',
            maxLength: 50,
            example: 'New York',
          },
          state: {
            type: 'string',
            maxLength: 50,
            example: 'NY',
          },
          country: {
            type: 'string',
            maxLength: 50,
            example: 'USA',
          },
        },
      },
      UpdateCustomerRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          firstName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'Jane',
          },
          lastName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'Smith',
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 100,
            example: 'jane.smith@example.com',
          },
          phoneNumber: {
            type: 'string',
            maxLength: 20,
            example: '+1-555-0102',
          },
          address: {
            type: 'string',
            maxLength: 200,
            example: '456 Oak Ave',
          },
          city: {
            type: 'string',
            maxLength: 50,
            example: 'San Francisco',
          },
          state: {
            type: 'string',
            maxLength: 50,
            example: 'CA',
          },
          country: {
            type: 'string',
            maxLength: 50,
            example: 'USA',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success',
          },
          data: {
            $ref: '#/components/schemas/Customer',
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success',
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Customer',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              limit: {
                type: 'integer',
                example: 50,
              },
              offset: {
                type: 'integer',
                example: 0,
              },
              count: {
                type: 'integer',
                example: 10,
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          message: {
            type: 'string',
            example: 'Customer not found',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'body.email',
                },
                message: {
                  type: 'string',
                  example: 'Invalid email format',
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Returns the health status of the API',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-01-10T10:30:00.000Z',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/customers': {
      get: {
        tags: ['Customers'],
        summary: 'Get all customers',
        description: 'Retrieve a paginated list of customers',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Number of customers to return (1-100)',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 50,
            },
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Number of customers to skip',
            required: false,
            schema: {
              type: 'integer',
              minimum: 0,
              default: 0,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PaginatedResponse',
                },
              },
            },
          },
          '400': {
            description: 'Invalid parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Customers'],
        summary: 'Create a new customer',
        description: 'Create a new customer with the provided information',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateCustomerRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Customer created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Email already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'Get customer by ID',
        description: 'Retrieve a single customer by their unique ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'Customer UUID',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Invalid UUID format',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Customers'],
        summary: 'Update customer',
        description: 'Update an existing customer with partial data',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'Customer UUID',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateCustomerRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Customer updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Email already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Customers'],
        summary: 'Delete customer',
        description: 'Delete a customer by their unique ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'Customer UUID',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '204': {
            description: 'Customer deleted successfully',
          },
          '400': {
            description: 'Invalid UUID format',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [], // We're using the definition directly
};

export const swaggerSpec = swaggerJsdoc(options);