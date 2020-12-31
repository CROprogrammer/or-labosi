const db = require('../db')

//razred Order enkapsulira zaključenu narudžbu korisnika
module.exports = class Videogame {
    
    //konstruktor narudžbe
    constructor(naziv, godinaizdanja, metascore, wikipedia, multiplayer, proizvodac, izdavac) {
        
        this.id = undefined; //generirat ce se u bazi podataka
        this.naziv = naziv;
        this.godinaizdanja = godinaizdanja;
        this.metascore = metascore;
        this.wikipedia = wikipedia;
        this.multiplayer = multiplayer;
        this.proizvodac = proizvodac;
        this.izdavac = izdavac;

    }

    static async fetchVideogamesList() {
       
        let results = await dbGetListOfVideogames();

        return results;
        
    }

    static async fetchByVideogameId(id) {
       
        let game = await dbGetVideogame(id);

        return game;
    }

    //pohrana videoigre u bazu podataka
    //static async persistVideogame(naziv, godinaizdanja, metascore, wikipedia, multiplayer, proizvodac, izdavac) {
    static async persistVideogame(game) {
        //provjeriti postoje li proizvodac i izdavac
        try {
            let newGame = new Videogame(game.naziv, game.godinaizdanja, game.metascore,
                game.wikipedia, game.multiplayer, game.proizvodac, game.izdavac);
            let id = await dbNewVideogame(newGame);
            //this.id = id;
            return id;
        } catch(err) {
            console.log("ERROR persisting videogame data :(");
            throw err;
        }
    }

    static async updateVideogame(id, game) {
        //provjeriti postoje li proizvodac i izdavac
        try {
            let gameUpdated = await dbUpdateVideogame(id, game);
            //this.id = id;
            return true;
        } catch(err) {
            return false;
        }
    }

    static async deleteVideogame(id) {
        try {
            let game = await dbDeleteVideogame(id);
            return true;
        } catch(err) {
            return false;
        }
    }

}

dbGetListOfVideogames = async () => {
    const sql = "SELECT * FROM videoigra";
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }
}

dbGetVideogame = async (id) => {
    const sql = "SELECT * FROM videoigra WHERE videoigraid = " + id + ";";
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}

//umetanje zapisa o videoigri u bazu podataka
dbNewVideogame = async (videogame) => {
    const sql = "INSERT INTO videoigra (nazivVideoigra, godinaIzdanja, metascore, wikipedia_stranica, multiplayer, nazivProizvodac, nazivIzdavac) " +
        "VALUES ('" + videogame.naziv + "', '" + videogame.godinaizdanja + "', '" + videogame.metascore + "', '" + videogame.wikipedia + "', '" + 
        videogame.multiplayer + "', '" + videogame.proizvodac + "', '" + videogame.izdavac + "') RETURNING videoigraid";
        console.log(sql);
    try {
        const result = await db.query(sql, []);
        return result.rows[0].videoigraid;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

dbUpdateVideogame = async (id, videogame) => {
    const sql = "UPDATE videoigra SET nazivVideoigra = '" + videogame.naziv + "', godinaIzdanja = '" + videogame.godinaizdanja + "', metascore = '" +
    videogame.metascore + "', wikipedia_stranica = '" + videogame.wikipedia + "', multiplayer = '" + videogame.multiplayer + "'," +
    " nazivProizvodac = '" + videogame.proizvodac + "', nazivIzdavac = '" + videogame.izdavac + "' WHERE videoigraid = " + id + ";";
    try {
        const result = await db.query(sql, []);
        //return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}

dbDeleteVideogame = async (id) => {
    const sql = "DELETE FROM videoigra WHERE videoigraid = " + id;
    try {
        const result = await db.query(sql, []);
        //return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}