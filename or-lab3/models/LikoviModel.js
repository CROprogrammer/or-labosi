const db = require('../db')

//razred Order enkapsulira zaključenu narudžbu korisnika
module.exports = class Lik {

    //konstruktor narudžbe
    constructor(ime, nazivVideoigre) {
        
        this.id = undefined; //generirat ce se u bazi podataka
        this.ime = ime;
        this.nazivVideoigre = nazivVideoigre;

    }

    static async fetchLikoviList() {
       
        let results = await dbGetListOfLikovi();

        return results;
        
    }

}

dbGetListOfLikovi = async () => {
    const sql = "SELECT * FROM lik";
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }
}