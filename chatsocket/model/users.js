const { DataTypes } = require('sequelize');

let seq = require('../modules/sequelize');
const Room = require('./room');

const User = seq.define('Users', {
    userid: {
        type: DataTypes.TEXT,
        primaryKey: true
    },
    email: {
        type: DataTypes.TEXT,
        unique: true
    },
    name: DataTypes.TEXT
})
User.hasOne(Room, {
    foreignKey: "userid1",
    sourceKey: "userid"
})
User.hasOne(Room, {
    foreignKey: "userid2",
    sourceKey: "userid"
})
// seq.sync({
//     alter: true
// })
// User.hasOne(Room)
module.exports = User

// User.sync()

