// Abre uma nova guia e carrega a página de extração
async function scrapeAll(browserInstance, pageScraper, chaveAcesso){
    let browser;
    try{
        browser = await browserInstance;
        const resultScrapper = await pageScraper.scraper(browser, chaveAcesso);
        return resultScrapper;
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
        return err
    }
}

export default (browserInstance, pageScraper, chaveAcesso) => scrapeAll(browserInstance, pageScraper, chaveAcesso);