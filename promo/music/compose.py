"""
SONAR soundtrack generator — original music, synthesized from scratch (no samples, no
copyrighted material). Uplifting electronic / future-bass style, 120 BPM.

Usage: python3 compose.py <out.wav> <seconds> <drop_seconds> [--seed N]
The drop (full beat + crash) lands exactly at <drop_seconds>, so it can be synced
to the key moment of each ad.
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(int(sys.argv[sys.argv.index("--seed") + 1]) if "--seed" in sys.argv else 7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass_kernel(cut, taps=255):
    n = np.arange(taps) - (taps - 1) / 2
    h = np.sinc(2 * cut / SR * n) * np.hamming(taps)
    return h / h.sum()


def lowpass(x, cut):
    return np.convolve(x, lowpass_kernel(cut), mode="same")


def highpass(x, cut):
    return x - lowpass(x, cut)


def saw(f, t):
    return 2 * ((f * t) % 1.0) - 1


def env_ad(n, a, d):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    e[na:] = np.exp(-np.arange(n - na) / (d * SR))
    return e


class Track:
    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.buf = {k: np.zeros(self.n) for k in ["kick", "drums", "bass", "pad", "pluck", "fx", "lead"]}

    def add(self, bus, start, sig):
        i = int(start * SR)
        if i >= self.n:
            return
        j = min(self.n, i + len(sig))
        self.buf[bus][i:j] += sig[: j - i]


# A minor: Am – F – C – G  (vi – IV – I – V in C major), one chord per bar
PROG = [
    [57, 60, 64],  # Am
    [53, 57, 60],  # F
    [48, 52, 55],  # C
    [55, 59, 62],  # G
]
ROOTS = [45, 41, 48, 43]


def kick(dur=0.42):
    t = np.arange(int(dur * SR)) / SR
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    s[:120] += rng.uniform(-1, 1, 120) * np.linspace(0.6, 0, 120)
    return s * 0.95


def clap():
    n = int(0.22 * SR)
    noise = rng.uniform(-1, 1, n)
    bp = highpass(lowpass(noise, 2600), 900)
    e = np.zeros(n)
    for k in range(3):  # three quick hits like real hands
        i = int(k * 0.011 * SR)
        e[i:] += np.exp(-np.arange(n - i) / (0.012 * SR)) * (0.6 if k < 2 else 1)
    e += np.exp(-np.arange(n) / (0.07 * SR)) * 0.5
    return bp * e * 1.6


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    s = highpass(rng.uniform(-1, 1, n), 7000)
    return s * np.exp(-np.arange(n) / ((0.06 if open_ else 0.012) * SR)) * 0.5


def pad_chord(notes, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for n in notes:
        for det in (-0.12, 0, 0.12):
            s += saw(midi(n + 12 + det), t + rng.uniform(0, 1))
    s = lowpass(s, 2400) / (len(notes) * 3)
    a = np.minimum(1, t / 0.25)
    r = np.minimum(1, (dur - t) / 0.2)
    return s * a * r


def pluck(note, dur=0.28):
    t = np.arange(int(dur * SR)) / SR
    f = midi(note)
    s = 0.6 * saw(f, t) + 0.4 * np.sign(np.sin(2 * np.pi * f * 2 * t))
    s = lowpass(s, 3800)
    return s * np.exp(-t * 14)


def bass_note(note, dur):
    t = np.arange(int(dur * SR)) / SR
    f = midi(note)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t)
    s = np.tanh(s * 1.6)
    a = np.minimum(1, t / 0.01)
    r = np.minimum(1, (dur - t) / 0.03)
    return s * a * r * 0.55


def lead_note(note, dur):
    t = np.arange(int(dur * SR)) / SR
    f = midi(note) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.2))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    a = np.minimum(1, t / 0.02)
    r = np.minimum(1, (dur - t) / 0.08)
    return s * a * r * 0.32


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    # crossfade from dark to bright noise as it rises
    dark, bright = lowpass(noise, 900), highpass(noise, 3000)
    k = (t / dur) ** 2
    s = (1 - k) * dark + k * bright * 1.4
    f = 200 * 2 ** (t / dur * 3)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    return (s * 0.5 + tone) * (t / dur) ** 1.6


def crash():
    n = int(2.2 * SR)
    s = highpass(rng.uniform(-1, 1, n), 4500)
    return s * np.exp(-np.arange(n) / (0.6 * SR)) * 0.55


def impact():
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    f = 30 + 90 * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) * 0.9


# lead melody (8 bars, in beats): (beat offset, midi note, length in beats)
MELODY = [
    (0, 76, 0.5), (0.5, 74, 0.5), (1, 72, 1), (2, 71, 0.5), (2.5, 72, 1.5),
    (4, 72, 0.5), (4.5, 74, 0.5), (5, 76, 1), (6, 77, 0.5), (6.5, 76, 1.5),
    (8, 79, 0.5), (8.5, 76, 0.5), (9, 74, 1), (10, 72, 0.5), (10.5, 74, 1.5),
    (12, 74, 0.5), (12.5, 76, 0.5), (13, 79, 1), (14, 76, 1), (15, 74, 1),
]


def compose(seconds, drop):
    tr = Track(seconds)
    bars = int(seconds / (4 * BEAT)) + 2
    # align the bar grid so a bar starts exactly at the drop
    t0 = drop - int(drop / (4 * BEAT)) * 4 * BEAT

    for b in range(-1, bars):
        bt = t0 + b * 4 * BEAT
        if bt + 4 * BEAT < 0:
            continue
        ci = b % 4
        chord = PROG[ci]
        after = bt >= drop - 1e-6
        # pad all the way through, softer before the drop
        if bt >= 0:
            tr.add("pad", bt, pad_chord(chord, 4 * BEAT) * (1.0 if after else 0.55))
        # 16th-note pluck arpeggio
        arp = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 24]
        for s in range(16):
            st = bt + s * BEAT / 4
            if st < 0:
                continue
            vel = 0.9 if s % 4 == 0 else 0.6
            if not after:
                vel *= 0.5 + 0.5 * min(1, max(0, (st - (drop - 4 * BEAT)) / (4 * BEAT)))
            tr.add("pluck", st, pluck(arp[s % 4]) * vel)
        if after:
            for k in range(4):
                tr.add("kick", bt + k * BEAT, kick())
                tr.add("drums", bt + k * BEAT + BEAT / 2, hat(open_=(k % 2 == 1)))
                tr.add("drums", bt + k * BEAT + BEAT / 4, hat() * 0.5)
                tr.add("drums", bt + k * BEAT + 3 * BEAT / 4, hat() * 0.5)
            tr.add("drums", bt + BEAT, clap())
            tr.add("drums", bt + 3 * BEAT, clap())
            for k in range(8):
                tr.add("bass", bt + k * BEAT / 2, bass_note(ROOTS[ci] - 12 + (12 if k % 2 else 0), BEAT / 2 * 0.9))
        elif bt >= drop - 8 * BEAT and bt >= 0:
            # build: half-time kick and a snare roll that speeds up
            tr.add("kick", bt, kick() * 0.7)
            tr.add("kick", bt + 2 * BEAT, kick() * 0.7)
            for k in range(8):
                tr.add("drums", bt + k * BEAT / 2, clap() * 0.25 * (0.4 + k / 10))

    # lead melody from the drop, looping every 4 bars
    mel_start = drop
    while mel_start < seconds:
        for off, note, ln in MELODY:
            tr.add("lead", mel_start + off * BEAT, lead_note(note, ln * BEAT * 0.95))
        mel_start += 16 * BEAT

    # transition FX
    rlen = min(4 * BEAT, drop)
    tr.add("fx", drop - rlen, riser(rlen))
    tr.add("fx", drop, crash())
    tr.add("fx", drop, impact())

    # sidechain: duck pad, bass and lead under every kick
    kick_env = np.abs(tr.buf["kick"])
    duck = np.ones(tr.n)
    w = int(0.03 * SR)
    peaks = np.convolve(kick_env, np.ones(w) / w, mode="same")
    duck = 1 - 0.65 * np.clip(peaks / (peaks.max() + 1e-9) * 3, 0, 1)
    duck = np.convolve(duck, np.ones(int(0.06 * SR)) / int(0.06 * SR), mode="same")

    mix_l = (
        tr.buf["kick"] * 0.9
        + tr.buf["drums"] * 0.55
        + tr.buf["bass"] * 0.8 * duck
        + tr.buf["pad"] * 0.55 * duck
        + tr.buf["pluck"] * 0.32 * duck
        + tr.buf["lead"] * 0.5 * duck
        + tr.buf["fx"] * 0.6
    )
    # simple stereo: delayed pluck/pad on the right, plus a ping-pong echo
    d = int(0.015 * SR)
    right = np.roll(tr.buf["pad"] * 0.55 * duck + tr.buf["pluck"] * 0.32 * duck, d)
    mix_r = mix_l - (tr.buf["pad"] * 0.55 * duck + tr.buf["pluck"] * 0.32 * duck) + right
    echo = int(3 * BEAT / 4 * SR)
    mix_l[echo:] += 0.18 * tr.buf["pluck"][:-echo] * duck[:-echo]
    mix_r[echo * 2 :] += 0.14 * tr.buf["pluck"][: -echo * 2] * duck[: -echo * 2]

    stereo = np.stack([mix_l, mix_r], axis=1)
    # fades + soft limiting
    fi, fo = int(0.3 * SR), int(1.2 * SR)
    stereo[:fi] *= np.linspace(0, 1, fi)[:, None]
    stereo[-fo:] *= np.linspace(1, 0, fo)[:, None]
    stereo = np.tanh(stereo * 1.4)
    stereo /= np.abs(stereo).max() + 1e-9
    return stereo * 0.89


def write(path, stereo):
    data = (stereo * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


if __name__ == "__main__":
    out, secs, drop = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
    write(out, compose(secs, drop))
    print("wrote", out)
