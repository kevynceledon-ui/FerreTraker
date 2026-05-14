export async function minarSodimac (browser, terminoBusqueda){
    const page  = await browser.newPage();
    const productosExtraidos = []; 

    try{
        console.log(`\n⛏️  Iniciando minería en SODIMAC para: "${terminoBusqueda}"`);

        await page.goto(`https://www.sodimac.cl/sodimac-cl/buscar?Ntt=${encodeURIComponent(terminoBusqueda)}`);
        console.log("⏬ Haciendo scroll para forzar la carga de imágenes...");
        await page.waitForTimeout(2000); 

        for (let i =0; i < 12; i++){
            await page.evaluate(() => window.scrollBy(0, 500));
            await page.waitForTimeout(2000);
        }

        const tarjetas = await page.locator('#testId-searchResults-products > div').all();
        console.log(`Se encontraron ${tarjetas.length} tarjetas. Procesando...`);

        for (const tarjeta of tarjetas){
            try{
                const textoCompleto = await tarjeta.innerText();
                if(!textoCompleto) continue;

                const precioLocator = tarjeta.locator('[id^="testId-pod-prices-"] span').first();
                const textoPrecio = await precioLocator.innerText( { timeout: 500 }).catch(()=> "0");
                const precioLimpio = parseInt(textoPrecio.split("(")[0].replace(/[^0-9]/g, ''));

                let urlImagen = 'No encontrado';
                let urlProducto = 'No encontrado'; 
                
                const imgAtributo = await tarjeta.locator('img').first().getAttribute ('src', { timeout: 500}).catch (() => null);
                const linkAtributo = await tarjeta.locator ('a').first().getAttribute ('href', { timeout:500 }).catch(()=> null);

                if (imgAtributo) urlImagen = imgAtributo;
                if (linkAtributo) urlProducto = linkAtributo;

                if (precioLimpio > 0 && !isNaN(precioLimpio)){
                    productosExtraidos.push({
                        tienda: "Sodimac",
                        titulo: textoCompleto.split('\n').slice(0, 2).join(' '),
                        precio: precioLimpio,
                        imagen: urlImagen,
                        link: urlProducto
                    });
                }
            }catch (e){
                continue;
            }
        }

        await page.close();
        return productosExtraidos;

    }catch(error){
        console.log(`Error general en Sodimac:`, error.message);
        await page.close();
        return [];
    }
}