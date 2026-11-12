import { ScrollTrigger, getLenis, reduceMotion } from './motion';

// Contornos oficiais das duas barras do símbolo, no sistema de coordenadas do favicon.svg.
const D_CONCRETO =
  'M221.84,572.62l-91.66-.24c-8.23-.02-15.97-7.68-15.97-16.1V124.81c0-8.24,7.86-16,16.02-16.01l93.7-.09c9.87,0,16.54,8.88,16.54,18.21l-.02,429.55c-1.27,9.74-8.62,16.17-18.6,16.14Z';
const D_OURO =
  'M588.52,484.57l-45.69,85.56c-1.01,1.89-3.18,2.89-4.81,3.12-1.9.26-4.81-.3-5.94-2.19l-28.93-48.37-39.49-66.31-98.62-166.12-81.91-140.52-18.48-31.94c-1.07-1.85-.31-4.85.65-6.32,1.02-1.57,3.02-2.91,5.44-2.91l118.4-.04c6.22,0,9.7,2.77,12.75,7.86l124.98,208.96,42.38,71.39,31.52,53.24c1.66,2.8,2.04,7.37.57,10.16l-12.82,24.44Z';
const PATH_CONCRETO = new Path2D(D_CONCRETO);
const PATH_OURO = new Path2D(D_OURO);
const SIMBOLO = { x: 114, y: 109, w: 489, h: 464 };
const MARGEM_CAMADA = 60;

// A animação inteira leva no mínimo ~3,5 s, por mais rápido que a página seja rolada.
const VELOCIDADE_MAX = 0.28;
const VELOCIDADE_MIN = 0.08;
const SUAVIZACAO = 5;
// Quanto a rolagem pode ficar à frente da animação antes de ser segurada.
const FOLGA_ROLAGEM = 0.05;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => v * v * (3 - 2 * v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Geometria = {
  w: number;
  h: number;
  dpr: number;
  desktop: boolean;
  symX: number;
  symY: number;
  symW: number;
  symH: number;
  // Áreas com texto que a rede não deve cobrir: base da legenda das fases, fim do texto à esquerda
  // (só no desktop) e topo do texto (só no celular).
  legendaBase: number;
  textoDir: number;
  textoTopo: number;
};

type Quadro = { progress: number; t: number; intro: number };

export type Cena = {
  layout(g: Geometria): void;
  // Retorna true enquanto houver animação própria da cena, mesmo com a rolagem parada.
  draw(q: Quadro): boolean | void;
};

export type CriarCena = (section: HTMLElement, canvas: HTMLCanvasElement) => Cena | null;

export type PontoContorno = { sx: number; sy: number; ouro: boolean; pos: number };

// Pontos em intervalos iguais ao longo do contorno das duas barras, em unidades da altura do símbolo.
export function amostrarContorno(count: number) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
  const paths = [D_CONCRETO, D_OURO].map((d) => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    svg.append(p);
    return p;
  });
  document.body.append(svg);
  const lens = paths.map((p) => p.getTotalLength());
  const total = lens[0] + lens[1];

  const pontos: PontoContorno[] = [];
  for (let i = 0; i < count; i++) {
    const pos = ((i + 0.5) / count) * total;
    const ouro = pos >= lens[0];
    const path = paths[ouro ? 1 : 0];
    const p = path.getPointAtLength(ouro ? pos - lens[0] : pos);
    pontos.push({
      sx: (p.x - SIMBOLO.x) / SIMBOLO.h,
      sy: (p.y - SIMBOLO.y) / SIMBOLO.h,
      ouro,
      pos: pos / total,
    });
  }

  svg.remove();
  return { pontos, perimetro: total };
}

