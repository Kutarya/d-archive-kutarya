// Bağımsız WebGL çizimi; dokular koddan üretilir, ağdan varlık indirilmez.
import { BLOCKS, SIZE, HEIGHT, get } from "./core.mjs";
const faces = [
  {
    n: [1, 0, 0],
    v: [
      [1, 0, 1],
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
    ],
    s: 0.83,
  },
  {
    n: [-1, 0, 0],
    v: [
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    s: 0.7,
  },
  {
    n: [0, 1, 0],
    v: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
    s: 1,
  },
  {
    n: [0, -1, 0],
    v: [
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
      [0, 0, 1],
    ],
    s: 0.5,
  },
  {
    n: [0, 0, 1],
    v: [
      [0, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1],
    ],
    s: 0.9,
  },
  {
    n: [0, 0, -1],
    v: [
      [1, 0, 0],
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    s: 0.76,
  },
];
function face(data, x, y, z, id, f) {
  let tile = id;
  if (id === 1 && f.n[1] === 0) tile = 41;
  if (id === 1 && f.n[1] < 0) tile = 2;
  if (id === 6 && f.n[1]) tile = 42;
  const u = (tile % 8) / 8,
    v = Math.floor(tile / 8) / 8,
    eps = 0.001;
  const uv = [
    [u + eps, v + 0.125 - eps],
    [u + 0.125 - eps, v + 0.125 - eps],
    [u + 0.125 - eps, v + eps],
    [u + eps, v + eps],
  ];
  for (const i of [0, 1, 2, 0, 2, 3])
    data.push(
      x + f.v[i][0],
      y + f.v[i][1],
      z + f.v[i][2],
      ...uv[i],
      id === 17 || id === 40 ? 1.4 : f.s,
      id === 5 ? 0.68 : 1,
    );
}
function matrix(eye, yaw, pitch, aspect) {
  const f = [
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch),
  ];
  const s = [Math.cos(yaw), 0, Math.sin(yaw)],
    u = [-s[2] * f[1], s[2] * f[0] - s[0] * f[2], s[0] * f[1]];
  const dot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0);
  const v = [
    s[0],
    u[0],
    -f[0],
    0,
    s[1],
    u[1],
    -f[1],
    0,
    s[2],
    u[2],
    -f[2],
    0,
    -dot(s, eye),
    -dot(u, eye),
    dot(f, eye),
    1,
  ];
  const t = 1 / Math.tan(Math.PI / 5.5),
    near = 0.08,
    far = 220;
  const p = [
    t / aspect,
    0,
    0,
    0,
    0,
    t,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ];
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) out[c * 4 + r] += p[k * 4 + r] * v[c * 4 + k];
  return out;
}
export class Renderer {
  constructor(canvas) {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl)
      throw Error(
        "WebGL açılamadı. Tarayıcıda donanım hızlandırmasını açıp tekrar dene.",
      );
    this.gl = gl;
    this.canvas = canvas;
    this.chunks = new Map();
    this.distance = 3;
    this.quality = 1;
    this.drawn = 0;
    const vs = `attribute vec3 aPos;attribute vec2 aUV;attribute float aShade;attribute float aAlpha;uniform mat4 uVP;uniform vec3 uOffset;uniform vec3 uScale;uniform vec3 uEye;varying vec2 vUV;varying float vShade;varying float vAlpha;varying float vDistance;void main(){vec3 p=aPos*uScale+uOffset;gl_Position=uVP*vec4(p,1.);vUV=aUV;vShade=aShade;vAlpha=aAlpha;vDistance=length(p-uEye);}`;
    const fs = `precision mediump float;uniform sampler2D uTex;uniform vec3 uSky;uniform float uLight;uniform float uFog;uniform vec4 uColor;varying vec2 vUV;varying float vShade;varying float vAlpha;varying float vDistance;void main(){vec4 t=texture2D(uTex,vUV);vec3 c=t.rgb*vShade*max(uLight,.24);if(vShade>1.1)c=t.rgb;float a=vAlpha;if(uColor.a>0.){c=uColor.rgb;a=uColor.a;}float fog=smoothstep(uFog*.5,uFog,vDistance);gl_FragColor=vec4(mix(c,uSky,fog),a);}`;
    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(p));
    gl.useProgram(p);
    this.program = p;
    this.a = {};
    for (const n of ["Pos", "UV", "Shade", "Alpha"])
      this.a[n] = gl.getAttribLocation(p, "a" + n);
    this.u = {};
    for (const n of [
      "VP",
      "Offset",
      "Scale",
      "Eye",
      "Tex",
      "Sky",
      "Light",
      "Fog",
      "Color",
    ])
      this.u[n] = gl.getUniformLocation(p, "u" + n);
    const atlas = document.createElement("canvas");
    atlas.width = atlas.height = 128;
    const ctx = atlas.getContext("2d");
    let state = 719;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
    const colors = {
      ...Object.fromEntries(
        Object.entries(BLOCKS).map(([id, b]) => [id, b.color]),
      ),
      41: "#896044",
      42: "#b49a6c",
      48: "#6c8064",
      49: "#405350",
      50: "#da9a70",
      51: "#d4b878",
      52: "#b7d8d1",
    };
    for (let i = 0; i < 64; i++) {
      const x = (i % 8) * 16,
        y = (i >> 3) * 16;
      ctx.fillStyle = colors[i] || "#7d9c96";
      ctx.fillRect(x, y, 16, 16);
      for (let px = 0; px < 16; px++)
        for (let py = 0; py < 16; py++) {
          ctx.fillStyle =
            random() > 0.5
              ? `rgba(255,255,235,${random() * 0.12})`
              : `rgba(0,20,15,${random() * 0.15})`;
          ctx.fillRect(x + px, y + py, 1, 1);
        }
      ctx.fillStyle = "rgba(0,20,15,.18)";
      if ([3, 9, 10, 11, 13, 16].includes(i))
        for (let k = 0; k < 8; k++)
          ctx.fillRect(
            x + Math.floor(random() * 14),
            y + Math.floor(random() * 14),
            2,
            2,
          );
      if (i === 9 || i === 10 || i === 11) {
        ctx.fillStyle = i === 9 ? "#293b3b" : i === 10 ? "#d9aa83" : "#91ffe1";
        for (let k = 0; k < 6; k++)
          ctx.fillRect(
            x + 2 + Math.floor(random() * 11),
            y + 2 + Math.floor(random() * 11),
            2,
            2,
          );
      }
      if (i === 6)
        for (let k = 2; k < 16; k += 4) ctx.fillRect(x + k, y, 1, 16);
      if (i === 8 || i === 15) {
        for (let k = 3; k < 16; k += 4) ctx.fillRect(x, y + k, 16, 1);
        ctx.fillRect(x + 7, y, 1, 16);
      }
      if (i === 13) {
        ctx.fillRect(x, y + 7, 16, 1);
        ctx.fillRect(x + 7, y, 1, 7);
        ctx.fillRect(x + 3, y + 8, 1, 8);
      }
      if (i === 41) {
        ctx.fillStyle = "#6f9647";
        ctx.fillRect(x, y, 16, 4);
        for (let k = 0; k < 16; k += 3) ctx.fillRect(x + k, y + 4, 2, 2);
      }
      if (i === 42) {
        ctx.strokeStyle = "#786046";
        ctx.strokeRect(x + 2, y + 2, 12, 12);
        ctx.strokeRect(x + 5, y + 5, 6, 6);
      }
      if (i === 17) {
        ctx.fillStyle = "#935c35";
        ctx.fillRect(x + 5, y + 6, 6, 10);
        ctx.fillStyle = "#ffe092";
        ctx.fillRect(x + 3, y + 1, 10, 7);
      }
      if (i === 18 || i === 19) {
        ctx.fillStyle = i === 18 ? "#397446" : "#987530";
        for (let k = 2; k < 16; k += 4) ctx.fillRect(x + k, y, 1, 16);
      }
      if (i === 29) {
        ctx.fillRect(x, y + 5, 16, 2);
        ctx.fillStyle = "#ffdc8b";
        ctx.fillRect(x + 6, y + 5, 4, 5);
      }
      if (i === 48 || i === 50) {
        ctx.fillStyle = "#263c35";
        ctx.fillRect(x + 3, y + 6, 3, 2);
        ctx.fillRect(x + 10, y + 6, 3, 2);
        ctx.fillRect(x + 6, y + 11, 4, 1);
      }
      if (i === 40) {
        ctx.fillStyle = "#ccffe8";
        ctx.fillRect(x + 6, y, 4, 16);
        ctx.fillRect(x, y + 6, 16, 4);
      }
    }
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.cubes = {};
    for (const id of [48, 49, 50, 51, 52]) {
      const data = [];
      for (const f of faces) face(data, 0, 0, 0, id, f);
      this.cubes[id] = this.buffer(data);
    }
    const lines = [];
    for (const a of [
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
      [1, 0, 1],
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 1],
      [1, 1, 1],
    ])
      for (let i = 0; i < 3; i++)
        if (a[i] === 0) {
          const b = [...a];
          b[i] = 1;
          lines.push(...a, 0, 0, 1, 1, ...b, 0, 0, 1, 1);
        }
    this.outline = this.buffer(lines);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
  buffer(data) {
    const gl = this.gl,
      b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return { buffer: b, count: data.length / 7 };
  }
  clear() {
    for (const c of this.chunks.values()) {
      this.gl.deleteBuffer(c.land.buffer);
      this.gl.deleteBuffer(c.water.buffer);
    }
    this.chunks.clear();
  }
  chunk(world, cx, cz) {
    const land = [],
      water = [];
    for (let z = cz * 16; z < Math.min(cz * 16 + 16, SIZE); z++)
      for (let x = cx * 16; x < Math.min(cx * 16 + 16, SIZE); x++)
        for (let y = 0; y < HEIGHT; y++) {
          const id = get(world, x, y, z);
          if (!id) continue;
          for (const f of faces) {
            const n = get(world, x + f.n[0], y + f.n[1], z + f.n[2]);
            if (n === 0 || (id !== 5 && n === 5))
              face(id === 5 ? water : land, x, y, z, id, f);
          }
        }
    const key = `${cx},${cz}`,
      old = this.chunks.get(key);
    if (old) {
      this.gl.deleteBuffer(old.land.buffer);
      this.gl.deleteBuffer(old.water.buffer);
    }
    this.chunks.set(key, {
      cx,
      cz,
      land: this.buffer(land),
      water: this.buffer(water),
    });
    world.dirty.delete(key);
  }
  update(world, pos, budget = 2) {
    const cx = pos[0] >> 4,
      cz = pos[2] >> 4,
      queue = [];
    for (
      let z = Math.max(0, cz - this.distance);
      z <= Math.min(9, cz + this.distance);
      z++
    )
      for (
        let x = Math.max(0, cx - this.distance);
        x <= Math.min(9, cx + this.distance);
        x++
      ) {
        const key = `${x},${z}`;
        if (!this.chunks.has(key) || world.dirty.has(key))
          queue.push([x, z, Math.hypot(x - cx, z - cz)]);
      }
    queue.sort((a, b) => a[2] - b[2]);
    for (const [x, z] of queue.slice(0, budget)) this.chunk(world, x, z);
    for (const [key, c] of this.chunks)
      if (
        Math.max(Math.abs(c.cx - cx), Math.abs(c.cz - cz)) >
        this.distance + 1
      ) {
        this.gl.deleteBuffer(c.land.buffer);
        this.gl.deleteBuffer(c.water.buffer);
        this.chunks.delete(key);
      }
    return queue.length;
  }
  draw(buf, offset = [0, 0, 0], scale = [1, 1, 1], color = [0, 0, 0, 0], mode) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.buffer);
    for (const [n, size, offset] of [
      ["Pos", 3, 0],
      ["UV", 2, 12],
      ["Shade", 1, 20],
      ["Alpha", 1, 24],
    ]) {
      gl.enableVertexAttribArray(this.a[n]);
      gl.vertexAttribPointer(this.a[n], size, gl.FLOAT, false, 28, offset);
    }
    gl.uniform3fv(this.u.Offset, offset);
    gl.uniform3fv(this.u.Scale, scale);
    gl.uniform4fv(this.u.Color, color);
    gl.drawArrays(mode || gl.TRIANGLES, 0, buf.count);
  }
  render(player, time, mobs, target, beacon = false) {
    const gl = this.gl,
      c = this.canvas,
      ratio = Math.min(
        devicePixelRatio || 1,
        this.quality === 2 ? 1.7 : this.quality === 0 ? 0.7 : 1,
      );
    const w = Math.max(1, Math.round(c.clientWidth * ratio)),
      h = Math.max(1, Math.round(c.clientHeight * ratio));
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    gl.viewport(0, 0, w, h);
    const day = (time % 480) / 480,
      light = Math.max(0.27, Math.sin(day * Math.PI * 2) * 0.76 + 0.35),
      sky = [0.11 + 0.43 * light, 0.17 + 0.51 * light, 0.23 + 0.52 * light];
    const eye = [player.x, player.y + 1.62, player.z];
    gl.clearColor(...sky, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(
      this.u.VP,
      false,
      matrix(eye, player.yaw, player.pitch, w / h),
    );
    gl.uniform3fv(this.u.Eye, eye);
    gl.uniform3fv(this.u.Sky, sky);
    gl.uniform1f(this.u.Light, light);
    gl.uniform1f(this.u.Fog, this.distance * 16 + 13);
    gl.uniform1i(this.u.Tex, 0);
    const chunks = [...this.chunks.values()].filter(
      (q) =>
        Math.hypot(q.cx * 16 + 8 - player.x, q.cz * 16 + 8 - player.z) <
        this.distance * 16 + 20,
    );
    this.drawn = chunks.length;
    for (const q of chunks) this.draw(q.land);
    for (const m of mobs) {
      const t = m.hostile ? 48 : 50,
        walk = Math.sin(m.phase) * 0.13;
      this.draw(
        this.cubes[t],
        [m.x - 0.25, m.y + 1.05, m.z - 0.25],
        [0.5, 0.5, 0.5],
      );
      this.draw(
        this.cubes[m.hostile ? 49 : 51],
        [m.x - 0.3, m.y + 0.42, m.z - 0.2],
        [0.6, 0.65, 0.4],
      );
      this.draw(
        this.cubes[49],
        [m.x - 0.27, m.y, m.z - 0.15 + walk],
        [0.22, 0.45, 0.3],
      );
      this.draw(
        this.cubes[49],
        [m.x + 0.05, m.y, m.z - 0.15 - walk],
        [0.22, 0.45, 0.3],
      );
    }
    gl.depthMask(false);
    chunks.sort(
      (a, b) =>
        Math.hypot(b.cx * 16 - player.x, b.cz * 16 - player.z) -
        Math.hypot(a.cx * 16 - player.x, a.cz * 16 - player.z),
    );
    for (const q of chunks) this.draw(q.water);
    gl.depthMask(true);
    if (target)
      this.draw(
        this.outline,
        [target.x - 0.003, target.y - 0.003, target.z - 0.003],
        [1.006, 1.006, 1.006],
        [0.98, 0.94, 0.71, 1],
        gl.LINES,
      );
    if (beacon && this.ruin)
      this.draw(
        this.cubes[52],
        [this.ruin[0] + 0.35, this.ruin[1] + 1, this.ruin[2] + 0.35],
        [0.3, 35, 0.3],
        [0.46, 1, 0.78, 0.55],
      );
  }
}
