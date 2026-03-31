# Firestore Schema Validator

This extension validates every newly created Firestore document against a JSON Schema you define. Invalid documents can be automatically deleted or simply logged, keeping your database clean and consistent.

## How It Works

1. When a document is created, the extension checks it against the schema defined for that collection.
2. If validation passes, nothing changes.
3. If validation fails:
   - An error report is written to `_ext_validation_errors` (configurable).
   - The document is deleted (if `ON_INVALID=delete`) or kept with a log warning.

## Prerequisites

- Firebase project with Firestore enabled.

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `LOCATION` | Cloud Functions region | `us-central1` |
| `COLLECTION_SCHEMAS` | JSON object with schemas per collection | `{}` |
| `ERRORS_COLLECTION` | Collection for error reports | `_ext_validation_errors` |
| `ON_INVALID` | Action on failure: `delete` or `log` | `delete` |

## Schema Format

```json
{
  "users": {
    "required": ["email", "name"],
    "properties": {
      "email": { "type": "string", "pattern": "^[^@]+@[^@]+$" },
      "name":  { "type": "string", "minLength": 1 },
      "age":   { "type": "number", "minimum": 0, "maximum": 150 },
      "role":  { "type": "string", "enum": ["admin", "user", "guest"] }
    }
  }
}
```

Supported validations: `required`, `type`, `minLength`, `maxLength`, `minimum`, `maximum`, `pattern`, `enum`, `additionalProperties`.

## Billing

This extension uses Cloud Functions for Firebase. See [Firebase Pricing](https://firebase.google.com/pricing) for details.
