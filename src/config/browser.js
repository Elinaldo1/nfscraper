// Abre instancia do browser
import puppeteer from 'puppeteer';

async function StartBrowser(){
    let browser;
    try{
        console.log('opening the browser...');
        browser = await puppeteer.launch({
            headless: true,
            args:['--disable-setuid-sandbox'],
            'ignoreHTTPSErrors': true
        })
        return browser;
    }catch(err){
        console.log("Could not create a browser instance => : ", err)
        return err
    }
}

export default StartBrowser;