// Convert MongoDB BSON types (ObjectId, Date) into JSON-serializable primitives
export function serializeBson<T = any>(input: T): any {
  return deepConvert(input);
}

function isObjectId(val: any): boolean {
  return (
    !!val &&
    typeof val === "object" &&
    (val.constructor?.name === "ObjectId" || val._bsontype === "ObjectID" || val._bsontype === "ObjectId")
  );
}

function deepConvert(value: any): any {
  if (value == null) return value;
  if (isObjectId(value)) return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((v) => deepConvert(v));
  if (typeof value === "object") {
    const out: any = {};
    for (const key of Object.keys(value)) {
      out[key] = deepConvert(value[key]);
    }
    return out;
  }
  return value;
}
