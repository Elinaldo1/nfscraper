import app from './app';

app.get('/', (req, res)=>{
    res.send('Api Nf está online')
})

app.listen(process.env.PORT || 3333)