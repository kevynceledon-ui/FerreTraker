const { chromium} = require("playwright");

async function consultarSodimac() {
//lanzamos  el navegador 
const browser = await chromium.launch({ headless:false}); //false para ver que sucede
const context = await browser.newContext();
const page = await browser.newPage();

console.log("Comparación---");

//Consulta de producto en sodimac
await page.goto("https://www.sodimac.cl/sodimac-cl/articulo/110309884/cemento-polpaico-25-kilos/110309919")

//selector más flexible para el precio || CONSULTA SODIMAC

const precioSodimacRaw = await page.innerText("span.primary.senary")
const precioSodimac = parseInt(precioSodimacRaw.replace(/[^0-9]/g, ""));

console.log(`Sodimac ${precioSodimac}`);

// CONSULTA EASY

await page.goto("https://www.easy.cl/cemento-especial-25-kg-polpaico-1195183/p")

// Capturamos el texto tal cual aparece en la web, sin limpiar nada
  const textoSucioEasy = await page.innerText('div.sc-1f784e80-0'); 
  
  console.log("DEBUG EASY - Texto crudo:", `|${textoSucioEasy}|`); // Los palitos | son para ver si hay espacios locos

const partes = textoSucioEasy.split("("); //Cortamos el texto donde aparezca el primer parentesis o espacio largo, esto dejara un array

//Tomamos solo la primera parte (indice 0) y recien ahi limpiamos los numeros
const precioLimpio = partes[0].replace(/[^0-9]/g, '');

const precioEasyRaw = await page.locator('span.sc-11b00991-5.dEKQBo').first().innerText();

const precioEasy = parseInt(precioLimpio);

console.log(`EASY: ${precioEasy}`);

//esperamos a que el precio aparzca en el DOM

// 3. LÓGICA DE NEGOCIO
  console.log("\n--- RESULTADO ---");
  if (precioSodimac < precioEasy) {
    console.log(`Conviene SODIMAC. Ahorras: $${precioEasy - precioSodimac}`);
  } else if (precioEasy < precioSodimac) {
    console.log(`Conviene EASY. Ahorras: $${precioSodimac - precioEasy}`);
  } else {
    console.log("Cuestan lo mismo en ambas tiendas.");
  }

  await browser.close();
}


/* try{
const precio  = await page.textContent ("span.primary.senary");

console.log(`-----------------------------------------`);
    console.log(`PRODUCTO: Piso Flotante 8mm New Ardennes`);
    console.log(`PRECIO ENCONTRADO: ${precio}`);
    console.log(`-----------------------------------------`);


} catch(error){
    console.error("no se pudo encontrar el precio , el diseño del sitio pudo cambiar.");
}
    await browser.close();  

} */
consultarSodimac();