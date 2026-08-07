document.querySelectorAll('.tarjeta').forEach((tarjeta) => {
  tarjeta.addEventListener('pointermove', (evento) => {
    const rect = tarjeta.getBoundingClientRect();
    tarjeta.style.setProperty('--x', `${evento.clientX - rect.left}px`);
    tarjeta.style.setProperty('--y', `${evento.clientY - rect.top}px`);
  });
});

const pagina = document.querySelector('main');
const unidad = [...document.body.classList, ...(pagina?.classList || [])]
  .find((clase) => /^unidad-[123]-pagina$/.test(clase))?.match(/unidad-(\d)/)?.[1];

document.body.insertAdjacentHTML('afterbegin', '<div class="pantalla-carga" aria-live="polite"><span>✦ CARGANDO MUNDO... ✦</span></div>');
window.addEventListener('load', () => setTimeout(() => document.body.classList.add('cargado'), 350));

const botonAudio = document.createElement('button');
botonAudio.className = 'boton-audio';
botonAudio.type = 'button';
botonAudio.setAttribute('aria-pressed', 'true');
botonAudio.innerHTML = '🔊 <span>SONIDO</span>';
document.body.append(botonAudio);

const sonidoFondo = new Audio('assets/sonido-fondo.mp4');
sonidoFondo.loop = true;
sonidoFondo.volume = .35;
sonidoFondo.autoplay = true;
const sonidoActivoGuardado = sessionStorage.getItem('sonido-activo');
const tiempoGuardado = Number(sessionStorage.getItem('sonido-tiempo') || 0);
if (tiempoGuardado > 0) sonidoFondo.addEventListener('loadedmetadata', () => { sonidoFondo.currentTime = tiempoGuardado; }, { once: true });
const iniciarSonido = async () => {
  if (sonidoActivoGuardado === 'false') {
    botonAudio.innerHTML = '🔇 <span>SONIDO</span>';
    botonAudio.setAttribute('aria-pressed', 'false');
    return;
  }
  try {
    await sonidoFondo.play();
    botonAudio.innerHTML = '🔊 <span>SONIDO</span>';
    botonAudio.setAttribute('aria-pressed', 'true');
  } catch {
    botonAudio.innerHTML = '🔇 <span>ACTIVAR SONIDO</span>';
    botonAudio.setAttribute('aria-pressed', 'false');
  }
};
window.addEventListener('load', iniciarSonido, { once: true });
botonAudio.addEventListener('click', async () => {
  if (!sonidoFondo.paused) {
    sonidoFondo.pause();
    sessionStorage.setItem('sonido-activo', 'false');
    botonAudio.innerHTML = '🔇 <span>SONIDO</span>';
    botonAudio.setAttribute('aria-pressed', 'false');
    return;
  }
  try {
    await sonidoFondo.play();
    sessionStorage.setItem('sonido-activo', 'true');
    botonAudio.innerHTML = '🔊 <span>SONIDO</span>';
    botonAudio.setAttribute('aria-pressed', 'true');
  } catch {
    botonAudio.innerHTML = '⚠️ <span>TOCA PARA SONIDO</span>';
  }
});
window.addEventListener('pagehide', () => {
  sessionStorage.setItem('sonido-tiempo', String(sonidoFondo.currentTime));
  sessionStorage.setItem('sonido-activo', String(!sonidoFondo.paused));
});

pagina?.insertAdjacentHTML('beforeend', '<footer class="pie-pagina"><span>✦ PORTAFOLIO ACADÉMICO ✦</span><span>Mateo Joel Galarza Villamarin · Ingeniería en Software</span><a href="mailto:mateogalarza665@gmail.com">mateogalarza665@gmail.com</a></footer>');

const actualizarPortada = () => {
  document.querySelectorAll('.tarjeta[href^="unidad-"]').forEach((tarjeta) => {
    const id = tarjeta.getAttribute('href').match(/unidad-(\d)/)?.[1];
    const total = { 1: 5, 2: 4, 3: 5 }[id];
    const completados = JSON.parse(localStorage.getItem(`progreso-unidad-${id}`) || '[]').length;
    tarjeta.querySelector('.progreso-portada')?.remove();
    const destino = tarjeta.querySelector('.calificacion');
    (destino || tarjeta).insertAdjacentHTML(destino ? 'beforebegin' : 'beforeend', `<span class="progreso-portada">${completados}/${total} TEMAS</span>`);
  });
};

if (unidad) {
  const temas = [...document.querySelectorAll('.tema')];
  const clave = `progreso-unidad-${unidad}`;
  const leidos = new Set(JSON.parse(localStorage.getItem(clave) || '[]'));
  const instruccion = document.querySelector('.instruccion');
  instruccion?.insertAdjacentHTML('afterend', '<div class="progreso-unidad"><span class="progreso-texto"></span><div class="barra-progreso"><i></i></div><button type="button" class="reiniciar-progreso">REINICIAR</button></div>');
  const actualizarProgreso = () => {
    const porcentaje = temas.length ? leidos.size / temas.length * 100 : 0;
    document.querySelector('.progreso-texto').textContent = `${leidos.size}/${temas.length} TEMAS EXPLORADOS`;
    document.querySelector('.barra-progreso i').style.width = `${porcentaje}%`;
    temas.forEach((tema, indice) => tema.classList.toggle('completado', leidos.has(indice)));
    localStorage.setItem(clave, JSON.stringify([...leidos]));
  };
  temas.forEach((tema, indice) => tema.addEventListener('click', () => { leidos.add(indice); actualizarProgreso(); }));
  document.querySelector('.reiniciar-progreso')?.addEventListener('click', () => { leidos.clear(); actualizarProgreso(); });
  actualizarProgreso();
} else {
  actualizarPortada();
}
