// const pageScraper = require('./pageScraper');
// const danfeScrapper = require('./danfeScrapper');

async function scrapeAll(browserInstance, pageScraper, url){
    let browser;
    try{
        browser = await browserInstance;
        const resultScrapper = await pageScraper.scraper(browser, url);
        return resultScrapper;
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
        return err
    }
}

module.exports = (browserInstance, pageScraper, url) => scrapeAll(browserInstance, pageScraper, url);