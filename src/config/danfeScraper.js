const fs = require('fs');

const scraperObject = {
    // url: (url) => url,
    // url: 'http://nfe.sefaz.go.gov.br/nfeweb/sites/nfe/consulta-completa-interna?chaveAcesso=52220137863511000147650140003117489143117480',
    // 'http://nfe.sefaz.go.gov.br/nfeweb/sites/nfe/consulta-completa-interna?chaveAcesso=52211237863511000147650150002803069152803061',
    // 'http://nfe.sefaz.go.gov.br/nfeweb/sites/nfce/d/danfeNFCe?p=52211206789216000164650110002952931112952934|2|1|1|7B1F63E6EBEADCC49D699EB47011919A97C3E96C',
    async scraper(browser, url){
        let page = await browser.newPage();
        console.log(`Navigating to ${url}...`);

        //turns request interceptor on
        await page.setRequestInterception(true);

        //if the page makes a  request to a resource type of image or stylesheet then abort that request
        page.on('request', request => {
            if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
            request.abort();
            else
            request.continue();
        });

        await page.goto(url);
        
        await page.click('.btn-view-det');

        await page.waitForSelector('#Prod');

        const data = await page.evaluate(async()=>{

            // Remover quebras de linha e espaços adicionais
            const removeSpace = (texto) => texto.replace(/\s+/g, ' ').trim();

            const selectorAll = (seletor) => document.querySelectorAll(seletor);

            const dadosGerais = (id) => selectorAll("#xml-nfe-container > div.GeralXslt span")[id].textContent;
            const dadosNfe = (id)=>selectorAll('#NFe span')[id].textContent;
            const emitente = (id)=>selectorAll('#Emitente span')[id].textContent;
            const destinatario = (id) => selectorAll('#DestRem span')[id].textContent;
            const totais = (id) => selectorAll('#Totais span')[id].textContent;
            const transporte = (id) => selectorAll('#Transporte span')[id].textContent;

            const cobranca = [...selectorAll('#Cobranca .toggle.box')].map((item) => {

                const data = (id) => item.querySelectorAll('span')[id].textContent;
                return {
                    indFormaPgto: data(0),
                    meioPgto: removeSpace(data(1)),
                    vlPgto: data(2)
                }

            })
            
            const infosAdicionais = () =>{
                    
                    const result = (id) => selectorAll('#Inf span')[id].textContent
                    const data = {
                        formatoImp: result(0),
                        qrCode: '',
                        url: ''
                    }
                    if(selectorAll('#Inf span').length > 4){                       
                            data.qrCode= result(4),
                            data.url= result(5)
                    }else{                   
                            data.qrCode= result(2),
                            data.url= result(3)                        
                    }
                    console.log(data)
                    return data
            }

            
            const produtos = [...selectorAll('#Prod div table.toggle.box')].map((item, id)=>{
                 
                const getElement = (seletor)=>item.querySelector(seletor).innerText

                const getElements = (seletor, idx)=>[...document
                    .querySelectorAll('#Prod div table.toggable')][id]
                    .querySelectorAll(seletor)[idx].textContent

                const parseNumber = (texto,casasDec=0)=>Number(texto.replace(',','.')).toFixed(casasDec)    

                const produto = {
                        descricao: getElement('.fixo-prod-serv-descricao'),
                        codigoProduto: getElements('.box tr span',0),
                        codigoNCM: getElements('.box tr span',1),
                        CFOP: getElements('.box tr span',7),
                        vlUnit: parseNumber(getElements('.box tr span',19),3),
                        vlTotal: parseNumber(getElement('.fixo-prod-serv-vb'),2),
                        unidadeComercial: getElement('.fixo-prod-serv-uc'),
                        qtd: parseNumber(getElement('.fixo-prod-serv-qtd'),2),
                        codigoEANcomercial: getElements('.box tr span',13)
                
                };
                return produto;
            });

            const list = {
                dadosGerais:{
                    chaveAcesso: dadosGerais(0),
                    numero: dadosGerais(1),
                    vsXml: dadosGerais(2)
                },
                dadosNfe:{
                    modelo: dadosNfe(0),
                    serie: dadosNfe(1),
                    numero: dadosNfe(2),
                    dataEmissao: dadosNfe(3),
                    ValorTotalNF: dadosNfe(5)
                },
                emitente:{
                    nomeRazaoSocial: emitente(0),
                    nomeFantasia: emitente(1),
                    cnpj: emitente(2),
                    endereco: removeSpace(emitente(3)),
                    bairroDistrito: emitente(4),
                    cep: emitente(5),
                    municipio: removeSpace(emitente(6)),
                    telefone: emitente(7),
                    uf: emitente(8),
                    pais: removeSpace(emitente(9)),
                    inscricaoEstadual: emitente(10),
            
                },
                destinatario:{},
                produtos,
                totais:{
                    baseCalcIcms: totais(0),
                    vlIcms: totais(1),
                    vlTotalProdutos: totais(11),
                    vlFrete: totais(12),
                    vlSeguro: totais(13),
                    vlDescontos: totais(14),
                    vlTotalNfe: totais(21),
                    vlAprxTributos: totais(22)
                },
                transporte:{
                    modalidadeFrete: removeSpace(transporte(0)),
                },
                cobranca,
                infosAdicionais:infosAdicionais(),
            }
            // console.log(list); //exibe no console do navegador
            return list
    
        });

        // await page.screenshot({path:'example.png'});

        fs.writeFile('nf.json',JSON.stringify(data,null,2), err => {
            if(err) throw new Error('Algo deu errado');
            console.log('Done! Sucesfull!');
        })
        console.log(data); //exibe no cmd
        
        await browser.close();
        return data

    }
}


module.exports = scraperObject;