// O símbolo oficial preenchido, com sombra, desenhado uma vez numa camada separada.
export function criarCamadaSimbolo(g: Geometria) {
  const camada = document.createElement('canvas');
  camada.width = Math.ceil((g.symW + MARGEM_CAMADA * 2) * g.dpr);
  camada.height = Math.ceil((g.symH + MARGEM_CAMADA * 2) * g.dpr);
  const c = camada.getContext('2d');
  if (!c) return null;
  const k = (g.symH / SIMBOLO.h) * g.dpr;
  c.setTransform(k, 0, 0, k, MARGEM_CAMADA * g.dpr - SIMBOLO.x * k, MARGEM_CAMADA * g.dpr - SIMBOLO.y * k);
  c.shadowColor = 'rgb(214 180 100 / 0.35)';
  c.shadowBlur = 40 * (g.symH / SIMBOLO.h) * g.dpr;

  const concreto = c.createLinearGradient(0, 109, 0, 573);
  concreto.addColorStop(0, '#e6dfd3');
  concreto.addColorStop(1, '#8f887d');
  c.fillStyle = concreto;
  c.fill(PATH_CONCRETO);

  const ouro = c.createLinearGradient(266, 109, 603, 572);
  ouro.addColorStop(0, '#f1d98f');
  ouro.addColorStop(0.55, '#c6a256');
  ouro.addColorStop(1, '#8c6a2c');
  c.fillStyle = ouro;
  c.fill(PATH_OURO);
  return camada;
}

export function desenharCamada(ctx: CanvasRenderingContext2D, camada: HTMLCanvasElement | null, g: Geometria, alpha: number) {
  if (alpha <= 0.01 || !camada) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    camada,
    g.symX - MARGEM_CAMADA,
    g.symY - MARGEM_CAMADA,
    g.symW + MARGEM_CAMADA * 2,
    g.symH + MARGEM_CAMADA * 2,
  );
  ctx.globalAlpha = 1;
}

// Faixa de luz que atravessa o símbolo na diagonal, recortada pelo próprio desenho dele.
export function criarReflexo(camada: HTMLCanvasElement | null) {
  if (!camada) return null;
  const tela = document.createElement('canvas');
  tela.width = camada.width;
  tela.height = camada.height;
  const c = tela.getContext('2d');
  if (!c) return null;
  return (ctx: CanvasRenderingContext2D, g: Geometria, posicao: number, alpha: number) => {
    if (alpha <= 0.01 || posicao <= 0 || posicao >= 1) return;
    const { width: lw, height: lh } = tela;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, lw, lh);
    c.drawImage(camada, 0, 0);
    c.globalCompositeOperation = 'source-in';
    const largura = lw * 0.35;
    const x = lerp(-largura, lw + largura, posicao);
    const faixa = c.createLinearGradient(x - largura, lh * 0.2, x + largura, lh * 0.8);
    faixa.addColorStop(0, 'rgb(255 246 220 / 0)');
    faixa.addColorStop(0.5, 'rgb(255 246 220 / 0.55)');
    faixa.addColorStop(1, 'rgb(255 246 220 / 0)');
    c.fillStyle = faixa;
    c.fillRect(0, 0, lw, lh);
    ctx.globalAlpha = alpha;
    ctx.drawImage(tela, g.symX - MARGEM_CAMADA, g.symY - MARGEM_CAMADA, g.symW + MARGEM_CAMADA * 2, g.symH + MARGEM_CAMADA * 2);
    ctx.globalAlpha = 1;
  };
}

export function criarBrilho(ctx: CanvasRenderingContext2D, g: Geometria) {
  const bx = g.symX + g.symW / 2;
  const by = g.symY + g.symH;
  const brilho = ctx.createRadialGradient(bx, by, 0, bx, by, g.symW * 0.9);
  brilho.addColorStop(0, 'rgb(198 160 80 / 0.35)');
  brilho.addColorStop(1, 'rgb(198 160 80 / 0)');
  return brilho;
}

export function desenharBrilho(ctx: CanvasRenderingContext2D, brilho: CanvasGradient | null, g: Geometria, alpha: number) {
  if (alpha <= 0.01 || !brilho) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = brilho;
  ctx.fillRect(g.symX - g.symW, g.symY, g.symW * 3, g.symH * 1.6);
  ctx.globalAlpha = 1;
}

