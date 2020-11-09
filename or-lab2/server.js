const express = require('express');
const app = express();
var path = require('path');

const indexRouter = require('./routes/index.routes');
const datatableRouter = require('./routes/datatable.routes');

//ukljuci ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//ukljuci public folder za posluzivanje
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true })); 

app.use('/', indexRouter);
app.use('/datatable', datatableRouter);

app.listen(3000);