# Firestore Schema Validator — Setup Complete

The extension is now validating new documents in the collections defined in your schema:

```
${param:COLLECTION_SCHEMAS}
```

**Action on invalid document:** `${param:ON_INVALID}`

**Error reports collection:** `${param:ERRORS_COLLECTION}`

## Check Validation Errors

```js
const errors = await db.collection("${param:ERRORS_COLLECTION}").orderBy("detectedAt", "desc").limit(20).get();
errors.forEach(doc => console.log(doc.data()));
```

Each error document contains:
- `documentPath` — path of the invalid document
- `collection` — collection name
- `errors` — array of validation error messages
- `documentData` — snapshot of the rejected data
- `detectedAt` — server timestamp

## Support

[GitHub repository](https://github.com/aaronat1/firestore-schema-validator)
