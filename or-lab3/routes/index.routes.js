var express = require('express');
const Videogame = require('../models/VideogameModel');
var router = express.Router();
var videogame = require('../models/VideogameModel');
var proizvodac = require('../models/ProizvodacModel');
var lik = require('../models/LikoviModel');
var izdavac = require('../models/IzdavaciModel');
const axios = require('axios')
const fs = require('fs');
var path = require('path');

//za cache
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

router.get('/videoigre', async function(req, res, next) {
    
    try {
        let videogames = await videogame.fetchVideogamesList();

        if (videogames != null) {

            let videogameSchema = {
                "status": "OK",
                "message": "Dohvaćeni objekti videoigara", 
                "response": videogames
            } 
    
            res.status(200).json(videogameSchema, [
                {
                    "href": "/videoigre",
                    "rel": "videoigra",
                    "type": "POST",
                    "title": "dodaj videoigru"
                },
                {
                    "href": "/videoigre/{ID}",
                    "rel": "videoigra",
                    "type": "GET",
                    "title": "dohvati videoigru sa ID-om"
                },
                {
                    "href": "/videoigre/{ID}",
                    "rel": "videoigra",
                    "type": "PUT",
                    "title": "ažuriraj videoigru sa ID-om"
                },
                {
                    "href": "/videoigre/{ID}",
                    "rel": "videoigra",
                    "type": "DELETE",
                    "title": "izbriši videoigru sa ID-om"
                }
            ]);
        } else {
            res.status(404).json(
                {
                    "status": "Not Found",
                    "message": "Videoigre nisu pronađene",
                    "reponse": null
                }
            );
        }

    } catch (exc) {
        
    }
    
});

router.get('/videoigre/:videogameID', async function(req, res, next) {
    
    try {
        let game = await videogame.fetchByVideogameId(req.params.videogameID); 

        //dodaj link na sliku
        game.slika = req.protocol + '://' + req.get('host') + req.originalUrl + '/picture';

        if (game != null) {

            let videogameSchema = {
                "status": "OK",
                "message": "Dohvaćen objekt videoigre", 
                "response": {
                    "@context": {
                        "@vocab": "http://schema.org/", 
                        "nazivvideoigra": "name",
                        "godinaizdanja": "datePublished",
                        "multiplayer": "playMode",
                        "nazivproizvodac": "author",
                        "nazivizdavac": "publisher"
                    }, 
                    game
                }
            }

            res.status(200).json(videogameSchema,
                [
                    {
                        "href": "/videoigre/" + game.videoigraid,
                        "rel": "videoigra",
                        "type": "PUT",
                        "title": "ažuriraj videoigru sa ID-om " + game.videoigraid
                    },
                    {
                        "href": "/videoigre/" + game.videoigraid,
                        "rel": "videoigra",
                        "type": "DELETE",
                        "title": "izbriši videoigru sa ID-om " + game.videoigraid
                    }
                ]    
            );
        } else {
            res.status(404).json(
                {
                    "status": "Not Found",
                    "message": "Videoigra sa danim ID-om nije pronađena",
                    "reponse": null
                }
            );
        }
    } catch (exc) {
        res.status(404).json(
            {
                "status": "Not Found",
                "message": "Videoigra sa danim ID-om nije pronađena",
                "reponse": null
            }
        );
    }   

});

router.get('/videoigre/:videogameID/picture', async function(req, res, next) {

    const imagePath = path.join(__dirname, `../public/images/${req.params.videogameID}.png`);

    //provjerava je li isteklo vrijeme trajanja, ako je onda value == undefined
    var value = myCache.get( req.params.videogameID );

    //ako slika ne postoji onda je dohvati ili ako je isteklo vrijeme trajanja
    if (!fs.existsSync(imagePath) || value == undefined) {

        var game = await videogame.fetchByVideogameId(req.params.videogameID); 
        
        if (game == null) {
            res.setHeader('Content-Type', 'application/json');

            res.status(404).json(
                {
                    "status": "Not Found",
                    "message": "Videoigra sa danim ID-om nije pronađena",
                    "reponse": null
                }
            );
            return;
        }

        //spremi kljuc u cache -> trenutno postavljeno vrijeme od 20 sek
        var success = myCache.set( game.videoigraid, game.nazivvideoigra, 20 ); //key, val, vrijeme trajanja (u sek)

        //ako je uspjesno cacheirano onda ispisi
        if (success) {
            var today = new Date();
            var date = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear() + '.';
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;
            
            console.log(dateTime + " keširano " + game.nazivvideoigra + " (ID: " + game.videoigraid + ")");
        }

        let wikHandle = game.wikipedia_stranica;

        const url =  `https://en.wikipedia.org/api/rest_v1/page/summary/${wikHandle}`;
        
        const getData = async (url) => {
            try {
                const response = await axios.get(url);
                const data = response.data;
                //console.log(data);
                return data;
            } catch (error) {
                console.log(error);
            }
        }
        
        const download_image = async (url, image_path) =>
            axios({
                url,
                responseType: 'stream',
            }).then(
                response =>
                new Promise((resolve, reject) => {
                    response.data
                    .pipe(fs.createWriteStream(image_path))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
                }),
            );


        var data = await getData(url);

        var image = data.thumbnail.source;

        await download_image(image, `./public/images/${req.params.videogameID}.png`);

    }

    //postavljanje headera
    res.setHeader('content-type', 'image/png');
    res.setHeader('content-disposition','inline');

    res.sendFile(imagePath);

});

