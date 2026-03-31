import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

const COLLECTION_SCHEMAS_RAW = process.env.COLLECTION_SCHEMAS ?? "{}";
const ERRORS_COLLECTION = process.env.ERRORS_COLLECTION ?? "_ext_validation_errors";
const ON_INVALID = process.env.ON_INVALID ?? "delete";

// Simple JSON Schema validator (subset: required, properties with type checks)
interface JsonSchema {
  required?: string[];
  properties?: Record<string, { type?: string; minLength?: number; maxLength?: number; minimum?: number; maximum?: number; pattern?: string; enum?: unknown[] }>;
  additionalProperties?: boolean;
}

function validateAgainstSchema(data: Record<string, unknown>, schema: JsonSchema): string[] {
  const errors: string[] = [];

  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push(`Missing required field: "${field}"`);
      }
    }
  }

  if (schema.properties) {
    for (const [field, rules] of Object.entries(schema.properties)) {
      const value = data[field];
      if (value === undefined || value === null) continue;

      if (rules.type) {
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== rules.type) {
          errors.push(`Field "${field}" expected type "${rules.type}" but got "${actualType}"`);
        }
      }
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`Field "${field}" must be one of: ${rules.enum.join(", ")}`);
      }
      if (typeof value === "string") {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors.push(`Field "${field}" must have at least ${rules.minLength} characters`);
        }
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors.push(`Field "${field}" must have at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
          errors.push(`Field "${field}" does not match pattern "${rules.pattern}"`);
        }
      }
      if (typeof value === "number") {
        if (rules.minimum !== undefined && value < rules.minimum) {
          errors.push(`Field "${field}" must be >= ${rules.minimum}`);
        }
        if (rules.maximum !== undefined && value > rules.maximum) {
          errors.push(`Field "${field}" must be <= ${rules.maximum}`);
        }
      }
    }
  }

  if (schema.additionalProperties === false && schema.properties) {
    const allowedFields = Object.keys(schema.properties);
    for (const field of Object.keys(data)) {
      if (!allowedFields.includes(field)) {
        errors.push(`Field "${field}" is not allowed (additionalProperties: false)`);
      }
    }
  }

  return errors;
}

async function handleCreate(
  snapshot: functions.firestore.QueryDocumentSnapshot
): Promise<null> {
  const refPath = snapshot.ref.path;
  const topCollection = refPath.split("/")[0];

  if (topCollection.startsWith("_ext_")) {
    return null;
  }

  let schemas: Record<string, JsonSchema>;
  try {
    schemas = JSON.parse(COLLECTION_SCHEMAS_RAW);
  } catch {
    functions.logger.error("Invalid COLLECTION_SCHEMAS JSON. Skipping validation.", { refPath });
    return null;
  }

  const schema = schemas[topCollection];
  if (!schema) {
    return null; // No schema defined for this collection
  }

  const data = snapshot.data() as Record<string, unknown>;
  const errors = validateAgainstSchema(data, schema);

  if (errors.length === 0) {
    functions.logger.info("Document passed schema validation", { refPath });
    return null;
  }

  functions.logger.warn("Document failed schema validation", { refPath, errors });

  if (ERRORS_COLLECTION) {
    try {
      await admin.firestore().collection(ERRORS_COLLECTION).add({
        documentPath: refPath,
        collection: topCollection,
        errors,
        documentData: data,
        detectedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      functions.logger.error("Failed to write validation error report", { err });
    }
  }

  if (ON_INVALID === "delete") {
    try {
      await snapshot.ref.delete();
      functions.logger.info("Deleted invalid document", { refPath });
    } catch (err) {
      functions.logger.error("Failed to delete invalid document", { err, refPath });
    }
  }

  return null;
}

export const validateSchemaL1 = functions.firestore
  .document("{c1}/{d1}")
  .onCreate((snap) => handleCreate(snap));

export const validateSchemaL2 = functions.firestore
  .document("{c1}/{d1}/{c2}/{d2}")
  .onCreate((snap) => handleCreate(snap));

export const validateSchemaL3 = functions.firestore
  .document("{c1}/{d1}/{c2}/{d2}/{c3}/{d3}")
  .onCreate((snap) => handleCreate(snap));

export const validateSchemaL4 = functions.firestore
  .document("{c1}/{d1}/{c2}/{d2}/{c3}/{d3}/{c4}/{d4}")
  .onCreate((snap) => handleCreate(snap));

export const validateSchemaL5 = functions.firestore
  .document("{c1}/{d1}/{c2}/{d2}/{c3}/{d3}/{c4}/{d4}/{c5}/{d5}")
  .onCreate((snap) => handleCreate(snap));
