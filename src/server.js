import app from './app';

app.get('/', (req, res)=>{
    res.send('Api NfScraper está online')
})

app.listen(process.env.PORT || 3333)