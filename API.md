# TradeSage API Documentation

## Overview

TradeSage provides a comprehensive REST API for managing trading data, analytics, and journal entries. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication for local development. In production, JWT tokens will be required for all endpoints.

## Endpoints

### Trades Management

#### GET /api/trades

Retrieve all trades with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)
- `symbol` (string): Filter by symbol
- `type` (string): Filter by trade type (BUY/SELL)
- `startDate` (string): Start date filter (ISO format)
- `endDate` (string): End date filter (ISO format)
- `minProfit` (number): Minimum profit filter
- `maxProfit` (number): Maximum profit filter
- `tags` (string): Comma-separated list of tags

**Response:**
```json
{
  "trades": [
    {
      "id": "trade_123",
      "ticketId": "12345",
      "accountId": "account_456",
      "symbol": "EURUSD",
      "type": "BUY",
      "volume": 0.1,
      "openPrice": 1.0850,
      "closePrice": 1.0870,
      "openTime": "2024-01-15T10:30:00.000Z",
      "closeTime": "2024-01-15T11:45:00.000Z",
      "profit": 20.00,
      "swap": 0,
      "commission": 0,
      "stopLoss": 1.0800,
      "takeProfit": 1.0900,
      "linkedTrades": [],
      "tags": ["scalping", "news"],
      "notes": "NFP trade",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

#### POST /api/trades

Create a new trade.

**Request Body:**
```json
{
  "ticketId": "12345",
  "accountId": "account_456",
  "symbol": "EURUSD",
  "type": "BUY",
  "volume": 0.1,
  "openPrice": 1.0850,
  "closePrice": 1.0870,
  "openTime": "2024-01-15T10:30:00.000Z",
  "closeTime": "2024-01-15T11:45:00.000Z",
  "profit": 20.00,
  "swap": 0,
  "commission": 0,
  "stopLoss": 1.0800,
  "takeProfit": 1.0900,
  "tags": ["scalping", "news"],
  "notes": "NFP trade"
}
```

**Response:**
```json
{
  "success": true,
  "trade": {
    "id": "trade_123",
    "ticketId": "12345",
    // ... other fields
  }
}
```

#### PUT /api/trades/[id]

Update an existing trade.

**Request Body:** Same as POST /api/trades

**Response:**
```json
{
  "success": true,
  "trade": {
    "id": "trade_123",
    // ... updated fields
  }
}
```

#### DELETE /api/trades/[id]

Delete a trade.

**Response:**
```json
{
  "success": true,
  "message": "Trade deleted successfully"
}
```

### Import System

#### POST /api/import

Import trades from broker statements.

**Request Body:**
```json
{
  "accountId": "account_456",
  "broker": "exness",
  "fileName": "statement.html",
  "fileContent": "<html>...</html>",
  "columnMapping": {
    "ticketId": "Ticket",
    "symbol": "Symbol",
    "type": "Type",
    "volume": "Volume",
    "openPrice": "Open Price",
    "closePrice": "Close Price",
    "openTime": "Open Time",
    "closeTime": "Close Time",
    "profit": "Profit"
  }
}
```

**Supported Brokers:**
- `exness`: Exness HTML statements
- `metatrader`: MetaTrader CSV exports
- `generic-csv`: Generic CSV with column mapping

**Response:**
```json
{
  "success": true,
  "importSessionId": "import_789",
  "totalTrades": 25,
  "importedTrades": 23,
  "errors": [],
  "warnings": ["2 trades had missing stop loss values"]
}
```

### Journal Entries

#### GET /api/journal

Retrieve journal entries with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `date` (string): Filter by specific date (ISO format)
- `tags` (string): Comma-separated list of tags

**Response:**
```json
{
  "entries": [
    {
      "id": "journal_123",
      "date": "2024-01-15",
      "content": "Market analysis and trade plans...",
      "tags": ["analysis", "planning"],
      "mood": "confident",
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-01-15T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 30,
    "totalPages": 1
  }
}
```

#### POST /api/journal

Create a new journal entry.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "content": "Market analysis and trade plans...",
  "tags": ["analysis", "planning"],
  "mood": "confident"
}
```

#### PUT /api/journal/[id]

Update a journal entry.

#### DELETE /api/journal/[id]

Delete a journal entry.

### Strategy Documents

#### GET /api/strategies

Retrieve strategy documents.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `category` (string): Filter by category
- `tags` (string): Comma-separated list of tags

**Response:**
```json
{
  "strategies": [
    {
      "id": "strategy_123",
      "title": "Scalping Strategy",
      "content": "Strategy description...",
      "category": "scalping",
      "tags": ["forex", "short-term"],
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-01-15T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "totalPages": 1
  }
}
```

#### POST /api/strategies

Create a new strategy document.

**Request Body:**
```json
{
  "title": "Scalping Strategy",
  "content": "Strategy description...",
  "category": "scalping",
  "tags": ["forex", "short-term"]
}
```

#### PUT /api/strategies/[id]

Update a strategy document.

#### DELETE /api/strategies/[id]

Delete a strategy document.

### Analytics

#### GET /api/analytics/performance

Get performance analytics.

**Query Parameters:**
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)
- `symbol` (string): Filter by symbol
- `groupBy` (string): Group by period (day/week/month)

**Response:**
```json
{
  "summary": {
    "totalTrades": 150,
    "winningTrades": 95,
    "losingTrades": 55,
    "winRate": 63.33,
    "totalProfit": 1250.50,
    "totalLoss": -450.25,
    "netProfit": 800.25,
    "profitFactor": 2.78,
    "averageWin": 13.16,
    "averageLoss": -8.19,
    "largestWin": 45.00,
    "largestLoss": -25.50,
    "averageTrade": 5.34
  },
  "dailyStats": [
    {
      "date": "2024-01-15",
      "trades": 5,
      "profit": 25.50,
      "winRate": 80.0
    }
  ],
  "symbolStats": [
    {
      "symbol": "EURUSD",
      "trades": 45,
      "profit": 350.25,
      "winRate": 66.67
    }
  ]
}
```

#### GET /api/analytics/calendar

Get calendar view data.

**Query Parameters:**
- `year` (number): Year (default: current year)
- `month` (number): Month (1-12, default: current month)

**Response:**
```json
{
  "calendar": [
    {
      "date": "2024-01-15",
      "trades": 3,
      "profit": 25.50,
      "winRate": 66.67,
      "hasJournal": true
    }
  ]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently, no rate limiting is implemented for local development. Production will include rate limiting based on user authentication.

## Data Validation

All endpoints validate input data and return appropriate error messages for invalid data. Required fields are enforced, and data types are validated.

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (1-based)
- `limit`: Items per page (max 100)

Pagination metadata is included in all list responses.

## Filtering and Sorting

Most list endpoints support filtering and sorting:
- Filtering: Use query parameters to filter results
- Sorting: Use `sortBy` and `sortOrder` parameters
- Search: Use `search` parameter for text search

## File Upload

File uploads are handled through the import endpoint. Supported formats:
- HTML files (Exness statements)
- CSV files (MetaTrader exports, generic CSV)
- Maximum file size: 10MB

## WebSocket Support

Real-time updates are planned for future versions:
- Trade updates
- Live P&L tracking
- Market data integration

## SDK and Libraries

Official SDKs are planned for:
- JavaScript/TypeScript
- Python
- C#

## Support

For API support and questions:
- Documentation: [GitHub Wiki](https://github.com/tradesage/docs)
- Issues: [GitHub Issues](https://github.com/tradesage/issues)
- Email: support@tradesage.com 