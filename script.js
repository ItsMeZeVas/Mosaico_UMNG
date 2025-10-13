const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyuSShIX_-wTmrL5AwAnnk5C4xFWWHGYx4pyeFNMP3zq_RYf4RSkm8P_0FyhcmnWVgj/exec";

// ===== CONFIGURACIÓN =====
const filas = 12;
const columnas = 17;
const REFRESCO_MS = 30000; // cada cuánto se muestran las precargadas
const PRECARGA_MS = 5000;  // cada cuánto se precargan nuevas

const BORDES_ACTIVOS = true;
const BORDER_SIZE = 5;
const BORDER_COLOR = "white";

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
  el.style.display = "grid";
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

      if(BORDES_ACTIVOS){
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
let animacionTipo = 0; // alterna animaciones

// ===== Refresco con animaciones alternas =====
function refrescar(){
  if(!fotosActuales.length) return;

  const letraIM = document.getElementById("letraIM");
  const imgs = Array.from(letraIM.querySelectorAll("img"));

  imgs.forEach(img => img.classList.add("fade-out"));

  setTimeout(() => {
    // Actualizar imágenes sin recrear grid
    imgs.forEach((img, i) => {
      const foto = fotosActuales[i % fotosActuales.length];
      img.src = foto.thumb;
      img.dataset.big = foto.big;
    });

    // Animaciones alternas
    if(animacionTipo === 0){
      // Abajo hacia arriba
      for(let row = filas-1; row>=0; row--){
        for(let col=0; col<columnas; col++){
          const index = row*columnas + col;
          const img = imgs[index];
          if(!img) continue;
          const delay = (filas-1-row)*100 + col*10;
          setTimeout(()=>{
            img.classList.remove("fade-out");
            img.classList.add("fade-in");
            setTimeout(()=>img.classList.remove("fade-in"), 600);
          }, delay);
        }
      }
    } else if(animacionTipo === 1){
      // Izquierda a derecha
      imgs.forEach((img,i)=>{
        setTimeout(()=>{
          img.classList.remove("fade-out");
          img.classList.add("fade-in");
          setTimeout(()=>img.classList.remove("fade-in"),600);
        }, i*50);
      });
    } else {
      // Aleatoria por fila
      for(let row=0; row<filas; row++){
        const rowImgs = imgs.slice(row*columnas, (row+1)*columnas);
        const shuffledRow = shuffle(rowImgs);
        shuffledRow.forEach((img,i)=>{
          setTimeout(()=>{
            img.classList.remove("fade-out");
            img.classList.add("fade-in");
            setTimeout(()=>img.classList.remove("fade-in"),600);
          }, i*50 + row*50);
        });
      }
    }

    animacionTipo = (animacionTipo + 1) % 3;
  }, 600);
}

// ===== Precarga =====
function precargar(){
  fetch(SCRIPT_URL)
    .then(r=>r.json())
    .then(fotos=>{
      fotosPrecargadas = fotos;
      console.log("✅ Precargadas nuevas imágenes");
    });
}

// ===== Cambio automático =====
function cambiar(){
  if(fotosPrecargadas.length){
    fotosActuales = fotosPrecargadas;
    fotosPrecargadas = [];
    refrescar();
    precargar();
  }
}

// ===== Ajuste de tamaño =====
function ajustarTamano(){
  cellSize = calcCellSize();
  document.documentElement.style.setProperty('--cell-size', cellSize+'px');
  configurarGrid(document.getElementById("letraIM"), filas, columnas);
}
window.addEventListener('resize', ajustarTamano);

// ===== Carga inicial =====
fetch(SCRIPT_URL)
  .then(r=>r.json())
  .then(fotos=>{
    fotosActuales = fotos;
    ajustarTamano();
    const letraIM = document.getElementById("letraIM");
    crearMatriz(letraIM, matrizIM, filas, columnas, fotosActuales);
    refrescar();

    setTimeout(precargar, PRECARGA_MS);
    setInterval(cambiar, REFRESCO_MS);
  });
