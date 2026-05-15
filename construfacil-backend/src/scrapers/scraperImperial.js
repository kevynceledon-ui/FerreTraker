export async function minarImperial (browser, terminoBusqueda){

    const page = await browser.newPage();
    const productosExtraidos = [];

    try{
        console.log(`\n  Iniciando minería en IMPERIAL para: "${terminoBusqueda}"`);

        await page.goto(`https://www.imperial.cl/search?Ntt=${encodeURIComponent(terminoBusqueda)}`);

        console.log("scroll regular...");
        await page.waitForTimeout(2000);

        for(let i = 0; i< 12; i++){
            await page.evaluate(() => window.scrollBy(0, 500));
            await page.waitForTimeout(1000); //Tiempo más largo, imperial puede demorar más

        }

        const tarjetas = await page.locator(".show-in-grid > div").all();
        console.log(`Se encontraron ${tarjetas.length} tarjeta en imperial.`);

        for (const tarjeta of tarjetas){
            try{
                const textoCompleto = await tarjeta.innerText({ timeout:500 });
                if(!textoCompleto) continue;
                
                //Separamos el texto en lineas, quitamos espacios extra y borramos lineas vacias
                const lineas = textoCompleto.split ("\n").map(linea =>linea.trim())
                                                         .filter(linea => linea !== "");

                const lineasLimpias = lineas.filter(linea => linea.toLowerCase()!== "compare");

                // el titulo casi siempre es la primera linea 
                // Unimos la línea de la marca (índice 0) con la línea del producto (índice 1)
                // Esto nos dará un título como "Bio-Bio Cemento 25kg saco"
                const textoTitulo = `${lineasLimpias[0]} ${lineasLimpias[1]}`;                                 

                //Buscamos la linea que contenga el precio 
                //.find()recorrera el array y se detendra en el primero que cumpla la condicion
                const lineaPrecio = lineasLimpias.find(linea => linea.includes("$"));

                //Se limpia el precio si es que lo encontrado
                const precioLimpio = lineaPrecio ? parseInt(lineaPrecio.replace(/[^0-9]/g, "")) : 0;

                let urlImagen = "No encontrado";
                let urlProducto = "No encontrado";

                
                //Busqueda directa de la etiqueta img y a dentro de las tarjetas

                const imgAtributo = await tarjeta.locator('img').first().getAttribute('src', { timeout: 500 }).catch(() => null);
                const linkAtributo = await tarjeta.locator('a').first().getAttribute('href', { timeout: 500 }).catch(() => null);

                if(imgAtributo) {
                   urlImagen = imgAtributo.startsWith('http') ? imgAtributo : `https://www.imperial.cl${imgAtributo.startsWith('/') ? '' : '/'}${imgAtributo}`;
                }
                if(linkAtributo){
                    //imperial entrega urls relativas de vez en cuando
                    //Si no empieza con http, le pegamos le dominio base
                    urlProducto = linkAtributo.startsWith('http') ? linkAtributo : `https://www.imperial.cl${linkAtributo.startsWith('/') ? '' : '/'}${linkAtributo}`;
                }

                const precio = 0;

                if (precioLimpio > 0 && !isNaN(precioLimpio)){
                    productosExtraidos.push({
                        tienda: "Imperial",
                        titulo: textoTitulo,
                        precio: precioLimpio,
                        imagen: urlImagen,
                        link: urlProducto
                    });
                }
            }catch(e){
                console.log("⚠️ Error procesando una tarjeta de Imperial:", e.message);
                continue;
            }
        }
        await page.close();
        return productosExtraidos;

    }catch(e){
        console.error(`error general en imperial`, e.message);
        await page.close();
        return [];
    }
}