// Hızlı masanın sahibi geri sayım sırasında koparsa sahiplik boşta kalmaz.
export function ensureHost(game) {
  if (!game.players.has(game.host)) game.host = game.active()[0]?.id || game.players.keys().next().value || null;
}
export function capacity(value) {
  return Math.max(2, Math.min(6, Math.trunc(Number(value) || 6)));
}
