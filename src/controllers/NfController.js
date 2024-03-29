import StartBrowser from '../config/browser';
import newPage from '../config/newPage';
import scraperObject from '../config/pageNfeScraper';

class NfController{

    async show(req, res){
        const { chave } = req.params;

        console.log(chave);
        console.log(chave.length);
        console.log('chave.length');

        if(chave.length < 44 || chave.length > 44){
            return res.status(404).json({"error":"chave inválida"})
        }
   

            console.log(chave)
            //  Iniciar o Broser e e cria uma instância
            const browserInstance = StartBrowser();
            
            // Passe a instância do navegador para o controlador scraper
            const data = await newPage(browserInstance, scraperObject, chave);

            console.log(data);
            if (Object.keys(data)[0] === 'error') {
                return res.status(400).json(data)
            }else{
                return res.json(data);
            }

    }
}

module.exports  = new NfController();