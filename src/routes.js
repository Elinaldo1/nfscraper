import { Router } from 'express';
import NfController from '../src/controllers/NfController';

const routes = new Router();


routes.get('/nf/:chave', NfController.show)

export default routes;