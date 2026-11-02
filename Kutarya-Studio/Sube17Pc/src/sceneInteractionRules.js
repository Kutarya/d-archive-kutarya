// Yalnız erişim koşullarıdır; oyun verisini değiştirmez.
export function evaluateInteraction(spec, game, consumed = new Set()) {
  const resolve = (value, fallback = true) => value === undefined ? fallback : typeof value === 'function' ? Boolean(value(game)) : Boolean(value);
  const npc = spec.npcId ? game.family?.find(person => person.id === spec.npcId) : null;
  const visible = resolve(spec.visible) && (!spec.npcId || npc?.status === 'home');
  const enabled = visible && resolve(spec.enabled) &&
    (!spec.phases || spec.phases.includes(game.phase)) &&
    (spec.minDay === undefined || game.day >= spec.minDay) &&
    (spec.maxDay === undefined || game.day <= spec.maxDay) &&
    (spec.minMinute === undefined || game.minute >= spec.minMinute) &&
    (spec.maxMinute === undefined || game.minute <= spec.maxMinute) &&
    (!spec.once || !consumed.has(spec.id));
  return { visible, enabled };
}
