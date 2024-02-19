const db = require('./db/connection')
const fs = require('fs/promises')

function selectTopics() {
    return db.query(`SELECT * FROM topics`)
    .then((data) => {
        return data.rows
    })
}

function selectDescription() {
    return fs.readFile('endpoints.json', 'utf-8')
    .then((data) => {
        const parsedEndpoints = JSON.parse(data)
        return { description: parsedEndpoints }
    })
}



module.exports = { selectTopics, selectDescription }