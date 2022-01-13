const browserObject = require('../config/browser');
const newPage = require('../config/newPage');
const danfeScraper = require('../config/danfeScraper');

class DanfeController{

    async show(req, res){
        
        const { url } = req.body;
        //  Iniciar o Broser e e cria uma instância
        const browserInstance = browserObject.startBrowser();
        
        // Pass the browser instance to the scraper controller

        const dataScraper = await newPage(browserInstance, danfeScraper, url);
        
        return res.json(dataScraper);

    }
}

module.exports = new DanfeController();