export const swaggerDocument = {
  openapi: '3.0.1',
  info: {
    title: 'Sentimark API',
    description:
      'API documentation for the Sentimark market sentiment platform. Replace the demo data with live providers as integrations evolve.',
    version: '0.1.0'
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development server'
    }
  ],
  paths: {
    '/api/markets': {
      get: {
        summary: 'Search available markets',
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Market symbol, company name, or exchange filter',
            required: false,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Filtered market list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Market'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/markets/{symbol}/news': {
      get: {
        summary: 'Retrieve sentiment news for a market',
        parameters: [
          {
            name: 'symbol',
            in: 'path',
            required: true,
            description: 'Market symbol to query',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Collection of news items for the requested symbol',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    symbol: {
                      type: 'string',
                      example: 'AAPL'
                    },
                    market: {
                      $ref: '#/components/schemas/Market'
                    },
                    items: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/NewsItem'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  password: {
                    type: 'string',
                    format: 'password'
                  }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentication token payload',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User'
                    },
                    tokens: {
                      type: 'object',
                      properties: {
                        accessToken: {
                          type: 'string'
                        },
                        refreshToken: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Invalid credentials'
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Market: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            example: 'AAPL'
          },
          name: {
            type: 'string',
            example: 'Apple Inc.'
          },
          exchange: {
            type: 'string',
            example: 'NASDAQ'
          }
        }
      },
      NewsItem: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          },
          headline: {
            type: 'string'
          },
          summary: {
            type: 'string'
          },
          source: {
            type: 'string'
          },
          url: {
            type: 'string',
            format: 'uri'
          },
          publishedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          name: {
            type: 'string'
          },
          roles: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
    }
  }
};
