const express = require('express');
const app = express();
var path = require('path');
var bodyParser = require("body-parser");
var hateoasLinker = require('express-hateoas-links');

const indexRouter = require('./routes/index.routes');

//ukljuci public folder za posluzivanje
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true })); 
app.use(bodyParser.urlencoded({ extended: true }));
//za citanje tijela zahtjeva!!!
app.use(bodyParser.json());

app.use(hateoasLinker);

app.use('/', indexRouter);

app.listen(3000);