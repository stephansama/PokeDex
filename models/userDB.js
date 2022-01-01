//= Requirements
const Database = require('better-sqlite3');
const fs = require('fs');
require('dotenv').config()

// Local Variables
const ROOT = process.env.ROOT || './models/'
const DATA = process.env.POKE ||'data/'
const SUFFIX = process.env.SUFFIX || '_dex.db'
const DEX_SQL = process.env.DEX_SQL || ROOT + 'sql/dex.sql'
const USER_DB = process.env.USER_DB || ROOT + DATA + 'users.db'
const USER_SQL = process.env.USER_SQL || ROOT + 'sql/user.sql'

//= Module
module.exports = {
    PokemonTypes: [
        'undefined',
        'electric',
        'fighting',
        'psychic',
        'normal',
        'poison',
        'steel',
        'fairy',
        'ghost',
        'water',
        'grass',
        'rock',
        'fire',
        'bug',
        'ice',
        'flying',
        'ground',
        'dragon',
    ],
    //== Pokemon Functions
    Pokemon: class Pokemon{
        constructor(obj, LastID=null) {
            if(LastID){ // if new extract from JSON object
                this.ID = LastID + 1
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
                this.TYPE = [obj.TYPE1, obj.TYPE2]
                this.STATS = {
                    HP: obj.HP,
                    ATK: obj.ATK,
                    DEF: obj.DEF,
                    SPATK: obj.SPATK,
                    SPDEF: obj.SPDEF,
                    SPEED: obj.SPEED,
                }
            }
        } 
    },
    //== User Functions
    Users: [],
    UserDB: new Database(USER_DB),
    User: class User{
        constructor(obj){
            this.ID = obj.ID
            this.NAME = obj.NAME
            this.PASSWORD = obj.PASSWORD
            this.db = new Database(this.filename())
            this.POKEMON = this.loadPokemon()
        }

        filename() { return ROOT + DATA + this.NAME + SUFFIX }

        findPOKEMON(POKEID){ return this.POKEMON.find(poke => {return poke.POKEID == POKEID}) }

        // load pokemon data from db
        loadPokemon(){
            // create table for pokedex
            const file = fs.readFileSync(DEX_SQL,'utf-8')
            this.db.exec(file)
            // select all pokemon in pokedex
            const result = this.db.prepare(`SELECT * FROM dex`)
            const all = result.all()
            return all ? all : []
        }

        deletePokemon(pokemonID){
            let t = this.POKEMON.findIndex(poke => {
                return poke.POKEID === pokemonID
            })
            
            if(t === -1) return false

            this.db.exec(`DELETE FROM dex WHERE POKEID = ${pokemonID}`)
            this.POKEMON.splice(t, 1)
            return true;
        }

        updatePokemon(pokemonID, newPokemon){
            const old = this.findPOKEMON(pokemonID)

            if(!old) return false

            newPokemon.ID = old.ID

            const statement = `
            UPDATE dex
            SET NAME=\'${newPokemon.NAME}\',
            TYPE1=\'${newPokemon.TYPE[0]}\',
            TYPE2=\'${newPokemon.TYPE[1]}\',
            HP=${newPokemon.STATS.HP},
            ATK=${newPokemon.STATS.ATK},
            DEF=${newPokemon.STATS.DEF},
            SPATK=${newPokemon.STATS.SPATK},
            SPDEF=${newPokemon.STATS.SPDEF},
            SPEED=${newPokemon.STATS.SPEED}
            WHERE POKEID = ${pokemonID};`

            console.log(statement)

            this.db.exec(statement)
            return true
        }

        // Insert to SQL DB and Pokemon array
        addPokemon(Pokemon){
            this.POKEMON.push(Pokemon)
            const query = `
            INSERT INTO dex (
                POKEID, NAME, IMGURL,
                TYPE1, TYPE2,
                HP, ATK, DEF,
                SPATK, SPDEF, SPEED)
            VALUES (
                ${Pokemon.POKEID}, \'${Pokemon.NAME}\', \'${Pokemon.IMGURL}\',
                \'${Pokemon.TYPE[0]}\', \'${Pokemon.TYPE[1]}\',
                ${Pokemon.STATS.HP}, ${Pokemon.STATS.ATK}, ${Pokemon.STATS.DEF},
                ${Pokemon.STATS.SPATK}, ${Pokemon.STATS.SPDEF}, ${Pokemon.STATS.SPEED});`
            console.log(query)
            this.db.exec(query)
        }
    },

    nextID: (List) => { return List.length === 0 ? 1 : List[List.length - 1].ID + 1 },
    
    // delete user from live array and db file
    DeleteUser: function(ID){
        const find = this.Users.find(elem => elem.ID == ID)
        if(!find) return false
        this.Users.splice(find.ID-1, 1)
        this.UserDB.exec(`DELETE FROM users WHERE ID = ${find.ID};`)
        fs.unlink(find.filename(), err => {
            if(err) return 2
        })
        return true
    },
    
    // add newly created user to db file
    AddUser: function(User){
        this.Users.push(User)
        this.UserDB.exec(`INSERT INTO users (NAME, PASSWORD)
        VALUES (\'${User.NAME}\',\'${User.PASSWORD}\');`)
    },

    UpdateUser: (ID, DB)=>{
    },

    // Load all users from db file
    LoadUsers: function(){

        // create table if it doesn't exist
        const file = fs.readFileSync(USER_SQL,'utf-8')
        this.UserDB.exec(file)
        // load users from SQL table
        const res = this.UserDB.prepare(`SELECT * FROM users`)
        res.all().forEach(elem =>{
            this.Users.push(new this.User(elem))
        })

        // change pokemon data from sql to class object
        this.Users.forEach(user =>{
            user.POKEMON = user.POKEMON.map(pokemon => {return new this.Pokemon(pokemon)})
        })

        console.log(this.Users)
        console.log(this.UserDB)
    },
}