router.post('/videoigre', async function(req, res, next) {

    try {
        let game = new Videogame(req.body.naziv, req.body.godinaizdanja, req.body.metascore, req.body.wikipedia,
            req.body.multiplayer, req.body.proizvodac, req.body.izdavac);

        let gameID = await videogame.persistVideogame(game);

        if (gameID != null) {

            let videogameSchema = {
                "status": "OK",
                "message": "Dodan objekt videoigre", 
                "response": game
            }

            res.status(201).json(videogameSchema,
                [
                    {
                        "href": "/videoigre",
                        "rel": "videoigra",
                        "type": "GET",
                        "title": "dohvati listu videoigara"
                    },
                    {
                        "href": "/videoigre/" + gameID,
                        "rel": "videoigra",
                        "type": "GET",
                        "title": "dohvati videoigru sa ID-om " + gameID
                    },
                    
                    {
                        "href": "/videoigre/" + gameID,
                        "rel": "videoigra",
                        "type": "PUT",
                        "title": "ažuriraj videoigru sa ID-om " + gameID,
                    },
                    {
                        "href": "/videoigre/" + gameID,
                        "rel": "videoigra",
                        "type": "DELETE",
                        "title": "izbriši videoigru sa ID-om " + gameID,
                    }
                ]    
            );
        } else {
            res.status(404).json(
                {
                    "status": "Not Found",
                    "message": "Videoigru nije moguće dodati",
                    "reponse": null
                }
            );
        }
    } catch (exc) {
        res.status(404).json(
            {
                "status": "Not Found",
                "message": "Videoigru nije moguće dodati",
                "reponse": null
            }
        );
    }

});

router.put('/videoigre/:videogameID', async function(req, res, next) {

    try {
        let game = new Videogame(req.body.naziv, req.body.godinaizdanja, req.body.metascore, req.body.wikipedia,
            req.body.multiplayer, req.body.proizvodac, req.body.izdavac);
        
        let gameUpdated = await videogame.updateVideogame(req.params.videogameID, game);

        if (gameUpdated) {

            let videogameSchema = {
                "status": "OK",
                "message": "Ažuriran objekt videoigre", 
                "response": gameUpdated
            }

            res.status(200).json(videogameSchema,
                [
                    {
                        "href": "/videoigre/" + req.params.videogameID,
                        "rel": "videoigra",
                        "type": "GET",
                        "title": "dohvati videoigru sa ID-om " + req.params.videogameID
                    },
                    {
                        "href": "/videoigre/" + req.params.videogameID,
                        "rel": "videoigra",
                        "type": "DELETE",
                        "title": "izbriši videoigru sa ID-om " + req.params.videogameID
                    }
                ]    
            );
        } else {
            res.status(404).json(
                {
                    "status": "Not Found",
                    "message": "Videoigru sa danim ID-om nije moguće ažurirati",
                    "reponse": null
                }
            );
        }
    } catch (exc) {
        res.status(404).json(
            {
                "status": "Not Found",
                "message": "Videoigru sa danim ID-om nije moguće ažurirati",
                "reponse": null
            }
        );
    }

});

