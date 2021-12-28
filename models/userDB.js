//= Requirements
const Database = require('better-sqlite3');
const fs = require('fs');

//= Local Variables
const db_filename = './models/sql/user.sql'
// const db = new Database

//= Module
module.exports = {
    //== Pokemon Functions
    Pokemon: class Pokemon{
        constructor(obj) {
            this.ID = obj.ID
            this.NAME = obj.NAME
            this.IMGURL = obj.IMGURL
            this.TYPE = [
                obj.TYPE1,
                obj.TYPE2]
            this.STATS = {
                HP: obj.HP, 
                ATK: obj.ATK,
                SPATK: obj.SPATK,
                SPDEF: obj.SPDEF,
                SPEED: obj.SPEED } } },
    //== User Functions
    Users: [],
    UserDB: new Database('./models/data/users.db'),
    User: class User{
        constructor(obj, old=true){
            this.ID = obj.ID
            this.NAME = obj.NAME
            this.FILENAME = obj.FILENAME
            this.PASSWORD = obj.PASSWORD
            if(!old)
                this.FILENAME = this.NAME + '_dex.db'
            this.db = new Database('./models/data/' + this.FILENAME)
            this.POKEMON = this.loadPokemon()
        }

        loadPokemon(){
            // create table for pokedex
            const file = fs.readFileSync('./models/sql/dex.sql','utf-8')
            this.db.exec(file)
            // select all pokemon in pokedex
            const result = this.db.prepare(`SELECT * FROM dex`)
            return result.all()
        }

        addPokemon(Pokemon){
            this.db.exec(`
            INSERT INTO dex (
                POKEID, NAME, IMGURL,
                TYPE1, TYPE2,
                HP, ATK, DEF,
                SPATK, SPDEF, SPEED)
            VALUES (
                ${Pokemon.ID}, ${Pokemon.NAME}, ${Pokemon.IMGURL},
                ${Pokemon.TYPE[0]}, ${Pokemon.TYPE[1]},
                ${Pokemon.STATS.HP}, ${Pokemon.STATS.ATK}, ${Pokemon.STATS.DEF},
                ${Pokemon.STATS.SPATK}, ${Pokemon.STATS.SPDEF}, ${Pokemon.STATS.SPEED})`)
        }
    },
    
    // delete user from live array and db file
    DeleteUser: (ID) =>{
        const find = this.Users.find((elem, idx) => {
            if(elem.ID === ID) return [elem, idx]
        })
        if(!find) return false
        this.Users.splice(find[1], 1)
        this.UserDB.exec(`DELETE FROM users WHERE ID = ${find[0].ID};`)
    },
    
    // add newly created user to db file
    AddUser: (User, DB)=>{
        // console.log(self.UserDB)
        DB.exec(`INSERT INTO users (NAME, PASSWORD, FILENAME)
        VALUES (\'${User.NAME}\',\'${User.PASSWORD}\',\'${User.FILENAME}\');`)
    },

    UpdateUser: (ID, DB)=>{

    },

    // Load all users from db file
    LoadUsers: function(){
        // create table if it doesn't exist
        const file = fs.readFileSync('./models/sql/user.sql','utf-8')
        this.UserDB.exec(file)
        // load elements from the table
        const res = this.UserDB.prepare(`SELECT * FROM users`)
        res.all().forEach(elem =>{
            this.Users.push(elem)
        })

        console.log(this.Users)
        console.log(this.UserDB)
    },
}