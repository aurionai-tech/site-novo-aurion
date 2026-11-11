import {
  type CriarCena,
  type Geometria,
  amostrarContorno,
  clamp01,
  criarBrilho,
  criarCamadaSimbolo,
  desenharBrilho,
  desenharCamada,
  lerp,
  prepararCanvas2d,
  smooth,
} from './hero-caos';

const FAIXAS = 5;
const NOS = [0.12, 0.38, 0.64, 0.9];
const CORES = ['rgb(206 199 188)', 'rgb(214 190 120)'];
const NIVEIS_LIGACAO = [0.12, 0.25, 0.4];

type Particula = {
  cx: number;
  cy: number;
  phase: number;
  speed: number;
  amp: number;
  lane: number;
  lx: number;
  ly: number;
  sx: number;
  sy: number;
  ouro: boolean;
  delayFluxo: number;
  delaySimbolo: number;
};

function criarParticulas(count: number) {
  const { pontos } = amostrarContorno(count);
  const particulas = pontos.map<Particula>((p) => ({
    cx: Math.random() * 1.1 - 0.05,
    cy: Math.random() * 1.1 - 0.05,
    phase: Math.random() * Math.PI * 2,
    speed: 0.15 + Math.random() * 0.45,
    amp: 10 + Math.random() * 40,
    lane: Math.floor(Math.random() * FAIXAS),
    lx: Math.random(),
    ly: (Math.random() - 0.5) * 2,
    sx: p.sx,
    sy: p.sy,
    ouro: p.ouro,
    delayFluxo: Math.random(),
    // Cada partícula se encaixa logo depois da anterior, como uma caneta percorrendo o contorno.
    delaySimbolo: p.pos,
  }));

  // Vizinha seguinte no contorno da mesma barra; a última fecha o laço com a primeira.
  const primeiraOuro = particulas.findIndex((q) => q.ouro);
  const vizinha = particulas.map((q, i) => {
    if (i + 1 < particulas.length && particulas[i + 1].ouro === q.ouro) return i + 1;
    return q.ouro ? primeiraOuro : 0;
  });
  return { particulas, vizinha };
}

