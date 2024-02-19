const { selectTopics, selectDescription } = require("./models")



function getTopics(req, res, next) {
    selectTopics()
    .then((topics) => {
        res.status(200).send( {topics} )
    })
    .catch((err) => next(err))
}

function getDescription(req, res, next) {
    selectDescription()
    .then((description) => {
        res.status(200).send( {description} )
    })
    .catch((err) => next(err))
}


module.exports = { getTopics, getDescription }