export function assertAridosBindings(bindings) {
  if (!bindings || typeof bindings !== "object") {
    throw new Error("[aridos] Missing module bindings object.");
  }

  const required = [
    "cuentaId",
    "userEmail",
    "role",
    "isAuthenticated",
    "hasSectionAccess",
    "isReadOnlySection",
  ];

  const missing = required.filter((key) => !(key in bindings));
  if (missing.length) {
    throw new Error(`[aridos] Missing required bindings: ${missing.join(", ")}`);
  }

  if (typeof bindings.hasSectionAccess !== "function") {
    throw new Error("[aridos] bindings.hasSectionAccess must be a function.");
  }

  if (typeof bindings.isReadOnlySection !== "function") {
    throw new Error("[aridos] bindings.isReadOnlySection must be a function.");
  }

  return bindings;
}