// Borda direita do texto de fato (linhas e botões), já que os blocos ocupam a largura toda do container.
function fimDoTexto(raiz: HTMLElement) {
  let direita = 0;
  const range = document.createRange();
  const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const no = walker.currentNode;
    if (!no.textContent?.trim()) continue;
    range.selectNodeContents(no);
    direita = Math.max(direita, range.getBoundingClientRect().right);
  }
  raiz.querySelectorAll('a').forEach((a) => {
    if (a.offsetParent) direita = Math.max(direita, a.getBoundingClientRect().right);
  });
  return direita;
}

export function prepararCanvas2d(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, g: Geometria) {
  canvas.width = Math.round(g.w * g.dpr);
  canvas.height = Math.round(g.h * g.dpr);
  ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
}

export function initHeroCaos(section: HTMLElement, criarCena: CriarCena) {
  const canvas = section.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  if (!canvas) return;
  const cena = criarCena(section, canvas);
  if (!cena) return;

  const fases = [...section.querySelectorAll<HTMLElement>('[data-fase]')];
  const barra = section.querySelector<HTMLElement>('[data-fase-barra]');
  const cue = section.querySelector<HTMLElement>('[data-scroll-cue]');
  const texto = section.querySelector<HTMLElement>('[data-hero-texto]');
  const legenda = section.querySelector<HTMLElement>('[data-hero-fases]');

  let progress = reduceMotion ? 1 : 0;
  let target = progress;
  let faseAtiva = -1;
  const start = performance.now();
  let ultimaChave = '';

  const layout = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const desktop = w >= 1024;
    const canvasTop = canvas.getBoundingClientRect().top;
    const legendaBase = legenda ? legenda.getBoundingClientRect().bottom - canvasTop : 90;
    const textoTopo = texto ? texto.getBoundingClientRect().top - canvasTop : h * 0.5;
    const textoDir = texto?.parentElement ? fimDoTexto(texto.parentElement) - canvas.getBoundingClientRect().left : 0;
    let symH: number;
    let symW: number;
    let symX: number;
    let symY: number;
    if (desktop) {
      // Faixa livre entre a legenda das fases e o menu fixo no rodapé da tela.
      const topo = legendaBase + 40;
      const livre = Math.max(h - 120 - topo, h * 0.3);
      symH = Math.min(livre, w * 0.36, 600);
      symW = symH * (SIMBOLO.w / SIMBOLO.h);
      symX = w - Math.max(40, (w - 1280) / 2) - symW;
      symY = topo + (livre - symH) / 2;
    } else {
      // No celular o símbolo ocupa só a faixa livre entre o indicador de fases e o texto.
      const topo = legendaBase + 24;
      const livre = Math.max(textoTopo - topo - 24, h * 0.18);
      symH = Math.min(livre, w * 0.6);
      symW = symH * (SIMBOLO.w / SIMBOLO.h);
      symX = (w - symW) / 2;
      symY = topo + (livre - symH) / 2;
    }
    // As animações de entrada disparam vários relayouts seguidos; sem mudança real, nada é recriado.
    const chave = [w, h, dpr, symX, symY, symH, legendaBase, textoDir, textoTopo].map((v) => v.toFixed(1)).join();
    if (chave === ultimaChave) return;
    ultimaChave = chave;
    cena.layout({ w, h, dpr, desktop, symX, symY, symW, symH, legendaBase, textoDir, textoTopo });

    // O fio condutor da home nasce na ponta inferior da barra de ouro (x = 538 no favicon.svg).
    section.dataset.simboloPonta = String(symX + ((538 - SIMBOLO.x) / SIMBOLO.h) * symH);
    section.dataset.simboloFolga = String(h - symY - symH);
    section.toggleAttribute('data-simbolo-desktop', desktop);
    window.dispatchEvent(new Event('aurion:simbolo'));
  };

  const atualizarFase = () => {
    const index = progress < 0.26 ? 0 : progress < 0.6 ? 1 : 2;
    if (index !== faseAtiva) {
      faseAtiva = index;
      fases.forEach((el, i) => el.toggleAttribute('data-active', i === index));
    }
    barra?.style.setProperty('scale', `${progress} 1`);
    if (cue) cue.style.opacity = String(1 - clamp01(progress * 25));
  };

  let animandoCena = false;
  const draw = (now: number) => {
    const t = (now - start) / 1000;
    const intro = reduceMotion ? 1 : smooth(clamp01(t / 1.4));
    animandoCena = cena.draw({ progress, t, intro }) === true;
  };

  layout();
  atualizarFase();

  let frame = 0;
  const relayout = () => {
    layout();
    if (reduceMotion || !frame) draw(performance.now());
  };
  window.addEventListener('resize', relayout);
  document.fonts?.ready.then(relayout);
  section.addEventListener('animationend', relayout);

  if (reduceMotion) {
    draw(start);
    return;
  }

  let inView = true;
  let ultimo = 0;
  const running = () => inView && document.visibilityState === 'visible';
  // Com o símbolo completo e a rolagem parada, a cena fica estática e o loop dorme.
  const parado = () => progress > 0.97 && Math.abs(target - progress) < 0.0005 && !animandoCena;

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      target = self.progress;
      resume();
    },
  });
  progress = target = trigger.progress;

  // Se a rolagem passou da animação, segura a página até ela alcançar.
  const segurarRolagem = () => {
    // Perto do fim a rolagem já fica livre; o restante da animação termina enquanto a página desce.
    if (progress + FOLGA_ROLAGEM >= 1) return;
    const permitido = trigger.start + (progress + FOLGA_ROLAGEM) * (trigger.end - trigger.start);
    const lenis = getLenis();
    if (lenis) {
      if (lenis.targetScroll > permitido + 1) lenis.scrollTo(permitido, { lerp: 0.2 });
    } else if (window.scrollY > permitido + 1) {
      window.scrollTo(0, permitido);
    }
  };

  // Barra lateral e teclado rolam a página de forma nativa. Ali a pessoa controla a posição diretamente,
  // então a rolagem não é segurada (brigaria com o arraste) e a animação acompanha sem limite de velocidade.
  const rolagemNativa = () => getLenis()?.isScrolling === 'native';
  window.addEventListener('pointerdown', (event) => {
    // Clique na barra lateral: interrompe qualquer puxão em andamento para o Lenis aceitar o arraste.
    if (event.clientX >= document.documentElement.clientWidth) getLenis()?.reset();
  });

  function loop(now: number) {
    const dt = ultimo ? Math.min((now - ultimo) / 1000, 0.05) : 0;
    ultimo = now;

    // Logo após o carregamento a cena acompanha a posição restaurada pelo navegador sem animar.
    if (now - start < 900) {
      progress = target;
    } else if (rolagemNativa()) {
      progress += (target - progress) * (1 - Math.exp(-dt * 12));
    } else {
      const diff = target - progress;
      const limite = VELOCIDADE_MAX * dt;
      // A velocidade mínima evita a cauda lenta da suavização exponencial no fim do movimento.
      const minimo = Math.min(Math.abs(diff), VELOCIDADE_MIN * dt);
      const passo = Math.max(Math.abs(diff) * (1 - Math.exp(-dt * SUAVIZACAO)), minimo);
      progress += Math.sign(diff) * Math.min(limite, passo);
      segurarRolagem();
    }

    atualizarFase();
    draw(now);
    frame = running() && !parado() ? requestAnimationFrame(loop) : 0;
    if (!frame) ultimo = 0;
  }
  function resume() {
    if (running() && !frame) frame = requestAnimationFrame(loop);
  }

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    resume();
  }).observe(section);
  document.addEventListener('visibilitychange', resume);

  frame = requestAnimationFrame(loop);
}
