import { ScrollTrigger, getLenis, reduceMotion } from './motion';

// Fio condutor: uma linha dourada que atravessa as seções da home conforme a rolagem
// e acende cada ponto marcado com data-fio-no por onde passa.

// Altura da tela (fração) em que fica a ponta do fio enquanto ele é desenhado.
const CABECA = 0.62;
const RAIO = 32;
const PASSO = 6;
// Trechos laterais consomem parte da rolagem, senão as curvas largas passariam num instante.
const PESO_LATERAL = 0.35;
const NS = 'http://www.w3.org/2000/svg';

type Ponto = [number, number];

type No = { el: HTMLElement; len: number; circulo: SVGCircleElement; aceso: boolean };

type Trecho = {
  section: HTMLElement;
  tipo: string;
  trilho: SVGPathElement;
  linha: SVGPathElement;
  ponta: SVGGElement;
  grupoNos: SVGGElement;
  nos: No[];
  total: number;
  lens: Float32Array;
  xs: Float32Array;
  ys: Float32Array;
  ss: Float32Array;
  // No método do desktop a seção fica presa: o trecho vertical, o horizontal e a saída seguem o progresso do pin.
  pin: { vertical: number; horizontal: number; barY: number } | null;
  desenhado: number;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function arredondado(pontos: Ponto[], raio = RAIO) {
  let d = `M${pontos[0][0]} ${pontos[0][1]}`;
  for (let i = 1; i < pontos.length - 1; i++) {
    const [ax, ay] = pontos[i - 1];
    const [px, py] = pontos[i];
    const [bx, by] = pontos[i + 1];
    const la = Math.hypot(px - ax, py - ay);
    const lb = Math.hypot(bx - px, by - py);
    const r = Math.min(raio, la / 2, lb / 2);
    d += ` L${px - ((px - ax) / la) * r} ${py - ((py - ay) / la) * r}`;
    d += ` Q${px} ${py} ${px + ((bx - px) / lb) * r} ${py + ((by - py) / lb) * r}`;
  }
  const [ux, uy] = pontos[pontos.length - 1];
  return `${d} L${ux} ${uy}`;
}

// Posição do elemento dentro da seção, sem contar transforms das animações de entrada.
function posicao(el: HTMLElement, secao: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== secao) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

function busca(arr: Float32Array, valor: number) {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < valor) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function criarTrecho(section: HTMLElement): Trecho {
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('fio');
  svg.setAttribute('aria-hidden', 'true');
  const trilho = document.createElementNS(NS, 'path');
  trilho.classList.add('fio-trilho');
  const linha = document.createElementNS(NS, 'path');
  linha.classList.add('fio-linha');
  const grupoNos = document.createElementNS(NS, 'g');
  const ponta = document.createElementNS(NS, 'g');
  ponta.classList.add('fio-ponta');
  const halo = document.createElementNS(NS, 'circle');
  halo.setAttribute('r', '11');
  halo.classList.add('fio-ponta-halo');
  const nucleo = document.createElementNS(NS, 'circle');
  nucleo.setAttribute('r', '4');
  ponta.append(halo, nucleo);
  svg.append(trilho, linha, grupoNos, ponta);
  section.prepend(svg);
  return {
    section,
    tipo: section.dataset.fio ?? '',
    trilho,
    linha,
    ponta,
    grupoNos,
    nos: [],
    total: 0,
    lens: new Float32Array(0),
    xs: new Float32Array(0),
    ys: new Float32Array(0),
    ss: new Float32Array(0),
    pin: null,
    desenhado: -1,
  };
}

function rota(t: Trecho, desktop: boolean) {
  const { section } = t;
  const w = section.clientWidth;
  const h = section.offsetHeight;
  const container = section.querySelector<HTMLElement>('.container-site');
  let esquerda = 24;
  let direita = w - 24;
  if (container) {
    const estilo = getComputedStyle(container);
    const x = posicao(container, section).x;
    esquerda = x + parseFloat(estilo.paddingLeft);
    direita = x + container.clientWidth - parseFloat(estilo.paddingRight);
  }
  const L = esquerda - Math.min(48, esquerda / 2);
  const R = direita + Math.min(48, (w - direita) / 2);
  t.pin = null;
  section.style.removeProperty('--fio-corte-de');
  section.style.removeProperty('--fio-corte-ate');

  if (t.tipo === 'manifesto') {
    const hero = document.querySelector<HTMLElement>('[data-hero-caos]');
    const ponta = Number(hero?.dataset.simboloPonta);
    const folga = Number(hero?.dataset.simboloFolga);
    const primeiro = section.querySelector<HTMLElement>('[data-fio-no]');
    const y1 = primeiro ? Math.max(60, posicao(primeiro, section).y - 40) : 120;
    // No desktop o fio nasce na ponta da barra de ouro do símbolo do hero, logo acima da seção.
    if (desktop && hero?.hasAttribute('data-simbolo-desktop') && Number.isFinite(ponta) && Number.isFinite(folga)) {
      return `M${ponta} ${-folga} L${ponta} 0 C${ponta} ${y1 * 0.65} ${L} ${y1 * 0.35} ${L} ${y1} L${L} ${h}`;
    }
    return `M${L} 0 L${L} ${h}`;
  }

  if (t.tipo === 'metodo' && desktop) {
    const barra = section.querySelector<HTMLElement>('[data-fio-barra]');
    if (barra && barra.offsetParent) {
      const barY = posicao(barra, section).y;
      const medidor = document.createElementNS(NS, 'path');
      medidor.setAttribute('d', arredondado([[L, 0], [L, barY], [R, barY]]));
      t.trilho.ownerSVGElement?.append(medidor);
      const ateHorizontal = medidor.getTotalLength();
      medidor.remove();
      t.pin = { vertical: barY - RAIO, horizontal: ateHorizontal - RAIO, barY };
      // As etapas deslizam por baixo do trecho vertical; elas somem antes de cruzar a linha.
      section.style.setProperty('--fio-corte-de', `${L + 4}px`);
      section.style.setProperty('--fio-corte-ate', `${Math.max(L + 8, Math.min(esquerda, L + 56))}px`);
      return arredondado([[L, 0], [L, barY], [R, barY], [R, h]]);
    }
  }

  const x = desktop && t.tipo !== 'metodo' ? R : L;

  if (t.tipo === 'encerramento') {
    const fim = section.querySelector<HTMLElement>('[data-fio-fim]');
    if (fim) {
      const p = posicao(fim, section);
      const cy = p.y + fim.offsetHeight / 2;
      const chegada = x > p.x ? p.x + fim.offsetWidth + 12 : p.x - 12;
      return arredondado([[x, 0], [x, cy], [chegada, cy]]);
    }
  }

  return `M${x} 0 L${x} ${h}`;
}

function layoutTrecho(t: Trecho, desktop: boolean) {
  const d = rota(t, desktop);
  t.trilho.setAttribute('d', d);
  t.linha.setAttribute('d', d);
  const total = t.linha.getTotalLength();
  t.total = total;
  t.linha.style.strokeDasharray = `${total} ${total + 10}`;

  const n = Math.max(2, Math.ceil(total / PASSO) + 1);
  t.lens = new Float32Array(n);
  t.xs = new Float32Array(n);
  t.ys = new Float32Array(n);
  t.ss = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const len = (total * i) / (n - 1);
    const p = t.linha.getPointAtLength(len);
    t.lens[i] = len;
    t.xs[i] = p.x;
    t.ys[i] = p.y;
    t.ss[i] = i === 0 ? p.y : t.ss[i - 1] + Math.max(0, p.y - t.ys[i - 1]) + PESO_LATERAL * Math.abs(p.x - t.xs[i - 1]);
  }
  // Normaliza para que o fim do trecho coincida com o fim da seção e a passagem para a seção seguinte seja contínua.
  const y0 = t.ys[0];
  const escala = (t.ys[n - 1] - y0) / Math.max(1, t.ss[n - 1] - y0);
  for (let i = 0; i < n; i++) t.ss[i] = y0 + (t.ss[i] - y0) * escala;

  t.grupoNos.replaceChildren();
  t.nos = [];
  const elementos = [...t.section.querySelectorAll<HTMLElement>('[data-fio-no]')].filter(
    (el) => el.offsetParent && !(desktop && el.dataset.fioNo === 'celular'),
  );
  for (const el of elementos) {
    const y = posicao(el, t.section).y + Math.min(32, el.offsetHeight / 2);
    const i = busca(t.ys, y);
    if (t.ys[i] < y - PASSO * 2) continue;
    const circulo = document.createElementNS(NS, 'circle');
    circulo.classList.add('fio-no');
    circulo.setAttribute('cx', String(t.xs[i]));
    circulo.setAttribute('cy', String(t.ys[i]));
    circulo.setAttribute('r', '4.5');
    t.grupoNos.append(circulo);
    t.nos.push({ el, len: t.lens[i], circulo, aceso: false });
  }
  const fim = t.section.querySelector<HTMLElement>('[data-fio-fim]');
  if (fim) t.nos.push({ el: fim, len: total - 1, circulo: document.createElementNS(NS, 'circle'), aceso: false });
  t.desenhado = -1;
}

