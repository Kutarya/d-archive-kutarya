// Aynı hareket adımı istemci tahmini ve sunucu doğrulamasında kullanılır.
export const ARENA_STEP = 1 / 60;
export function arenaStepMotion(p, input, world, dt) {
  p.dashCooldown = Math.max(0, p.dashCooldown - dt);
  p.dashTime = Math.max(0, p.dashTime - dt);
  p.yaw = input.yaw;
  p.pitch = input.pitch;
  if (input.dash && !p.wasDash && p.dashCooldown <= 0 && p.stamina >= 35) {
    p.dashTime = 0.18;
    p.dashCooldown = 3;
    p.stamina -= 35;
  }
  const sprint =
    input.sprint &&
    !input.ads &&
    p.stamina > 2 &&
    Math.hypot(input.f, input.r) > 0.1;
  p.stamina = Math.max(0, Math.min(100, p.stamina + (sprint ? -23 : 17) * dt));
  const speed =
    (p.dashTime > 0 ? 15 : sprint ? 7.8 : 5.4) *
    (input.ads ? 0.56 : 1) *
    (p.weapon === 3 ? 0.9 : 1);
  const norm = Math.max(1, Math.hypot(input.f, input.r)),
    f = input.f / norm,
    r = input.r / norm;
  world.moveActor(
    p,
    (Math.sin(p.yaw) * f + Math.cos(p.yaw) * r) * speed * dt,
    (-Math.cos(p.yaw) * f + Math.sin(p.yaw) * r) * speed * dt,
  );
  const ground = world.supportHeight(p.x, p.z);
  p.vy -= 18 * dt;
  p.y += p.vy * dt;
  if (p.y <= ground && p.vy < 0) {
    p.y = ground;
    p.vy = 0;
  }
  if (input.jump && !p.wasJump && p.vy === 0) p.vy = 7.6;
  p.walk += Math.hypot(f, r) * speed * dt;
  p.wasJump = input.jump;
  p.wasDash = input.dash;
}
