import cors from 'cors';
import express from 'express';
import routes from './routes';

class App{
    constructor(){

        this.server = express();
        this.middlewares();
        this.routes();
    }

    // Config Cross Origin e ParseJson
    middlewares(){
        this.server.use(cors());
        this.server.use(express.json());

    }

    routes(){
        this.server.use(routes)
    }
}

module.exports = new App().server;