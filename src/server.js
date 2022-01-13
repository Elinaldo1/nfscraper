const app = require('./app');

app.get('/', (req, res)=>{
    res.send('Api Nf online')
})

app.listen(process.env.PORT || 3333)