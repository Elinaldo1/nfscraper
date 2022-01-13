const {Router} = require('express');
const DanfeController = require('./controller/DanfeController');

const routes = new Router();


routes.get('/nf', DanfeController.show)

module.exports = routes;