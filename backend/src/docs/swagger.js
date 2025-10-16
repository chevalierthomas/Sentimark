export const swaggerDocument = {
  openapi: '3.0.1',
  info: {
    title: 'Sentimark API',
    description:
      'API documentation for the Sentimark sentiment platform. Endpoints surface company discovery, authentication, and sample sentiment feeds.',
    version: '0.3.1'
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
    '/api/companies/{companyId}': {
      get: {
        summary: 'Retrieve a detailed company snapshot',
        security: [{
          bearerAuth: []
        }],
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            description:
              'Numeric company identifier returned by the search endpoint. Required to disambiguate tickers reused across exchanges.',
            schema: {
              type: 'integer',
              minimum: 1,
              example: 1
            }
          }
        ],
        responses: {
          200: {
            description: 'Snapshot of the requested company including market data and recent news',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    company: {
                      $ref: '#/components/schemas/Company'
                    },
                    latestPrice: {
                      $ref: '#/components/schemas/StockPrice'
                    },
                    priceHistory: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/StockPrice'
                      }
                    },
                    financials: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/FinancialSnapshot'
                      }
                    },
                    news: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/NewsItem'
                      }
                    },
                    indices: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/IndexMembership'
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid company identifier'
          },
          401: {
            description: 'Authentication required'
          },
          404: {
            description: 'Company not found'
          }
        }
      }
    },
    '/api/companies/{companyId}/news': {
      get: {
        summary: 'Retrieve sentiment news for a company',
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            description:
              'Numeric company identifier returned by the search endpoint. Required to disambiguate tickers reused across exchanges.',
            schema: {
              type: 'integer',
              minimum: 1,
              example: 1
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
          400: {
            description: 'Invalid company identifier'
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
          },
          website: {
            type: 'string',
            format: 'uri',
            example: 'https://www.apple.com'
          },
          foundedYear: {
            type: 'integer',
            example: 1976
          },
          employees: {
            type: 'integer',
            example: 160000
          },
          marketCap: {
            type: 'number',
            format: 'double',
            example: 2800000000000
          },
          listing: {
            type: 'string',
            example: 'AAPL@NASDAQ',
            description: 'Upper-cased ticker and exchange pairing used to disambiguate duplicate tickers'
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
          open: {
            type: 'number',
            format: 'double'
          },
          close: {
            type: 'number',
            format: 'double'
          },
          high: {
            type: 'number',
            format: 'double'
          },
          low: {
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
          fiscalYear: {
            type: 'integer',
            example: 2023
          },
          revenue: {
            type: 'number',
            format: 'double'
          },
          netIncome: {
            type: 'number',
            format: 'double'
          },
          eps: {
            type: 'number',
            format: 'double'
          },
          peRatio: {
            type: 'number',
            format: 'double'
          },
          dividendYield: {
            type: 'number',
            format: 'double'
          },
          debtToEquity: {
            type: 'number',
            format: 'double'
          },
          roe: {
            type: 'number',
            format: 'double'
          },
          freeCashFlow: {
            type: 'number',
            format: 'double'
          }
        }
      },
      NewsItem: {
        type: 'object',
        properties: {
          id: {
            oneOf: [
              { type: 'integer' },
              { type: 'string' }
            ]
          },
          source: {
            type: 'string'
          },
          title: {
            type: 'string'
          },
          content: {
            type: 'string'
          },
          url: {
            type: 'string',
            format: 'uri'
          },
          publishedAt: {
            type: 'string',
            format: 'date-time'
          },
          sentiment: {
            type: 'number',
            format: 'double',
            example: 0.32
          }
        }
      },
      IndexMembership: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string',
            example: 'S&P 500'
          },
          country: {
            type: 'string',
            example: 'United States'
          },
          currency: {
            type: 'string',
            example: 'USD'
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
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};
