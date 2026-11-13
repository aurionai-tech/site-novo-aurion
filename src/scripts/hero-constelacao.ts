import {
  type CriarCena,
  type Geometria,
  amostrarContorno,
  clamp01,
  criarBrilho,
  criarCamadaSimbolo,
  criarReflexo,
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
const DURACAO_REFLEXO = 1.4;

const smoother = (v: number) => v * v * v * (v * (v * 6 - 15) + 10);

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
  delayEntrada: number;
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
    delayEntrada: Math.random(),
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
  let reflexo: ReturnType<typeof criarReflexo> = null;
  let reflexoInicio = -1;
  let reflexoArmado = true;
  let mascaraTopo: CanvasGradient | null = null;
  let mascaraTexto: CanvasGradient | null = null;
  let xs = new Float32Array(0);
  let ys = new Float32Array(0);
  let bs = new Float32Array(0);
  let es = new Float32Array(0);

  const yFaixa = (k: number) => laneCy + (k - (FAIXAS - 1) / 2) * laneGap;

  // Linhas entre partículas próximas; perto do fim, só as vizinhas no contorno continuam ligadas.
  const desenharRede = (visiveis: number) => {
    const alcance = g.desktop ? 110 : 70;
    // Uma passada só pelos pares; cada ligação vai para o traçado do seu nível de intensidade.
    const niveis = NIVEIS_LIGACAO.map(() => new Path2D());
    for (let i = 0; i < total; i++) {
      if (bs[i] > 0.98) continue;
      for (let j = i + 1; j < total; j++) {
        const dx = xs[j] - xs[i];
        const dy = ys[j] - ys[i];
        if (Math.abs(dx) > alcance || Math.abs(dy) > alcance) continue;
        const d = Math.hypot(dx, dy);
        if (d > alcance) continue;
        // Ligações de partículas a caminho do símbolo somem rápido, para não cruzarem a tela esticadas.
        const soltas = 1 - Math.max(bs[i], bs[j]);
        const forca = (1 - d / alcance) * soltas * soltas * Math.min(es[i], es[j]);
        if (forca < 0.05) continue;
        const nivel = niveis[Math.min(NIVEIS_LIGACAO.length - 1, Math.floor(forca * NIVEIS_LIGACAO.length))];
        nivel.moveTo(xs[i], ys[i]);
        nivel.lineTo(xs[j], ys[j]);
      }
    }
    ctx.lineWidth = 1;
    niveis.forEach((nivel, n) => {
      ctx.strokeStyle = `rgb(214 190 120 / ${NIVEIS_LIGACAO[n] * visiveis})`;
      ctx.stroke(nivel);
    });

    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const j = vizinha[i];
      if (Math.min(bs[i], bs[j]) < 0.92) continue;
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
        if (particulas[i].ouro !== (cor === 1) || es[i] < 0.01) continue;
        const l = lado * es[i];
        ctx.fillRect(xs[i] - l / 2, ys[i] - l / 2, l, l);
      }
    }
    ctx.globalAlpha = 1;
  };

  // Apaga suavemente a rede sob a legenda das fases e o texto; some quando as partículas vão formar o símbolo.
  const apagarAreasDeTexto = (forca: number) => {
    if (forca <= 0.01) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = forca;
    if (mascaraTopo) {
      ctx.fillStyle = mascaraTopo;
      ctx.fillRect(0, 0, g.w, g.legendaBase + 48);
    }
    if (mascaraTexto) {
      ctx.fillStyle = mascaraTexto;
      if (g.desktop) {
        const x = Math.min(flowX0, g.symX - 180);
        ctx.fillRect(x, 0, Math.max(g.textoDir + 100, g.symX) - x, g.h);
      }
      else ctx.fillRect(0, g.textoTopo - 64, g.w, g.h);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
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
      reflexo = criarReflexo(camada);

      mascaraTopo = ctx.createLinearGradient(0, g.legendaBase - 16, 0, g.legendaBase + 48);
      mascaraTopo.addColorStop(0, '#000');
      mascaraTopo.addColorStop(1, 'rgb(0 0 0 / 0)');
      if (g.desktop) {
        const inicio = g.textoDir - 24;
        const fim = Math.max(inicio + 60, Math.min(g.textoDir + 100, g.symX));
        mascaraTexto = ctx.createLinearGradient(inicio, 0, fim, 0);
      } else {
        mascaraTexto = ctx.createLinearGradient(0, g.textoTopo - 8, 0, g.textoTopo - 64);
      }
      mascaraTexto.addColorStop(0, '#000');
      mascaraTexto.addColorStop(1, 'rgb(0 0 0 / 0)');

      const count = g.w < 768 ? 120 : 220;
      if (count !== total) {
        total = count;
        ({ particulas, vizinha } = criarParticulas(count));
        xs = new Float32Array(total);
        ys = new Float32Array(total);
        bs = new Float32Array(total);
        es = new Float32Array(total);
      }
    },

    draw({ progress, t }) {
      const { w, h, symX, symY, symH } = g;
      ctx.clearRect(0, 0, w, h);

      const flowA = smooth(clamp01((progress - 0.12) / 0.2)) * (1 - smooth(clamp01((progress - 0.44) / 0.18)));
      const symA = smooth(clamp01((progress - 0.7) / 0.1));
      const fillA = smooth(clamp01((progress - 0.78) / 0.12));
      const formacao = smooth(clamp01((progress - 0.5) / 0.2));

      // As linhas da rede atrapalham a leitura, então no desktop ela fica à direita do texto.
      const x0Caos = g.desktop ? symX - 120 : 0;
      // No celular o caos fica na faixa livre entre a legenda e o texto.
      const y0Caos = g.desktop ? -0.05 * h : g.legendaBase - 20;
      const y1Caos = g.desktop ? 1.05 * h : g.textoTopo;
      const span = flowX1 - flowX0;
      for (let i = 0; i < total; i++) {
        const q = particulas[i];
        const a = smooth(clamp01((progress - 0.06 - q.delayFluxo * 0.12) / 0.22));
        const b = smoother(clamp01((progress - 0.42 - q.delaySimbolo * 0.2) / 0.16));
        bs[i] = b;
        // Na abertura as partículas surgem uma a uma, subindo de leve até a posição.
        const e = smooth(clamp01((t - 0.1 - q.delayEntrada) / 0.7));
        es[i] = e;
        const chx = lerp(x0Caos, w, q.cx) + Math.sin(t * q.speed + q.phase) * q.amp;
        const chy = lerp(y0Caos, y1Caos, q.cy) + Math.cos(t * q.speed * 0.8 + q.phase * 1.3) * q.amp;
        const fx = flowX0 + ((q.lx + t * (0.02 + q.speed * 0.04)) % 1) * span;
        const fy = yFaixa(q.lane) + q.ly * laneGap * 0.12;
        xs[i] = lerp(lerp(chx, fx, a), symX + q.sx * symH, b);
        ys[i] = lerp(lerp(chy, fy, a), symY + q.sy * symH, b) + (1 - e) * 24;
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

      const visiveis = 1 - fillA;
      if (visiveis > 0.01) desenharRede(visiveis);
      apagarAreasDeTexto(1 - formacao);

      desenharCamada(ctx, camada, g, fillA);

      // Quando o símbolo termina de se preencher, uma faixa de luz passa por ele uma única vez.
      if (fillA > 0.92 && reflexoArmado) {
        reflexoArmado = false;
        reflexoInicio = t;
      } else if (fillA < 0.3) {
        reflexoArmado = true;
        reflexoInicio = -1;
      }
      const r = reflexoInicio < 0 ? 1 : clamp01((t - reflexoInicio) / DURACAO_REFLEXO);
      reflexo?.(ctx, g, smoother(r), fillA);
      return r < 1;
    },
  };
};
