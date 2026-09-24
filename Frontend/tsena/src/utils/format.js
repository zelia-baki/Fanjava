/**
 * Prix en ariary, ex. « 15 000 Ar ».
 * L'espace fine insécable de fr-FR (U+202F) est absente de certaines polices (Archivo) :
 * on la remplace par une espace insécable classique (U+00A0).
 */
export function formatPrix(valeur) {
  const nombre = typeof valeur === 'number' ? valeur : parseFloat(valeur);
  if (Number.isNaN(nombre)) return '';
  return `${nombre.toLocaleString('fr-FR').replace(/\u202f/g, '\u00a0')}\u00a0Ar`;
}
