const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwW-_fcSA49nLbhKRgVaLGwDM4GhCKXjHzSSXq-XcFbHQCdtZ7kjP79cHnUCLWD3ALX/exec"; 

// ===== CONFIGURACIÓN =====
const filasI   = 12;   // filas de la I
const colsI    = 2;    // columnas de la I
const filasM   = 12;   // filas de la M
const colsM    = 14;   // columnas de la M
const thickM   = 2;    // grosor de patas/diagonales de la M
const cellSize = 40;   // tamaño de celda en px
const REFRESCO_MS = 30000; // ⏱️ tiempo de actualización en milisegundos
// ==========================

function configurarGrid(el, filas, columnas){
  el.style.gridTemplateRows    = `repeat(${filas}, ${cellSize}px)`;
  el.style.gridTemplateColumns = `repeat(${columnas}, ${cellSize}px)`;
}

function coordsI(filas, columnas){
  const puntos=[];
  for(let r=0;r<filas;r++){
    for(let c=0;c<columnas;c++) puntos.push([r,c]);
  }
  return {puntos, columnas};
}

function coordsM(filas, columnas, thick){
  const puntos=[];
  const mitad = Math.floor(columnas/2);
  for(let r=0;r<filas;r++){
    // patas
    for(let t=0;t<thick;t++){ puntos.push([r,t]); puntos.push([r,columnas-1-t]); }
    // diagonales
    let diag = Math.floor(r*(mitad/(filas)));
    for(let t=0;t<thick;t++){
      let cc = diag + t;
      if(cc<columnas) puntos.push([r, cc]);
    }
    let diagR = columnas-1 - diag;
    for(let t=0;t<thick;t++){
      let cc = diagR - t;
      if(cc>=0) puntos.push([r, cc]);
    }
  }
  return {puntos, columnas};
}

// Mezcla un array (Fisher-Yates)
function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function crearLetra(container, data, fotos, filas){
  container.innerHTML = "";
  configurarGrid(container, filas, data.columnas);
  // mezclar imágenes
  let imgs = shuffle(fotos);
  // repetir si no hay suficientes
  while(imgs.length < data.puntos.length){
    imgs = imgs.concat(shuffle(fotos));
  }
  // colocar
  data.puntos.forEach(([r,c], i)=>{
    const img = document.createElement("img");
    img.src = imgs[i].url; // usa la URL del JSON
    img.style.gridRow = r+1;
    img.style.gridColumn = c+1;
    container.appendChild(img);
  });
}

let fotosCache = [];

function refrescar(){
  if(!fotosCache.length) return;
  crearLetra(document.getElementById("letraI"), coordsI(filasI, colsI), fotosCache, filasI);
  crearLetra(document.getElementById("letraM"), coordsM(filasM, colsM, thickM), fotosCache, filasM);
}

// Carga inicial y refresco automático
fetch(SCRIPT_URL)
  .then(r=>r.json())
  .then(fotos=>{
    fotosCache = fotos;
    refrescar();
    setInterval(refrescar, REFRESCO_MS);
  });
