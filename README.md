# Firestore Schema Validator - Firebase Extension

> Validates Firestore documents against a JSON Schema you define. Invalid documents are automatically deleted or logged, keeping your database clean and preventing corrupt data.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Firebase Extension](https://img.shields.io/badge/Firebase-Extension-FFCA28?logo=firebase)](https://firebase.google.com/products/extensions)

## Why Use This Extension?

Firestore has no built-in schema enforcement. Any client can write any field with any type, leading to corrupt data, runtime crashes, and difficult debugging. This extension enforces data quality at the database level — no client-side changes required.

- **Schema enforcement** — define required fields, types, constraints per collection
- **Automatic cleanup** — invalid documents are deleted or logged (configurable)
- **Error reporting** — validation failures are stored in a dedicated collection
- **No dependencies** — built-in validator, no external libraries needed
- **Flexible** — only validates collections with a defined schema; ignores the rest

## Supported Validations

| Rule | Example | Description |
|------|---------|-------------|
| `required` | `["email", "name"]` | Fields that must exist |
| `type` | `"string"`, `"number"`, `"boolean"`, `"array"` | Field data type |
| `minLength` / `maxLength` | `1` / `255` | String length constraints |
| `minimum` / `maximum` | `0` / `150` | Number range constraints |
| `pattern` | `"^[^@]+@[^@]+$"` | Regex pattern for strings |
| `enum` | `["admin", "user", "guest"]` | Allowed values whitelist |
| `additionalProperties` | `false` | Reject unknown fields |

## Installation

### Option 1: Firebase CLI

```
firebase ext:install aaronat1/firestore-schema-validator --project=YOUR_PROJECT_ID
```

### Option 2: From Source

```bash
git clone https://github.com/aaronat1/validator_extension_firebase.git
cd validator_extension_firebase
firebase ext:install . --project=YOUR_PROJECT_ID
```

## Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `LOCATION` | Cloud Functions deployment region | `us-central1` |
| `COLLECTION_SCHEMAS` | JSON object mapping collections to schemas | `{}` |
| `ERRORS_COLLECTION` | Collection for validation error reports | `_ext_validation_errors` |
| `ON_INVALID` | Action on failure: `delete` or `log` | `delete` |

## Schema Definition Example

```json
{
  "users": {
    "required": ["email", "name"],
    "properties": {
      "email": { "type": "string", "pattern": "^[^@]+@[^@]+$" },
      "name":  { "type": "string", "minLength": 1, "maxLength": 100 },
      "age":   { "type": "number", "minimum": 0, "maximum": 150 },
      "role":  { "type": "string", "enum": ["admin", "user", "guest"] }
    },
    "additionalProperties": false
  },
  "products": {
    "required": ["title", "price"],
    "properties": {
      "title": { "type": "string", "minLength": 1 },
      "price": { "type": "number", "minimum": 0 }
    }
  }
}
```

## How It Works

```
1. Client writes document:  users/alice  { name: "Alice" }
2. Extension validates:     FAIL - missing required field "email"
3. Action (ON_INVALID=delete):
   a. Error report written to _ext_validation_errors/auto-id
   b. Document deleted from users/alice
```

## Error Report Format

Each validation failure creates a document in `_ext_validation_errors`:

```json
{
  "documentPath": "users/alice",
  "collection": "users",
  "errors": ["Missing required field: \"email\""],
  "documentData": { "name": "Alice" },
  "detectedAt": "2025-01-15T10:30:00.000Z"
}
```

## Tech Stack

- **Runtime:** Node.js 20
- **Language:** TypeScript
- **Trigger:** Firestore `onCreate` (depths 1-5)
- **Dependencies:** `firebase-admin`, `firebase-functions`

## Billing

Blaze plan required. Each document creation triggers one validation function. Invalid documents with `ON_INVALID=delete` trigger an additional delete operation. See [Firebase Pricing](https://firebase.google.com/pricing).

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.

## Author

**[@aaronat1](https://github.com/aaronat1)**
