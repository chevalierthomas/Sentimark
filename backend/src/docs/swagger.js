export const swaggerDocument = {
  openapi: '3.0.1',
  info: {
    title: 'Sentimark API',
    description:
      'API documentation for the Sentimark sentiment platform. Endpoints surface company discovery, authentication, and sample sentiment feeds.',
    version: '0.2.0'
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development server'
    }
  ],
  paths: {
    '/api/companies': {
      get: {
        summary: 'Search available companies',
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Company ticker, name, exchange, sector, or country filter',
            required: false,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Filtered company list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Company'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/companies/{symbol}/news': {
      get: {
        summary: 'Retrieve sentiment news for a company',
        parameters: [
          {
            name: 'symbol',
            in: 'path',
            required: true,
            description: 'Ticker symbol to query',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Collection of news items for the requested company',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    symbol: {
                      type: 'string',
                      example: 'AAPL'
                    },
                    company: {
                      $ref: '#/components/schemas/Company'
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
          },
          404: {
            description: 'Company not found'
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
      Company: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
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
          },
          sector: {
            type: 'string',
            example: 'Technology'
          },
          industry: {
            type: 'string',
            example: 'Consumer Electronics'
          },
          country: {
            type: 'string',
            example: 'United States'
          }
        }
      },
      StockPrice: {
        type: 'object',
        properties: {
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          open_price: {
            type: 'number',
            format: 'double'
          },
          close_price: {
            type: 'number',
            format: 'double'
          },
          high_price: {
            type: 'number',
            format: 'double'
          },
          low_price: {
            type: 'number',
            format: 'double'
          },
          volume: {
            type: 'integer',
            format: 'int64'
          },
          currency: {
            type: 'string',
            example: 'USD'
          }
        }
      },
      FinancialSnapshot: {
        type: 'object',
        properties: {
          fiscal_year: {
            type: 'integer',
            example: 2023
          },
          revenue: {
            type: 'number',
            format: 'double'
          },
          net_income: {
            type: 'number',
            format: 'double'
          },
          eps: {
            type: 'number',
            format: 'double'
          },
          pe_ratio: {
            type: 'number',
            format: 'double'
          },
          dividend_yield: {
            type: 'number',
            format: 'double'
          },
          debt_to_equity: {
            type: 'number',
            format: 'double'
          },
          roe: {
            type: 'number',
            format: 'double'
          },
          free_cash_flow: {
            type: 'number',
            format: 'double'
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
