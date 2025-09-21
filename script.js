const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyuSShIX_-wTmrL5AwAnnk5C4xFWWHGYx4pyeFNMP3zq_RYf4RSkm8P_0FyhcmnWVgj/exec";

// ===== CONFIGURACIÓN =====
const filasI   = 12;
const colsI    = 2;
const filasM   = 12;
const colsM    = 14;
const thickM   = 2;
const cellSize = 40;
const REFRESCO_MS = 30000;
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
  return {puntos, filas, columnas};
}

function coordsM(filas, columnas, thick){
  const puntos=[];
  const mitad = Math.floor(columnas/2);
  for(let r=0;r<filas;r++){
    for(let t=0;t<thick;t++){ puntos.push([r,t]); puntos.push([r,columnas-1-t]); }
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
  return {puntos, filas, columnas};
}

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
modal.addEventListener("click", e=>{
  if(e.target === modal) cerrarModal();
});

// ===== Construcción del mosaico =====
function crearLetra(container, data, fotos){
  container.innerHTML = "";
  configurarGrid(container, data.filas, data.columnas);

  let imgs = shuffle(fotos);
  while(imgs.length < data.puntos.length){
    imgs = imgs.concat(shuffle(fotos));
  }

  data.puntos.forEach(([r,c], i)=>{
    const img = document.createElement("img");
    img.src = imgs[i % imgs.length].thumb;
    img.dataset.big = imgs[i % imgs.length].big;
    img.style.gridRow = r+1;
    img.style.gridColumn = c+1;
    img.addEventListener("click", e=> abrirModal(e.target.dataset.big));
    container.appendChild(img);
  });
}

let fotosCache = [];

function refrescar(){
  if(!fotosCache.length) return;

  const letraI = document.getElementById("letraI");
  const letraM = document.getElementById("letraM");

  // Fade out
  letraI.classList.add("fade-out");
  letraM.classList.add("fade-out");

  setTimeout(()=>{
    // Re-crear contenido
    crearLetra(letraI, coordsI(filasI, colsI), fotosCache);
    crearLetra(letraM, coordsM(filasM, colsM, thickM), fotosCache);

    // Fade in
    letraI.classList.remove("fade-out");
    letraM.classList.remove("fade-out");
    letraI.classList.add("fade-in");
    letraM.classList.add("fade-in");

    // Quitar la clase fade-in después de la animación
    setTimeout(()=>{
      letraI.classList.remove("fade-in");
      letraM.classList.remove("fade-in");
    }, 600);
  }, 600); // coincide con transition-duration en CSS
}

// ===== Carga inicial =====
fetch(SCRIPT_URL)
  .then(r=>r.json())
  .then(fotos=>{
    fotosCache = fotos;
    refrescar();
    setInterval(refrescar, REFRESCO_MS);
  });
