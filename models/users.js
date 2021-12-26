//= Requirements
const Database = require('better-sqlite3');

//= Local Variables
const db_filename = './models/data/users.db'
// const db = new Database


//= Module
module.exports = {
    //== User Functions
    Users: [],
    User: class User{
        constructor(obj){
            this.password = obj.password // user password
            this.name = obj.name // user name
            this.id = obj.id
        }
    },
    statements:[
        'INSERT INTO users (name, password)'
    ],
    LoadUsers: function(){
    },
}