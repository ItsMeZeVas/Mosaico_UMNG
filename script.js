const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmOjRGRBf1MX55GAOFI_ELCvjp0C7UfRe1_uGaZf8LLECZv664vVblBr4320rSWqp5/exec";
console.log("📸 Mosaico interactivo - por @comsolblog",SCRIPT_URL);
// ===== CONFIGURACIÓN =====
const filas = 12;
const columnas = 17;
const REFRESCO_MS = 30000;
const PRECARGA_MS = 5000;
const FACTOR = 2; // 👈 Ajusta esto (2 o 3) para aumentar la densidad

const BORDES_ACTIVOS = true;
const BORDER_SIZE = 5;
const BORDER_COLOR = "white";

const NUM_IMAGENES = 560; // 🧩 cantidad que se pedirá a tu App Script

const matrizIM = [
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
  1,1,1,0,0,1,1,1,1,0,0,0,0,1,1,1,1,
  1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,
  1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,
  1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,
  1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,
  1,1,1,0,0,1,1,1,0,1,1,1,1,0,1,1,1,
  1,1,1,0,0,1,1,1,0,0,1,1,0,0,1,1,1,
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
  1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,
];

// ===== FUNCIÓN PARA EXPANDIR DENSIDAD =====
function expandirMatriz(matriz, filas, columnas, factor) {
  const nuevaMatriz = [];
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const valor = matriz[i * columnas + j];
      for (let fi = 0; fi < factor; fi++) {
        for (let fj = 0; fj < factor; fj++) {
          const ni = i * factor + fi;
          const nj = j * factor + fj;
          const idx = ni * (columnas * factor) + nj;
          nuevaMatriz[idx] = valor === 1 ? 1 : (nuevaMatriz[idx] || 0);
        }
      }
    }
  }
  return {
    matrizExpandida: nuevaMatriz,
    nuevasFilas: filas * factor,
    nuevasColumnas: columnas * factor
  };
}

// Aplicar expansión antes de usar
const { matrizExpandida, nuevasFilas, nuevasColumnas } = expandirMatriz(matrizIM, filas, columnas, FACTOR);

