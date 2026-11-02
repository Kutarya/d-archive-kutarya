// build-block-arena-rules.mjs tarafından mevcut oyun kaynağından üretilir.

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=Math.PI*2;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
// Sunucu çizim yapmaz; aynı tohumlu harita üretimindeki rastgele tüketimi korunur.
const cube=()=>{};
const WEAPONS = [
        {
          name: "ATLAS AR",
          tag: "TAARRUZ TÜFEĞİ",
          short: "AR",
          damage: 24,
          rate: 0.125,
          mag: 30,
          reserve: 150,
          reload: 1.65,
          spread: 0.013,
          pellets: 1,
          range: 65,
          color: "#7cf4c4",
          auto: true,
          kick: 0.045,
        },
        {
          name: "KIVILCIM",
          tag: "HAFİF MAKİNELİ",
          short: "SMG",
          damage: 15,
          rate: 0.073,
          mag: 36,
          reserve: 180,
          reload: 1.35,
          spread: 0.025,
          pellets: 1,
          range: 36,
          color: "#ffdc70",
          auto: true,
          kick: 0.026,
        },
        {
          name: "KIRICI",
          tag: "POMPALI TÜFEK",
          short: "SG",
          damage: 13,
          rate: 0.8,
          mag: 6,
          reserve: 42,
          reload: 2.1,
          spread: 0.105,
          pellets: 8,
          range: 23,
          color: "#ff9478",
          auto: false,
          kick: 0.14,
        },
        {
          name: "FIRTINA",
          tag: "AĞIR MAKİNELİ",
          short: "LMG",
          damage: 21,
          rate: 0.105,
          mag: 60,
          reserve: 180,
          reload: 3,
          spread: 0.027,
          pellets: 1,
          range: 58,
          color: "#a99cff",
          auto: true,
          kick: 0.055,
        },
        {
          name: "UFUK",
          tag: "KESKİN NİŞANCI",
          short: "SR",
          damage: 85,
          rate: 1.05,
          mag: 5,
          reserve: 30,
          reload: 2.3,
          spread: 0.006,
          pellets: 1,
          range: 90,
          color: "#73caff",
          auto: false,
          kick: 0.18,
        },
      ];
      const MAPS = [
        {
          name: "Neon Avlu",
          desc: "Gece / Dar sokaklar",
          sky: "#263a50",
          floor: ["#354757", "#394c5c"],
          wall: "#506578",
          accent: "#75e7c7",
        },
        {
          name: "Kum İstasyonu",
          desc: "Gündüz / Uzun görüş",
          sky: "#a2c2cf",
          floor: ["#bca477", "#c3ad82"],
          wall: "#ccaf80",
          accent: "#ed8562",
        },
        {
          name: "Buz Kalesi",
          desc: "Soğuk / Siper savaşı",
          sky: "#799cb4",
          floor: ["#b2cddd", "#bad3e0"],
          wall: "#7eacc5",
          accent: "#6be4dd",
        },
      ];
      
