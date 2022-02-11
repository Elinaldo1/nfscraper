import fs from 'fs';

const scraperObject = {

    url: (chave) => `http://nfe.sefaz.go.gov.br/nfeweb/sites/nfe/consulta-completa-interna?chaveAcesso=${chave}`,
    async scraper(browser, chaveAcesso){

        try{

            let page = await browser.newPage();
            console.log(`Navigating to ${this.url(chaveAcesso)}...`);
    
            //ativa o interceptor de requisições===============================================
            await page.setRequestInterception(true);
    
            // se a página fizer uma solicitação para
            // um tipo de recurso de imagem ou folha
            // de estilo, aborte essa solicitação================================================
            page.on('request', request => {
                if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
                request.abort();
                else
                request.continue();
            });
    
            // navegue até a url informada======================================================
            await page.goto(this.url(chaveAcesso)); 
            
        //    await page.waitForSelector('#Prod');

            // function evaluate executada no browser
            // Navegue pela DOM, faça o scrapper e retorne os dados=============================
            const dataNf = await page.evaluate(async()=>{

                // Remove quebras de linha e espaços adicionais
                const removeSpace = (texto) => texto.replace(/\s+/g, ' ').trim();
    
    
                const selector = (seletor) => document.querySelector(seletor);
                const selectorAll = (seletor) => document.querySelectorAll(seletor);
                
                // É possivel buscar dados com chave DANFE NFC-e do estado de Goiás
                // nesse caso precisa ajustar alguns seletores para retornar corretamente os dados
                // se a chave passada for de um danfe lançe um erro
                if(selector('.btn.btn-info.btn-view-det.button-compensation-min-479')){
                    return{error:'Chave informada não é NFe'}
                };

                // Verifica se a versao XML é 3.10
                if(selector("#form\\:Cabecalho > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(3) > span.linha")){
                    return {error:'Versão XML da NFe diferente de 4.00'}
                };
                
                // Localize elementos com dados desejados na DOM===============================               
                const dadosGerais = (id) => selectorAll("#xml-nfe-container > div.GeralXslt span")[id].textContent;

                const dadosNfe = (id)=>selectorAll('#NFe span')[id].textContent;
                const emitente = (id)=>selectorAll('#Emitente span')[id].textContent;
                const destinatario = (id) => selectorAll('#DestRem span')[id].textContent;
                const totais = (id) => selectorAll('#Totais span')[id].textContent;
                const transporte = (id) => selectorAll('#Transporte span')[id].textContent;
    
                const cobranca = () => {
    
                    const dataLength = selectorAll('#Cobranca span').length
                    const dataValue = (id) => selectorAll('#Cobranca span')[id].textContent;
                    return {
                        formaPgto: removeSpace(dataValue(dataLength - 7)),
                        vlPgto: dataValue(dataLength - 6),
                        integracaoPgto: dataValue(dataLength - 5),
                        troco: dataValue(dataLength - 1)
                    }
    
                };
                
                const infosAdicionais = selectorAll('#Inf span')[0].textContent;
                  
                const produtos = [...selectorAll('#Prod div table.toggle.box')].map((item, id)=>{
                     
                    const getElement = (seletor)=>item.querySelector(seletor).innerText
    
                    const getElements = (seletor, idx)=>[...document
                        .querySelectorAll('#Prod div table.toggable')][id]
                        .querySelectorAll(seletor)[idx].textContent
    
                    // const parseNumber = (texto,casasDec=0)=>Number(texto.replace(',','.')).toFixed(casasDec)    
    
                    const produto = {
                            descricao: getElement('.fixo-prod-serv-descricao'),
                            codigoProduto: getElements('.box tr span',0),
                            codigoNCM: getElements('.box tr span',1),
                            CFOP: getElements('.box tr span',7),
                            vlUnit: getElements('.box tr span',19),
                            vlTotal: getElement('.fixo-prod-serv-vb'),
                            unidadeComercial: getElement('.fixo-prod-serv-uc'),
                            qtd: getElement('.fixo-prod-serv-qtd'),
                            codigoEANcomercial: getElements('.box tr span',13)
                    
                    };
                    return produto;
                });
    
                // Gere o objeto JSON=================================
                const dataScrapper = {
    
                    dadosGerais:{
                        chaveAcesso: dadosGerais(0).replaceAll(' ',''),
                        numero: dadosGerais(1),
                        vsXml: dadosGerais(2)
                    },
                    nfe:{
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
                        iesTributario: emitente(11),
                        inscricaoMunicipal: emitente(12),
                        mofgIcms: emitente(13),
                        cnaeFiscal: emitente(14),
                        codRegimeTribut: removeSpace(emitente(15))
                
                    },
                    destinatario:{
                        nomeRazaoSocia:destinatario(0),
                        cpf:destinatario(1),
                        endereco: removeSpace(destinatario(2)),
                        bairroDistrito: removeSpace(destinatario(3)),
                        cep: destinatario(4),
                        municipio: removeSpace(destinatario(5)),
                        telefone: destinatario(6),
                        uf: destinatario(7),
                        pais: removeSpace(destinatario(8)),
                        indicadorIe: removeSpace(destinatario(9)),
                        inscricaoEstadual: destinatario(10),
                        insricaoSuframa:destinatario(11),
                        im: destinatario(12),
                        email:destinatario(13)
                    },
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
                        transportador: {
                            cnpj: removeSpace(transporte(1)),
                            nomeRazaoSocia: removeSpace(transporte(2)),
                            inscricaoEstadual: removeSpace(transporte(3)),
                            enderecoCompleto: removeSpace(transporte(4)),
                            municipio: removeSpace(transporte(5)),
                            uf:removeSpace(transporte(6)),
                        },
                        volumes:{
                            qtd: transporte(7),
                            especie: transporte(8),
                            marcaVolumes: transporte(9),
                            numeracao: transporte(10),
                            pesoLiq: transporte(11),
                            pesoBruto: transporte(12)
                        }
    
                    },
                    cobranca: cobranca(),
                    infosAdicionais:infosAdicionais,
                };

                // console.log(dataScrapper); //exibe no console do navegador
                return dataScrapper
        
            });

            
    
            // Tire um print da pg e salva no root=========================
            // await page.screenshot({path:'example.png'});
    
            //exibe dados no cmd
            // console.log(dataNf); 

            // grve o arquivo .json no root
            fs.writeFile('nf.json',JSON.stringify(dataNf,null,2), err => {
                if(err) throw new Error('Algo deu errado');
                console.log('Done! Sucesfull!');
            })
            
            
            return dataNf
        }catch(error){
            console.log(error)
            return {error}

        }finally{
            // Feche o browser
            await browser.close();

        }


    }
}

export default scraperObject;