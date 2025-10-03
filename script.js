const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyuSShIX_-wTmrL5AwAnnk5C4xFWWHGYx4pyeFNMP3zq_RYf4RSkm8P_0FyhcmnWVgj/exec";

// ===== CONFIGURACIÓN =====
const filas = 12;
const columnas = 17;
const REFRESCO_MS = 30000; // cada cuánto se muestran las precargadas
const PRECARGA_MS = 5000;  // cada cuánto se precargan nuevas

// ⚙️ Configuración de bordes
const BORDES_ACTIVOS = true;
const BORDER_SIZE = 5;
const BORDER_COLOR = "white";

// ===== MATRIZ =====
const matrizIM = [
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
  1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,
  1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,
  1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,
  1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,
  1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,
  1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,
  1,1,1,0,0,1,1,1,0,0,1,1,0,0,1,1,1,
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
];

// ===== Tamaño dinámico =====
function calcCellSize() {
  const maxCellW = window.innerWidth / 30;
  const maxCellH = window.innerHeight / 20;
  return Math.min(maxCellW, maxCellH);
}
let cellSize = calcCellSize();

function configurarGrid(el, filas, columnas){
  el.style.gridTemplateRows    = `repeat(${filas}, ${cellSize}px)`;
  el.style.gridTemplateColumns = `repeat(${columnas}, ${cellSize}px)`;
}

// ===== Utilidad =====
function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== Modal =====
const modal     = document.getElementById("modal");
const modalImg  = document.getElementById("modal-img");
const cerrarBtn = document.querySelector(".cerrar");

function abrirModal(src){
  modalImg.classList.remove("visible");
  const temp = new Image();
  temp.onload = () => {
    modalImg.src = src;
    modal.classList.add("mostrar");
    requestAnimationFrame(()=> modalImg.classList.add("visible"));
  };
  temp.src = src;
}

function cerrarModal(){
  modalImg.classList.remove("visible");
  modal.classList.remove("mostrar");
  setTimeout(()=>{ modalImg.src = ""; }, 400);
}

cerrarBtn.onclick = cerrarModal;
modal.addEventListener("click", e=>{ if(e.target === modal) cerrarModal(); });

// ===== Construcción del mosaico =====
function crearMatriz(container, matriz, filas, columnas, fotos){
  container.innerHTML = "";
  configurarGrid(container, filas, columnas);

  let imgs = shuffle(fotos);
  let total = matriz.filter(v=>v===1).length;
  while(imgs.length < total){
    imgs = imgs.concat(shuffle(fotos));
  }

  let indexFoto = 0;
  for(let i=0; i<matriz.length; i++){
    const row = Math.floor(i / columnas);
    const col = i % columnas;

    const cell = document.createElement("div");
    if(matriz[i] === 1){
      let img = document.createElement("img");
      img.src = imgs[indexFoto % imgs.length].thumb;
      img.dataset.big = imgs[indexFoto % imgs.length].big;
      img.addEventListener("click", e=> abrirModal(e.target.dataset.big));

      if (BORDES_ACTIVOS) {
        let borde = "";
        if(row === 0 || matriz[(row-1)*columnas + col] === 0) borde += `border-top:${BORDER_SIZE}px solid ${BORDER_COLOR};`;
        if(row === filas-1 || matriz[(row+1)*columnas + col] === 0) borde += `border-bottom:${BORDER_SIZE}px solid ${BORDER_COLOR};`;
        if(col === 0 || matriz[row*columnas + (col-1)] === 0) borde += `border-left:${BORDER_SIZE}px solid ${BORDER_COLOR};`;
        if(col === columnas-1 || matriz[row*columnas + (col+1)] === 0) borde += `border-right:${BORDER_SIZE}px solid ${BORDER_COLOR};`;
        img.style = borde;
      }

      cell.appendChild(img);
      indexFoto++;
    }
    container.appendChild(cell);
  }
}

// ===== Cachés =====
let fotosActuales = [];
let fotosPrecargadas = [];

// ===== Refresco =====
function refrescar(){
  if(!fotosActuales.length) return;

  const letraIM = document.getElementById("letraIM");
  letraIM.classList.add("fade-out");

  setTimeout(()=>{
    crearMatriz(letraIM, matrizIM, filas, columnas, fotosActuales);
    letraIM.classList.remove("fade-out");
    letraIM.classList.add("fade-in");
    setTimeout(()=> letraIM.classList.remove("fade-in"), 600);
  }, 600);
}

// ===== Precarga de imágenes =====
function precargar(){
  fetch(SCRIPT_URL)
    .then(r=>r.json())
    .then(fotos=>{
      fotosPrecargadas = fotos;
      console.log("✅ Precargadas nuevas imágenes");
    });
}

// ===== Cambio cada 30s =====
function cambiar(){
  if(fotosPrecargadas.length){
    fotosActuales = fotosPrecargadas;
    fotosPrecargadas = [];
    refrescar();
    precargar(); // volvemos a precargar para el próximo ciclo
  }
}

// ===== Ajuste de tamaño dinámico =====
function ajustarTamano() {
  cellSize = calcCellSize();
  document.documentElement.style.setProperty('--cell-size', cellSize + 'px');
  configurarGrid(document.getElementById("letraIM"), filas, columnas);
}
window.addEventListener('resize', ajustarTamano);

// ===== Carga inicial =====
fetch(SCRIPT_URL)
  .then(r=>r.json())
  .then(fotos=>{
    fotosActuales = fotos;
    ajustarTamano();
    refrescar();

    // después de 5s empieza a precargar
    setTimeout(precargar, PRECARGA_MS);

    // cada 30s cambiamos imágenes
    setInterval(cambiar, REFRESCO_MS);
  });