function comprimentoAte(t: Trecho, yLimite: number) {
  if (yLimite <= t.ss[0]) return 0;
  const i = busca(t.ss, yLimite);
  if (i === 0) return 0;
  const s0 = t.ss[i - 1];
  const s1 = t.ss[i];
  const f = s1 > s0 ? clamp((yLimite - s0) / (s1 - s0), 0, 1) : 1;
  return lerp(t.lens[i - 1], t.lens[i], f);
}

function aplicar(t: Trecho, desenhado: number, comPonta: boolean) {
  const d = clamp(desenhado, 0, t.total);
  if (Math.abs(d - t.desenhado) < 0.3) return;
  t.desenhado = d;
  t.linha.style.strokeDashoffset = String(t.total - d);

  const mostrarPonta = comPonta && d > 0.5 && d < t.total - 0.5;
  t.ponta.style.opacity = mostrarPonta ? '1' : '0';
  if (mostrarPonta) {
    const i = Math.min(t.lens.length - 1, Math.round((d / t.total) * (t.lens.length - 1)));
    t.ponta.setAttribute('transform', `translate(${t.xs[i]} ${t.ys[i]})`);
  }

  for (const no of t.nos) {
    const aceso = d >= no.len;
    if (aceso === no.aceso) continue;
    no.aceso = aceso;
    no.circulo.classList.toggle('is-aceso', aceso);
    no.el.classList.toggle('fio-aceso', aceso);
  }
}

