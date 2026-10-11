/**
 * Extrait le message d'erreur d'un champ dans une réponse DRF
 * ({ champ: ["msg"] } ou { entreprise: { ville: ["msg"] } }).
 */
export function fieldError(errors, ...path) {
  const value = path.reduce((acc, key) => acc?.[key], errors);
  if (!value) return undefined;
  return Array.isArray(value) ? value.join(' ') : String(value);
}
