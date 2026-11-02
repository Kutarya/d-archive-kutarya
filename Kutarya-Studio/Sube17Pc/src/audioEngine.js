const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));

class AudioEngine {
  constructor() {
    this.context = null;
    this.musicGain = null;
    this.effectsGain = null;
    this.ambienceGain = null;
    this.musicTimer = null;
    this.ambienceTimer = null;
    this.musicStep = 0;
    this.musicNodes = new Set();
    this.ambienceNodes = new Set();
    this.musicVolume = 0.28;
    this.effectsVolume = 0.62;
    this.ambienceVolume = 0.42;
  }

  ensureContext() {
    if (this.context) {
      if (this.context.state === 'suspended') {
        void this.context.resume();
      }

      return this.context;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    this.context = new AudioContextClass();
    this.musicGain = this.context.createGain();
    this.effectsGain = this.context.createGain();
    this.ambienceGain = this.context.createGain();
    this.musicGain.gain.value = this.musicVolume * 0.2;
    this.effectsGain.gain.value = this.effectsVolume * 0.34;
    this.ambienceGain.gain.value = this.ambienceVolume * 0.18;
    this.musicGain.connect(this.context.destination);
    this.effectsGain.connect(this.context.destination);
    this.ambienceGain.connect(this.context.destination);

    return this.context;
  }

  setMusicVolume(value) {
    this.musicVolume = clamp01(value);
    const context = this.ensureContext();

    if (context && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(
        this.musicVolume * 0.2,
        context.currentTime,
        0.04,
      );
    }
  }

  setEffectsVolume(value) {
    this.effectsVolume = clamp01(value);
    const context = this.ensureContext();

    if (context && this.effectsGain) {
      this.effectsGain.gain.setTargetAtTime(
        this.effectsVolume * 0.34,
        context.currentTime,
        0.025,
      );
    }
  }

  setAmbienceVolume(value) {
    this.ambienceVolume = clamp01(value);
    const context = this.ensureContext();

    if (context && this.ambienceGain) {
      this.ambienceGain.gain.setTargetAtTime(
        this.ambienceVolume * 0.18,
        context.currentTime,
        0.06,
      );
    }
  }

  trackMusicNode(node) {
    this.musicNodes.add(node);
    node.addEventListener('ended', () => this.musicNodes.delete(node), {
      once: true,
    });
  }

  schedulePad(frequencies, startTime) {
    const context = this.context;

    if (!context || !this.musicGain) {
      return;
    }

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(720, startTime);
    filter.Q.value = 0.5;
    filter.connect(this.musicGain);

    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = index === 0 ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.detune.value = index === 1 ? -4 : index === 2 ? 3 : 0;
      envelope.gain.setValueAtTime(0.0001, startTime);
      envelope.gain.exponentialRampToValueAtTime(
        index === 0 ? 0.075 : 0.045,
        startTime + 1.8,
      );
      envelope.gain.setValueAtTime(
        index === 0 ? 0.075 : 0.045,
        startTime + 5.4,
      );
      envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + 8.2);
      oscillator.connect(envelope);
      envelope.connect(filter);
      oscillator.start(startTime);
      oscillator.stop(startTime + 8.25);
      this.trackMusicNode(oscillator);
    });

    const bell = context.createOscillator();
    const bellEnvelope = context.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(frequencies[2] * 2, startTime + 0.42);
    bellEnvelope.gain.setValueAtTime(0.0001, startTime + 0.42);
    bellEnvelope.gain.exponentialRampToValueAtTime(0.035, startTime + 0.46);
    bellEnvelope.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);
    bell.connect(bellEnvelope);
    bellEnvelope.connect(filter);
    bell.start(startTime + 0.42);
    bell.stop(startTime + 2.55);
    this.trackMusicNode(bell);
  }

  scheduleMusicStep() {
    const progression = [
      [73.42, 87.31, 110],
      [58.27, 73.42, 87.31],
      [65.41, 82.41, 98],
      [55, 69.3, 82.41],
    ];
    const context = this.ensureContext();

    if (!context) {
      return;
    }

    const chord = progression[this.musicStep % progression.length];
    this.schedulePad(chord, context.currentTime + 0.08);
    this.musicStep += 1;
  }

  startDefaultMusic() {
    if (this.musicTimer) {
      this.ensureContext();
      return;
    }

    this.scheduleMusicStep();
    this.musicTimer = window.setInterval(() => this.scheduleMusicStep(), 7600);
  }

  stopDefaultMusic() {
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }

    this.musicNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Düğüm zaten durmuş olabilir.
      }
    });
    this.musicNodes.clear();
  }

  trackAmbienceNode(node) {
    this.ambienceNodes.add(node);
    node.addEventListener('ended', () => this.ambienceNodes.delete(node), {
      once: true,
    });
  }

  createStreetNoiseBuffer(context, duration = 4) {
    const buffer = context.createBuffer(
      1,
      Math.floor(context.sampleRate * duration),
      context.sampleRate,
    );
    const channel = buffer.getChannelData(0);
    let previous = 0;

    for (let index = 0; index < channel.length; index += 1) {
      const whiteNoise = Math.random() * 2 - 1;
      previous = previous * 0.965 + whiteNoise * 0.035;
      channel[index] = previous * 0.8;
    }

    return buffer;
  }

  scheduleStreetPass() {
    const context = this.context;

    if (!context || !this.ambienceGain || !this.ambienceTimer) {
      return;
    }

    const now = context.currentTime + 0.05;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const panner = context.createStereoPanner();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(138, now);
    oscillator.frequency.exponentialRampToValueAtTime(92, now + 1.8);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(0.025, now + 0.62);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);
    panner.pan.setValueAtTime(-0.8, now);
    panner.pan.linearRampToValueAtTime(0.8, now + 2.1);
    oscillator.connect(envelope);
    envelope.connect(panner);
    panner.connect(this.ambienceGain);
    oscillator.start(now);
    oscillator.stop(now + 2.15);
    this.trackAmbienceNode(oscillator);
  }

  startStreetAmbience() {
    if (this.ambienceTimer) {
      this.ensureContext();
      return;
    }

    const context = this.ensureContext();

    if (!context || !this.ambienceGain) {
      return;
    }

    const noise = context.createBufferSource();
    const highpass = context.createBiquadFilter();
    const lowpass = context.createBiquadFilter();
    const noiseLevel = context.createGain();
    noise.buffer = this.createStreetNoiseBuffer(context);
    noise.loop = true;
    highpass.type = 'highpass';
    highpass.frequency.value = 120;
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1350;
    noiseLevel.gain.value = 0.12;
    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(noiseLevel);
    noiseLevel.connect(this.ambienceGain);
    noise.start();
    this.trackAmbienceNode(noise);

    [46, 69].forEach((frequency, index) => {
      const hum = context.createOscillator();
      const humLevel = context.createGain();
      hum.type = 'sine';
      hum.frequency.value = frequency;
      humLevel.gain.value = index === 0 ? 0.018 : 0.009;
      hum.connect(humLevel);
      humLevel.connect(this.ambienceGain);
      hum.start();
      this.ambienceNodes.add(hum);
    });

    this.ambienceTimer = window.setInterval(
      () => this.scheduleStreetPass(),
      5600,
    );
    window.setTimeout(() => this.scheduleStreetPass(), 900);
  }

  stopStreetAmbience() {
    if (this.ambienceTimer) {
      window.clearInterval(this.ambienceTimer);
      this.ambienceTimer = null;
    }

    this.ambienceNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Düğüm zaten durmuş olabilir.
      }
    });
    this.ambienceNodes.clear();
  }

  playHover() {
    const context = this.ensureContext();

    if (!context || !this.effectsGain || this.effectsVolume === 0) {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(760, now);
    oscillator.frequency.exponentialRampToValueAtTime(1120, now + 0.055);
    envelope.gain.setValueAtTime(0.052, now);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.072);
    oscillator.connect(envelope);
    envelope.connect(this.effectsGain);
    oscillator.start(now);
    oscillator.stop(now + 0.076);
  }

  playLocationHover(locationIndex = 0) {
    const context = this.ensureContext();

    if (!context || !this.effectsGain || this.effectsVolume === 0) {
      return;
    }

    const index = Math.max(0, Math.min(4, Number(locationIndex) || 0));
    const now = context.currentTime;
    const baseFrequency = 510 + index * 52;

    [
      { frequency: baseFrequency, delay: 0, gain: 0.064 },
      { frequency: baseFrequency * 1.42, delay: 0.052, gain: 0.042 },
    ].forEach(({ frequency, delay, gain }) => {
      const startTime = now + delay;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 1.08,
        startTime + 0.095,
      );
      envelope.gain.setValueAtTime(gain, startTime);
      envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14);

      oscillator.connect(envelope);
      envelope.connect(this.effectsGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.145);
    });
  }

  playConfirm() {
    const context = this.ensureContext();

    if (!context || !this.effectsGain || this.effectsVolume === 0) {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(720, now);
    oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.075);
    envelope.gain.setValueAtTime(0.04, now);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
    oscillator.connect(envelope);
    envelope.connect(this.effectsGain);
    oscillator.start(now);
    oscillator.stop(now + 0.09);

    const click = context.createOscillator();
    const clickEnvelope = context.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(1320, now);
    clickEnvelope.gain.setValueAtTime(0.009, now);
    clickEnvelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);
    click.connect(clickEnvelope);
    clickEnvelope.connect(this.effectsGain);
    click.start(now);
    click.stop(now + 0.02);
  }

  playDenied() {
    const context = this.ensureContext();

    if (!context || !this.effectsGain || this.effectsVolume === 0) {
      return;
    }

    [0, 0.082].forEach((delay, index) => {
      const startTime = context.currentTime + delay;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(index === 0 ? 620 : 510, startTime);
      envelope.gain.setValueAtTime(0.025, startTime);
      envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.048);
      oscillator.connect(envelope);
      envelope.connect(this.effectsGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.052);
    });
  }
}

export const audioEngine = new AudioEngine();
