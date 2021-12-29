//= Requirements
const Database = require('better-sqlite3');
const fs = require('fs');
// const db = new Database

//= Module
module.exports = {
    //== Pokemon Functions
    Pokemon: class Pokemon{
        constructor(obj, newInstance=true) {
            if(newInstance){ // if new extract from JSON object
                this.POKEID = parseInt(obj.id)
                this.NAME = obj.name
                this.IMGURL = obj.img
                this.TYPE = obj.type
                this.STATS = {
                    HP: parseInt(obj.stats.hp), 
                    ATK: parseInt(obj.stats.attack),
                    DEF: parseInt(obj.stats.defense),
                    SPATK: parseInt(obj.stats.spattack),
                    SPDEF: parseInt(obj.stats.spdefense),
                    SPEED: parseInt(obj.stats.speed)
                }
            } else { // remove from SQL object
                this.ID = obj.ID
                this.POKEID = obj.POKEID
                this.NAME = obj.NAME
                this.IMGURL = obj.IMGURL
                this.TYPE = obj.TYPE
                this.STATS = {
                    HP: obj.HP,
                    ATK: obj.ATK,
                    DEF: obj.DEF,
                    SPATK: obj.SPATK,
                    SPDEF: obj.SPDEF,
                    SPEED: obj.SPEED,
                }
            }
        } },
    //== User Functions
    Users: [],
    UserDB: new Database('./models/data/users.db'),
    User: class User{
        constructor(obj){
            this.ID = obj.ID
            this.NAME = obj.NAME
            this.PASSWORD = obj.PASSWORD
            this.db = new Database(this.filename())
            this.POKEMON = this.loadPokemon()
        }

        filename() { return './models/data/' + this.NAME + '_dex.db' }

        // load pokemon data from db
        loadPokemon(){
            // create table for pokedex
            const file = fs.readFileSync('./models/sql/dex.sql','utf-8')
            this.db.exec(file)
            // select all pokemon in pokedex
            const result = this.db.prepare(`SELECT * FROM dex`)
            const all = result.all()
            return all ? all : []
        }

        deletePokemon(index){
            this.POKEMON.splice(index, 1)
            this.db.exec(`DELETE FROM dex WHERE ID = ${this.POKEMON[index].POKEID}`)
        }

        // Insert to Sql DB and Pokemon array
        addPokemon(Pokemon){
            this.POKEMON.push(Pokemon)
            this.db.exec(`
            INSERT INTO dex (
                POKEID, NAME, IMGURL,
                TYPE1, TYPE2,
                HP, ATK, DEF,
                SPATK, SPDEF, SPEED)
            VALUES (
                ${Pokemon.POKEID}, \'${Pokemon.NAME}\', \'${Pokemon.IMGURL}\',
                \'${Pokemon.TYPE[0]}\', \'${Pokemon.TYPE[1]}\',
                ${Pokemon.STATS.HP}, ${Pokemon.STATS.ATK}, ${Pokemon.STATS.DEF},
                ${Pokemon.STATS.SPATK}, ${Pokemon.STATS.SPDEF}, ${Pokemon.STATS.SPEED})`)
        }
    },

    nextID: (List) => {
        return List.length === 0 ? 1 : List[List.length - 1].ID + 1
    },
    
    // delete user from live array and db file
    DeleteUser: (ID, List, DB) => {
        const find = List.find(elem => elem.ID == ID)
        if(!find) return false
        List.splice(find.ID-1, 1)
        DB.exec(`DELETE FROM users WHERE ID = ${find.ID};`)
        fs.unlink(`${'./models/data/' + find.NAME + '_dex.db'}`, err => {
            if(err) return 2
        })
        return true
    },
    
    // add newly created user to db file
    AddUser: (User, DB)=>{
        // console.log(self.UserDB)
        DB.exec(`INSERT INTO users (NAME, PASSWORD)
        VALUES (\'${User.NAME}\',\'${User.PASSWORD}\');`)
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
            this.Users.push(new this.User(elem))
        })

        // change pokemon data from sql to class object
        this.Users.forEach(user =>{
            user.POKEMON = user.POKEMON.map(pokemon => {return new this.Pokemon(pokemon,newInstance=false)})
        })

        console.log(this.Users)
        console.log(this.UserDB)
    },
}