// ===== Tamaño dinámico =====
function calcCellSize() {
  const maxCellW = window.innerWidth / (30 * FACTOR);
  const maxCellH = window.innerHeight / (20 * FACTOR);
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
   console.log("🖼️ Abriendo imagen:", src);
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

  const imgs = shuffle(fotos);
  const total = matriz.filter(v=>v===1).length;

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
        const BORDER_SIZE_INTERNO = 2;  // borde entre imágenes
        const BORDER_SIZE_EXTERNO = 6;  // borde del contorno general
        let borde = "";
        let bordeExterno = false;

        // Arriba
        if (row === 0 || matriz[(row - 1) * columnas + col] === 0) {
          borde += `border-top:${BORDER_SIZE_EXTERNO}px solid ${BORDER_COLOR};`;
          bordeExterno = true;
        } else {
          borde += `border-top:${BORDER_SIZE_INTERNO}px solid ${BORDER_COLOR};`;
        }

        // Abajo
        if (row === filas - 1 || matriz[(row + 1) * columnas + col] === 0) {
          borde += `border-bottom:${BORDER_SIZE_EXTERNO}px solid ${BORDER_COLOR};`;
          bordeExterno = true;
        } else {
          borde += `border-bottom:${BORDER_SIZE_INTERNO}px solid ${BORDER_COLOR};`;
        }

        // Izquierda
        if (col === 0 || matriz[row * columnas + (col - 1)] === 0) {
          borde += `border-left:${BORDER_SIZE_EXTERNO}px solid ${BORDER_COLOR};`;
          bordeExterno = true;
        } else {
          borde += `border-left:${BORDER_SIZE_INTERNO}px solid ${BORDER_COLOR};`;
        }

        // Derecha
        if (col === columnas - 1 || matriz[row * columnas + (col + 1)] === 0) {
          borde += `border-right:${BORDER_SIZE_EXTERNO}px solid ${BORDER_COLOR};`;
          bordeExterno = true;
        } else {
          borde += `border-right:${BORDER_SIZE_INTERNO}px solid ${BORDER_COLOR};`;
        }

        // Aplica los estilos calculados
        img.style = borde;

        // 👇 Si la imagen toca el borde exterior, quitamos el redondeo
        if (bordeExterno) {
          img.style.borderRadius = "0px";
        } else {
          img.style.borderRadius = "3px"; // o el valor que tengas en tu CSS
        }
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
let animacionTipo = 0;

// ===== Refresco con animaciones alternas =====
function refrescar(){
  if(!fotosActuales.length) return;

  const letraIM = document.getElementById("letraIM");
  const imgs = Array.from(letraIM.querySelectorAll("img"));

  imgs.forEach(img => img.classList.add("fade-out"));

  const promesas = fotosActuales.map(foto => {
    return new Promise(resolve => {
      const temp = new Image();
      temp.onload = () => resolve(foto);
      temp.onerror = () => resolve(foto);
      temp.src = foto.thumb;
    });
  });

  Promise.all(promesas).then(() => {
    setTimeout(() => {
      imgs.forEach((img, i) => {
        const foto = fotosActuales[i % fotosActuales.length];
        img.src = foto.thumb;
        img.dataset.big = foto.big;
      });

      if(animacionTipo === 0){
        for(let row = nuevasFilas-1; row>=0; row--){
          for(let col=0; col<nuevasColumnas; col++){
            const index = row*nuevasColumnas + col;
            const img = imgs[index];
            if(!img) continue;
            const delay = (nuevasFilas-1-row)*100 + col*10;
            setTimeout(()=>{
              img.classList.remove("fade-out");
              img.classList.add("fade-in");
              setTimeout(()=>img.classList.remove("fade-in"), 150);
            }, delay);
          }
        }
      } else if(animacionTipo === 1){
        imgs.forEach((img,i)=>{
          setTimeout(()=>{
            img.classList.remove("fade-out");
            img.classList.add("fade-in");
            setTimeout(()=>img.classList.remove("fade-in"),150);
          }, i*10);
        });
      } else {
        for(let row=0; row<nuevasFilas; row++){
          const rowImgs = imgs.slice(row*nuevasColumnas, (row+1)*nuevasColumnas);
          const shuffledRow = shuffle(rowImgs);
          shuffledRow.forEach((img,i)=>{
            setTimeout(()=>{
              img.classList.remove("fade-out");
              img.classList.add("fade-in");
              setTimeout(()=>img.classList.remove("fade-in"),150);
            }, i*50 + row*50);
          });
        }
      }

      animacionTipo = (animacionTipo + 1) % 3;
    }, 200);
  });
}

// ===== Precarga =====
function precargar(){
  fetch(`${SCRIPT_URL}?cant=${NUM_IMAGENES}`)
    .then(r=>r.json())
    .then(fotos=>{
      fotosPrecargadas = fotos;
      console.log(`✅ Precargadas ${fotos.length} nuevas imágenes`);
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
  configurarGrid(document.getElementById("letraIM"), nuevasFilas, nuevasColumnas);
}
window.addEventListener('resize', ajustarTamano);

// ===== Carga inicial =====
fetch(`${SCRIPT_URL}?cant=${NUM_IMAGENES}`)
  .then(r=>r.json())
  .then(fotos=>{
    fotosActuales = fotos;
    ajustarTamano();
    const letraIM = document.getElementById("letraIM");
    crearMatriz(letraIM, matrizExpandida, nuevasFilas, nuevasColumnas, fotosActuales);
    refrescar();

    setTimeout(precargar, PRECARGA_MS);
    setInterval(cambiar, REFRESCO_MS);
  });
