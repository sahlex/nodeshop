const mongodb = require('mongodb');
const { getEnabledCategories } = require('trace_events');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {

    MongoClient.connect(
        'mongodb://shopuser:secret@s-doc-app-903.haba.int/shopdb?retryWrites=true'
    ).then((client) => {
        console.log('Connected!')
        _db = client.db();
        callback();
    }).catch((err) => {
        console.log(err);
        throw err;
    });

}

const getDb = () => {
    if (_db) {
        return _db;
    }

    throw 'No Database defined!';
}

module.exports = {
    mongoConnect: mongoConnect,
    getDb: getDb
}