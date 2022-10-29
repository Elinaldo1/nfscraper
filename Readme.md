Api desenvolvida para por em prática conhecimentos de web scraping com Node.JS, Puppeteer e Express.

Essa pode ser uma ótima idéia a ser implantada por exemplo em pequenos sistemas de orçamento doméstico onde precisa cadastrar muitos produtos, preços, locais de compra, ou lançar despesas detalhadas, no geral manualmente, imagina lançar um cupom fiscal com 200 ou mais produtos? pode levar até horas. Vc pode ter isso de forma automática em segundos.

O objetivo é retornar todos os dados da DANFE NFC-e, possibilitando comparativo de altas, baixas e cotações de preços por exemplo apenas efetuando a leitura do Qr-Code. Como existem muitos casos de falhas em Qr-Codes, é possível informar apenas a chave de acesso(44 dígitos) e a sigla do estado de emissão, ex:"GO".

Testado com Danfe NFC-e do estado de Goiás. Verifique possibilidade de uso no seu estado.
Para visualizar a ação no navegador, faça "headless:false" em src/config/browser.js.

A seguir temos a estrutura de dados retornados, mas podemos adicionar muito mais, analise a pagina de dado:.

{
    dadosGerais:{
        chaveAcesso:'',
        numero:'',
        vsXml:''
    }
    dadosNfe:{
        modelo:'',
        serie:'',
        dataEmissao:'',
        numero:'',
        ValorTotalNF:''
    },
    emitente:{
        cnpj:'',
        nomeRazaoSocial:'',
        nomeFantasia:'',
        inscricaoEstadual:'',
        municipio:'',
        uf:'',
        endereco:'',
        bairroDistrito:'',
        cep:'',
        telefone:'',
        país:'',

    },
    destinatario:{},
    produtos:[{
        descricao:'',
        codigoProduto:'',
        codigoNCM:'',
        CFOP:'',
        codigoEanComercial:'',
        qtd:'',
        un:'',
        vlUnit:'',
        vlTotal:'
    }],
    totais:{
        baseCalcIcms:'',
        vlIcms:'',
        vlTotalProdutos:'',
        vlTotalNfe:'',
        vlAprxTributos:''
    },
    transporte:{
        modalidadeFrete:''
    },
    cobranca:{
        indFormaPgto:'',
        meioPgto:'',
        vlPgto:''
    },
    infosAdicionais:{
        qrCode:'',
        urlNfce:''
    }
}