export const criarCenaConstelacao: CriarCena = (_section, canvas) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let g: Geometria;
  let flowX0 = 0;
  let flowX1 = 0;
  let laneCy = 0;
  let laneGap = 0;
  let particulas: Particula[] = [];
  let vizinha: number[] = [];
  let total = 0;
  let camada: HTMLCanvasElement | null = null;
  let brilho: CanvasGradient | null = null;
  let xs = new Float32Array(0);
  let ys = new Float32Array(0);
  let bs = new Float32Array(0);

  const yFaixa = (k: number) => laneCy + (k - (FAIXAS - 1) / 2) * laneGap;

  // Linhas entre partículas próximas; perto do fim, só as vizinhas no contorno continuam ligadas.
  const desenharRede = (visiveis: number) => {
    const alcance = g.desktop ? 110 : 70;
    for (let n = 0; n < NIVEIS_LIGACAO.length; n++) {
      ctx.beginPath();
      for (let i = 0; i < total; i++) {
        if (bs[i] > 0.98) continue;
        for (let j = i + 1; j < total; j++) {
          const dx = xs[j] - xs[i];
          const dy = ys[j] - ys[i];
          if (Math.abs(dx) > alcance || Math.abs(dy) > alcance) continue;
          const d = Math.hypot(dx, dy);
          if (d > alcance) continue;
          const forca = (1 - d / alcance) * (1 - Math.max(bs[i], bs[j]));
          if (Math.min(NIVEIS_LIGACAO.length - 1, Math.floor(forca * NIVEIS_LIGACAO.length)) !== n || forca < 0.05) {
            continue;
          }
          ctx.moveTo(xs[i], ys[i]);
          ctx.lineTo(xs[j], ys[j]);
        }
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgb(214 190 120 / ${NIVEIS_LIGACAO[n] * visiveis})`;
      ctx.stroke();
    }

    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const j = vizinha[i];
      if (Math.min(bs[i], bs[j]) < 0.5) continue;
      ctx.moveTo(xs[i], ys[i]);
      ctx.lineTo(xs[j], ys[j]);
    }
    ctx.strokeStyle = `rgb(220 203 147 / ${0.8 * visiveis})`;
    ctx.stroke();

    const lado = g.desktop ? 2.6 : 2;
    ctx.globalAlpha = visiveis;
    for (let cor = 0; cor < CORES.length; cor++) {
      ctx.fillStyle = CORES[cor];
      for (let i = 0; i < total; i++) {
        if (particulas[i].ouro !== (cor === 1)) continue;
        ctx.fillRect(xs[i] - lado / 2, ys[i] - lado / 2, lado, lado);
      }
    }
    ctx.globalAlpha = 1;
  };

  return {
    layout(geo) {
      g = geo;
      prepararCanvas2d(canvas, ctx, g);
      flowX0 = g.desktop ? g.w * 0.34 : -20;
      flowX1 = g.w + 20;
      laneCy = g.symY + g.symH / 2;
      laneGap = g.symH * 0.17;
      camada = criarCamadaSimbolo(g);
      brilho = criarBrilho(ctx, g);

      const count = g.w < 768 ? 120 : 220;
      if (count !== total) {
        total = count;
        ({ particulas, vizinha } = criarParticulas(count));
        xs = new Float32Array(total);
        ys = new Float32Array(total);
        bs = new Float32Array(total);
      }
    },

    draw({ progress, t, intro }) {
      const { w, h, symX, symY, symH } = g;
      ctx.clearRect(0, 0, w, h);

      const flowA = smooth(clamp01((progress - 0.12) / 0.2)) * (1 - smooth(clamp01((progress - 0.44) / 0.18)));
      const symA = smooth(clamp01((progress - 0.7) / 0.1));
      const fillA = smooth(clamp01((progress - 0.78) / 0.12));

      // As linhas da rede atrapalham a leitura, então no desktop ela fica à direita do texto.
      const x0Caos = g.desktop ? symX - 120 : 0;
      const span = flowX1 - flowX0;
      for (let i = 0; i < total; i++) {
        const q = particulas[i];
        const a = smooth(clamp01((progress - 0.06 - q.delayFluxo * 0.12) / 0.22));
        const b = smooth(clamp01((progress - 0.42 - q.delaySimbolo * 0.2) / 0.16));
        bs[i] = b;
        const chx = lerp(x0Caos, w, q.cx) + Math.sin(t * q.speed + q.phase) * q.amp;
        const chy = q.cy * h + Math.cos(t * q.speed * 0.8 + q.phase * 1.3) * q.amp;
        const fx = flowX0 + ((q.lx + t * (0.02 + q.speed * 0.04)) % 1) * span;
        const fy = yFaixa(q.lane) + q.ly * laneGap * 0.12;
        xs[i] = lerp(lerp(chx, fx, a), symX + q.sx * symH, b);
        ys[i] = lerp(lerp(chy, fy, a), symY + q.sy * symH, b);
      }

      if (flowA > 0.01) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgb(198 178 114 / ${0.12 * flowA})`;
        ctx.beginPath();
        for (let k = 0; k < FAIXAS; k++) {
          ctx.moveTo(flowX0, yFaixa(k));
          ctx.lineTo(flowX1, yFaixa(k));
        }
        ctx.stroke();

        ctx.strokeStyle = `rgb(198 178 114 / ${0.7 * flowA})`;
        ctx.beginPath();
        for (let k = 0; k < FAIXAS; k++) {
          for (const n of NOS) {
            const x = lerp(flowX0, flowX1, n);
            ctx.moveTo(x + 3.5, yFaixa(k));
            ctx.arc(x, yFaixa(k), 3.5, 0, Math.PI * 2);
          }
        }
        ctx.stroke();
      }

      desenharBrilho(ctx, brilho, g, symA * (0.63 + 0.37 * fillA));

      const visiveis = intro * (1 - fillA);
      if (visiveis > 0.01) desenharRede(visiveis);

      desenharCamada(ctx, camada, g, fillA);
    },
  };
};
