## Version 0.1.0

- Initial release.
- Validates documents at depths 1–5 on creation.
- Supports required fields, type checks, minLength, maxLength, minimum, maximum, pattern, enum, and additionalProperties.
- Configurable action on invalid document: delete or log.
- Optional error reporting to a dedicated Firestore collection.
