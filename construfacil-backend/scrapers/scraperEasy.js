import { parse } from "path";

export async function minarEasy (browser, terminoBusqueda) {
    const page = await browser.newPage();
    const productosExtraidos = [];

    try {
        // ELIMINAMOS EL IF. Este archivo es exclusivo de Easy.
        console.log(`\n  Iniciando minería en EASY para: "${terminoBusqueda}"`);

        await page.goto(`https://www.easy.cl/search/${encodeURIComponent(terminoBusqueda)}`);
        console.log("Haciendo scroll para forzar la carga de imágenes...");
        await page.waitForTimeout(2000);

        for (let i =0; i < 12; i++){
            await page.evaluate(() => window.scrollBy(0, 500));
            await page.waitForTimeout(2000);
        }

        const tarjetas= await page.locator('[id^="row-"] > div').all();

        for (const tarjeta of tarjetas){
            try{
                const textoCompleto = await tarjeta.innerText();
                if(!textoCompleto) continue;
        
                const lineas= textoCompleto.split("\n").map (linea=> linea.trim()).filter(linea => linea !== "");

                const lineaPrecio = lineas.find(linea => linea.startsWith("$"));

                
                if (lineaPrecio){
                    // Usamos el método slice() para tomar las dos primeras líneas de forma segura y unirlas.
                    // Esto nos dará títulos robustos como "Descuento por Volumen Cemento Especial 25 Kg"
                    const textoTitulo = lineas.slice(0, 2).join(' ').trim();
                    const precioLimpio = parseInt(lineaPrecio.replace(/[^0-9]/g, ''));

                    let urlImagen = "No encontrado";
                    let urlProducto = "No encontrado";

                    const imgAtributo = await tarjeta.locator('img').first().getAttribute ('src', { timeout: 500 }).catch (()=> null);
                    const linkAtributo = await tarjeta.locator('a').first().getAttribute ('href', { timeout: 500 }).catch (()=> null);

                    if (imgAtributo){
                        urlImagen = imgAtributo.startsWith('http') ? imgAtributo : `https://www.easy.cl${imgAtributo.startsWith('/') ? '' : '/'}${imgAtributo}`;
                    }
                    if (linkAtributo){
                        urlProducto = linkAtributo.startsWith('http') ? linkAtributo : `https://www.easy.cl${linkAtributo.startsWith('/') ? '' : '/'}${linkAtributo}`;
                    };

                    if (precioLimpio > 0 && !isNaN(precioLimpio)){
                        productosExtraidos.push({
                            tienda: "Easy",
                            titulo: textoTitulo,
                            precio: precioLimpio,
                            imagen: urlImagen,
                            link: urlProducto
                        });
                    }
                }
              
            }catch (e){
                continue;
            }
        }
        // Cerramos la página de Easy al terminar
        await page.close();
        return productosExtraidos;

    }catch (e){
        console.error('Error general en Easy:', e.message);
        await page.close();
        return [];
    }
}