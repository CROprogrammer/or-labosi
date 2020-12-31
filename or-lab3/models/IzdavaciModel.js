const db = require('../db')

//razred Order enkapsulira zaključenu narudžbu korisnika
module.exports = class Izdavac {

    //konstruktor narudžbe
    constructor(ime, naziv) {
        
        this.id = undefined; //generirat ce se u bazi podataka
        this.naziv = naziv;

    }

    static async fetchIzdavaciList() {
       
        let results = await dbGetListOfIzdavaci();

        return results;
        
    }

}

dbGetListOfIzdavaci = async () => {
    const sql = "SELECT * FROM izdavac";
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }
}