function seeded(seed) {
        return () => {
          seed |= 0;
          seed = (seed + 0x6d2b79f5) | 0;
          let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }
      function makeMap(index) {
        const N = 25,
          C = 2,
          half = (N * C) / 2,
          grid = Array.from({ length: N }, () => Array(N).fill(0)),
          out = [],
          boxes = [],
          spawns = [],
          random = seeded(754 + index * 981),
          theme = MAPS[index];
        const place = (gx, gz, h = 3.5) => {
          if (gx < 0 || gz < 0 || gx >= N || gz >= N) return;
          grid[gz][gx] = Math.max(grid[gz][gx], h);
        };
        for (let i = 0; i < N; i++) {
          place(i, 0, 5);
          place(i, N - 1, 5);
          place(0, i, 5);
          place(N - 1, i, 5);
        }
        if (index === 0) {
          for (const [x, z, w, d] of [
            [4, 4, 4, 4],
            [17, 4, 4, 4],
            [4, 17, 4, 4],
            [17, 17, 4, 4],
            [10, 9, 2, 7],
            [15, 11, 2, 3],
          ])
            for (let a = x; a < x + w; a++)
              for (let b = z; b < z + d; b++)
                place(a, b, 4 + ((a + b) % 3) * 0.3);
          for (const [x, z] of [
            [7, 12],
            [18, 12],
            [12, 5],
            [12, 19],
            [3, 12],
            [21, 12],
          ]) {
            place(x, z, 1.3);
            place(x + 1, z, 1.3);
          }
        }
        if (index === 1) {
          for (const [x, z, w, d] of [
            [5, 4, 2, 6],
            [18, 4, 2, 6],
            [5, 16, 2, 5],
            [18, 16, 2, 5],
            [10, 11, 5, 2],
          ])
            for (let a = x; a < x + w; a++)
              for (let b = z; b < z + d; b++) place(a, b, 3.4);
          for (const [x, z] of [
            [10, 5],
            [13, 18],
            [11, 18],
            [3, 12],
            [21, 12],
            [8, 14],
            [16, 8],
          ]) {
            place(x, z, 1.2);
            place(x + 1, z, 1.2);
          }
        }
        if (index === 2) {
          for (const [x, z, w, d] of [
            [4, 4, 5, 2],
            [16, 4, 5, 2],
            [4, 19, 5, 2],
            [16, 19, 5, 2],
            [4, 9, 2, 7],
            [19, 9, 2, 7],
            [10, 10, 1, 5],
            [14, 10, 1, 5],
          ])
            for (let a = x; a < x + w; a++)
              for (let b = z; b < z + d; b++) place(a, b, 3.7);
          for (const [x, z] of [
            [9, 7],
            [14, 17],
            [7, 12],
            [17, 12],
            [12, 3],
            [12, 21],
          ]) {
            place(x, z, 1.4);
            place(x + 1, z, 1.4);
          }
        }
        cube(out, 0, -0.26, 0, N * C + 12, 0.5, N * C + 12, theme.floor[0]);
        for (let z = 0; z < N; z++)
          for (let x = 0; x < N; x++) {
            const wx = (x + 0.5) * C - half,
              wz = (z + 0.5) * C - half,
              h = grid[z][x];
            if (h) {
              const color = hex(theme.wall).map(
                (v) => v * (0.88 + random() * 0.18),
              );
              cube(out, wx, h / 2, wz, C, h, C, color);
              boxes.push({
                min: [wx - C / 2, 0, wz - C / 2],
                max: [wx + C / 2, h, wz + C / 2],
                h,
              });
              if (h > 3 && x > 0 && x < N - 1 && z > 0 && z < N - 1) {
                cube(
                  out,
                  wx,
                  h + 0.1,
                  wz,
                  C + 0.07,
                  0.2,
                  C + 0.07,
                  index === 2 ? "#d1e8ef" : "#233a4c",
                );
                if (index === 0 && (x + z) % 3 === 0) {
                  cube(
                    out,
                    wx,
                    h - 0.65,
                    wz + 1.015,
                    1.25,
                    0.28,
                    0.03,
                    theme.accent,
                    true,
                  );
                  cube(
                    out,
                    wx + 1.015,
                    h - 0.65,
                    wz,
                    0.03,
                    0.28,
                    1.25,
                    theme.accent,
                    true,
                  );
                }
              }
              if (h < 2) {
                cube(
                  out,
                  wx,
                  h - 0.08,
                  wz,
                  C + 0.02,
                  0.16,
                  C + 0.02,
                  index === 1 ? "#8b6540" : "#3b616e",
                );
                cube(out, wx, h / 2, wz + 1.02, 0.12, h, 0.035, theme.accent);
              }
            } else {
              cube(out, wx, 0.005, wz, C, 0.03, C, theme.floor[(x + z) % 2]);
              if (x > 1 && x < N - 2 && z > 1 && z < N - 2)
                spawns.push({ x: wx, z: wz, gx: x, gz: z });
              if (
                index === 0 &&
                (x === 2 || x === 22 || z === 2 || z === 22) &&
                (x + z) % 3 === 0
              )
                cube(out, wx, 0.025, wz, 1.4, 0.04, 0.13, theme.accent, true);
            }
          }
        if (index === 0) {
          for (const [x, z] of [
            [-20, -20],
            [20, 20],
            [-20, 20],
            [20, -20],
          ]) {
            cube(out, x, 3.5, z, 0.25, 7, 0.25, "#1b2c3a");
            cube(out, x, 6.8, z, 1.6, 0.25, 1.6, theme.accent, true);
          }
        }
        if (index === 1) {
          for (const [x, z] of [
            [-20, -17],
            [20, 17],
            [17, -20],
            [-17, 20],
          ]) {
            cube(out, x, 1.2, z, 0.4, 2.4, 0.4, "#527454");
            cube(out, x + 0.5, 1.65, z, 0.8, 0.25, 0.3, "#527454");
            cube(out, x + 0.8, 1.9, z, 0.3, 0.7, 0.3, "#527454");
          }
        }
        // Uzak siluet ve arena işaretleri; yürünebilir harita geometrisi korunur.
        for (let i = 0; i < 12; i++) {
          const offset = -34 + i * 6,
            height = 9 + ((i * 7) % 12);
          cube(
            out,
            offset,
            height / 2,
            -34,
            4.8,
            height,
            5,
            index === 1 ? "#9c8061" : index === 2 ? "#587e99" : "#182c42",
          );
          cube(
            out,
            -34,
            height / 2,
            offset,
            5,
            height,
            4.8,
            index === 1 ? "#917554" : "#20364b",
          );
          if (index === 0)
            for (let j = 2; j < height; j += 2.8)
              cube(out, offset, j, -31.45, 2.2, 0.18, 0.02, "#61bfc1", true);
        }
        for (const b of boxes)
          if (b.h < 4.9) {
            const wx = (b.min[0] + b.max[0]) / 2,
              wz = (b.min[2] + b.max[2]) / 2;
            cube(
              out,
              wx + 0.48,
              0.026,
              wz + 0.38,
              C + 0.7,
              0.006,
              C + 0.5,
              index === 1 ? "#aa906a" : index === 2 ? "#93b6cb" : "#2b3c4e",
            );
            if (b.h < 2) {
              cube(
                out,
                wx,
                b.h + 0.035,
                wz,
                C - 0.18,
                0.03,
                C - 0.18,
                theme.accent,
                true,
              );
            }
          }
        for (let i = 0; i < 16; i++) {
          const angle = (i * TAU) / 16;
          cube(
            out,
            Math.sin(angle) * 3.2,
            0.032,
            Math.cos(angle) * 3.2,
            0.18,
            0.015,
            0.18,
            theme.accent,
            true,
          );
        }
        return {
          index,
          N,
          C,
          half,
          grid,
          out,
          boxes,
          spawns,
          theme,
          toCell: (x, z) => [
            Math.floor((x + half) / C),
            Math.floor((z + half) / C),
          ],
          toWorld: (x, z) => [(x + 0.5) * C - half, (z + 0.5) * C - half],
        };
      }
      
export {WEAPONS,MAPS};
export function createWorld(index){
 const map=makeMap(index);
 function blocked(x, z, r = 0.35, y = 0) {
        const minX = Math.floor((x - r + map.half) / map.C),
          maxX = Math.floor((x + r + map.half) / map.C),
          minZ = Math.floor((z - r + map.half) / map.C),
          maxZ = Math.floor((z + r + map.half) / map.C);
        for (let gz = minZ; gz <= maxZ; gz++)
          for (let gx = minX; gx <= maxX; gx++) {
            if (gx < 0 || gz < 0 || gx >= map.N || gz >= map.N) return true;
            const h = map.grid[gz][gx];
            if (h > y + 0.06) {
              const cx = (gx + 0.5) * map.C - map.half,
                cz = (gz + 0.5) * map.C - map.half,
                nx = clamp(x, cx - map.C / 2, cx + map.C / 2),
                nz = clamp(z, cz - map.C / 2, cz + map.C / 2);
              if ((x - nx) ** 2 + (z - nz) ** 2 < r * r) return true;
            }
          }
        return false;
      }
      function moveActor(a, dx, dz, r = 0.34) {
        if (!blocked(a.x + dx, a.z, r, a.y || 0)) a.x += dx;
        if (!blocked(a.x, a.z + dz, r, a.y || 0)) a.z += dz;
      }
      function supportHeight(x, z, r = 0.3) {
        let high = 0;
        for (const [dx, dz] of [
          [0, 0],
          [r, 0],
          [-r, 0],
          [0, r],
          [0, -r],
        ]) {
          const [gx, gz] = map.toCell(x + dx, z + dz);
          if (gx >= 0 && gz >= 0 && gx < map.N && gz < map.N)
            high = Math.max(high, map.grid[gz][gx]);
        }
        return high;
      }
      function rayBox(o, d, min, max) {
        let near = -Infinity,
          far = Infinity;
        for (let i = 0; i < 3; i++) {
          if (Math.abs(d[i]) < 1e-8) {
            if (o[i] < min[i] || o[i] > max[i]) return Infinity;
          } else {
            let a = (min[i] - o[i]) / d[i],
              b = (max[i] - o[i]) / d[i];
            if (a > b) [a, b] = [b, a];
            near = Math.max(near, a);
            far = Math.min(far, b);
            if (near > far) return Infinity;
          }
        }
        return far >= 0 ? Math.max(0, near) : Infinity;
      }
      function wallRay(o, d, max = 100) {
        let t = max;
        for (const b of map.boxes) t = Math.min(t, rayBox(o, d, b.min, b.max));
        if (d[1] < -0.0001) t = Math.min(t, Math.max(0, -o[1] / d[1]));
        return t;
      }
      
 return {map,blocked,moveActor,supportHeight,rayBox,wallRay};
}