router.delete('/videoigre/:videogameID', async function(req, res, next) {
    
    try {
        let game = await videogame.deleteVideogame(req.params.videogameID);

        if (game) {

            let videogameSchema = {
                "status": "OK",
                "message": "Izbrisan objekt videoigre", 
                "response": game
            }

            res.status(200).json(videogameSchema,
                [
                    {
                        "href": "/videoigre",
                        "rel": "videoigra",
                        "type": "GET",
                        "title": "dohvati listu videoigara"
                    },
                    {
                        "href": "/videoigre",
                        "rel": "videoigra",
                        "type": "POST",
                        "title": "dodaj videoigru"
                    },
                    {
                        "href": "/videoigre/{ID}",
                        "rel": "videoigra",
                        "type": "GET",
                        "title": "dohvati videoigru sa ID-om"
                    },
                    {
                        "href": "/videoigre/{ID}",
                        "rel": "videoigra",
                        "type": "PUT",
                        "title": "ažuriraj videoigru sa ID-om"
                    },
                    {
                        "href": "/videoigre/{ID}",
                        "rel": "videoigra",
                        "type": "DELETE",
                        "title": "izbriši videoigru sa ID-om"
                    }
                ]    
            );
        } else {
            res.status(404).json(
                {
                    "status": "Not Found",
                    "message": "Videoigru sa danim ID-om nije moguće izbrisati",
                    "reponse": null
                }
            );
        }
    } catch (exc) {
        res.status(404).json(
            {
                "status": "Not Found",
                "message": "Videoigru sa danim ID-om nije moguće izbrisati",
                "reponse": null
            }
        );
    }

});

router.all('/videoigre', function(req, res, next) {
    res.status(501).json(
        {
            "status": "Not Implemented",
            "message": "Method not implemented for requested resource",
            "reponse": null 
        }
    );
});

router.all('/videoigre/:videogameID', function(req, res, next) {
    res.status(501).json(
        {
            "status": "Not Implemented",
            "message": "Method not implemented for requested resource",
            "reponse": null 
        }
    );
});

router.get('/proizvodaci', async function(req, res, next) {
    
    try {
        let proizvodaci = await proizvodac.fetchProizvodaciList();

        if (proizvodaci != null) {

            let proizvodaciSchema = {
                "status": "OK",
                "message": "Dohvaćeni objekti proizvođača", 
                "response": proizvodaci
            }

            res.status(200).json(proizvodaciSchema);
        } else {
            res.status(404).json(
                {
                    "status": "Not Found",
                    "message": "Proizvođači nisu pronađeni",
                    "reponse": null
                }
            );
        }
    } catch (exc) {
        res.status(404).json(
            {
                "status": "Not Found",
                "message": "Proizvođači nisu pronađeni",
                "reponse": null
            }
        );
    }

});

router.all('/proizvodaci', function(req, res, next) {
    res.status(501).json(
        {
            "status": "Not Implemented",
            "message": "Method not implemented for requested resource",
            "reponse": null 
        }
    );
});

router.get('/likovi', async function(req, res, next) {
    
    try {
        let likovi = await lik.fetchLikoviList();

        if (likovi != null) {

            let likoviSchema = {
                "status": "OK",
                "message": "Dohvaćeni objekti likova", 
                "response": likovi
            }

            res.status(200).json(likoviSchema);
        } else {
            res.status(404).json(
                {
                    "status": "Not Found",
                    "message": "Likovi nisu pronađeni",
                    "reponse": null
                }
            );
        }
    } catch (exc) {
        res.status(404).json(
            {
                "status": "Not Found",
                "message": "Likovi nisu pronađeni",
                "reponse": null
            }
        );
    } 

});

router.all('/likovi', function(req, res, next) {
    res.status(501).json(
        {
            "status": "Not Implemented",
            "message": "Method not implemented for requested resource",
            "reponse": null 
        }
    );
});

router.get('/izdavaci', async function(req, res, next) {
    
    try {
        let izdavaci = await izdavac.fetchIzdavaciList();

        if (izdavaci != null) {

            let izdavaciSchema = {
                "status": "OK",
                "message": "Dohvaćeni objekti izdavača", 
                "response": izdavaci
            }

            res.status(200).json(izdavaciSchema);
        } else {
            res.status(404).json(
                {
                    "status": "Not Found",
                    "message": "Izdavači nisu pronađeni",
                    "reponse": null
                }
            );
        }
    } catch (exc) {
        res.status(404).json(
            {
                "status": "Not Found",
                "message": "Izdavači nisu pronađeni",
                "reponse": null
            }
        );
    }

});

router.all('/izdavaci', function(req, res, next) {
    res.status(501).json(
        {
            "status": "Not Implemented",
            "message": "Method not implemented for requested resource",
            "reponse": null 
        }
    );
});

module.exports = router;