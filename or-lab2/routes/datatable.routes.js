var express = require('express');
var router = express.Router();
const db = require('./../db');

router.get('/', async function(req, res, next) {

    const datatable = await db.query(
        'SELECT videoigra.*, jezanr.nazivzanr, jenaplatformi.nazivplatforma, lik.imelik ' +
        'FROM videoigra, lik, jezanr, jenaplatformi WHERE lik.nazivvideoigra = videoigra.nazivvideoigra ' +
        'AND jezanr.nazivvideoigra = videoigra.nazivvideoigra AND jenaplatformi.nazivvideoigra = videoigra.nazivvideoigra');

    res.render('datatable', {
        title: 'Datatable',
        linkActive: 'datatable',
        datatableRows: datatable.rows
    });

});

module.exports = router;