export function initFio() {
  const secoes = [...document.querySelectorAll<HTMLElement>('[data-fio]')];
  if (!secoes.length) return;
  const trechos = secoes.map(criarTrecho);
  const desktopQuery = window.matchMedia('(min-width: 64rem)');

  const atualizar = () => {
    if (reduceMotion) {
      for (const t of trechos) aplicar(t, t.total, false);
      return;
    }
    const vh = window.innerHeight;
    const linhaCabeca = CABECA * vh;
    // Todas as leituras antes das escritas, para não forçar um novo cálculo de layout a cada seção.
    const topos = trechos.map((t) => t.section.getBoundingClientRect().top);
    trechos.forEach((t, indice) => {
      const yLimite = linhaCabeca - topos[indice];
      let d: number;
      if (t.pin) {
        const progresso = Number(t.section.dataset.fioPin ?? 0);
        const { vertical, horizontal, barY } = t.pin;
        if (progresso <= 0) d = Math.min(comprimentoAte(t, yLimite), vertical);
        else if (progresso < 1) {
          d = lerp(Math.min(linhaCabeca, vertical), vertical, clamp(progresso / 0.12, 0, 1));
          d += (horizontal - vertical) * clamp((progresso - 0.12) / 0.88, 0, 1);
        } else d = horizontal + Math.max(0, yLimite - barY);
      } else {
        d = comprimentoAte(t, yLimite);
      }
      aplicar(t, d, true);
    });
  };

  let agendado = 0;
  const layout = () => {
    agendado = 0;
    const desktop = desktopQuery.matches;
    for (const t of trechos) layoutTrecho(t, desktop);
    atualizar();
  };
  const agendarLayout = () => {
    if (!agendado) agendado = requestAnimationFrame(layout);
  };

  // A primeira medição espera o próximo quadro para não forçar um cálculo de layout no meio do carregamento.
  agendarLayout();
  const observador = new ResizeObserver(agendarLayout);
  secoes.forEach((s) => observador.observe(s));
  window.addEventListener('resize', agendarLayout);
  window.addEventListener('aurion:simbolo', agendarLayout);
  ScrollTrigger.addEventListener('refresh', agendarLayout);

  if (reduceMotion) return;
  const lenis = getLenis();
  if (lenis) lenis.on('scroll', atualizar);
  else window.addEventListener('scroll', atualizar, { passive: true });
}
