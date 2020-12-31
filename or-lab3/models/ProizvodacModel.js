const db = require('../db')

//razred Order enkapsulira zaključenu narudžbu korisnika
module.exports = class Proizvodac {

    //konstruktor narudžbe
    constructor(naziv) {
        
        this.id = undefined; //generirat ce se u bazi podataka
        this.naziv = naziv;

    }

    static async fetchProizvodaciList() {
       
        let results = await dbGetListOfProizvodaci();

        return results;
        
    }

}

dbGetListOfProizvodaci = async () => {
    const sql = "SELECT * FROM proizvodac";
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }
}

dbExist = async (proizvodac) => {
    const sql = "SELECT * FROM proizvodac WHERE proizvodacid = " + proizvodac.id + ";";
    try {
        const result = await db.query(sql, []);
        return true;
    } catch (err) {
        return false;
    }

}