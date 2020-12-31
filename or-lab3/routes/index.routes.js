var express = require('express');
const Videogame = require('../models/VideogameModel');
var router = express.Router();
var videogame = require('../models/VideogameModel');
var proizvodac = require('../models/ProizvodacModel');
var lik = require('../models/LikoviModel');
var izdavac = require('../models/IzdavaciModel');

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

        if (game != null) {

            let videogameSchema = {
                "status": "OK",
                "message": "Dohvaćen objekt videoigre", 
                "response": game
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