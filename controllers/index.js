module.exports = (app, db) => {
    require('./auth.controller')(app, db);
    require('./client.controller')(app, db);
}