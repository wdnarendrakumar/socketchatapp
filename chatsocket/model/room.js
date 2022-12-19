const { DataTypes } = require('sequelize');


let seq = require('../modules/sequelize');
const Chat = require('./chat');

const Room = seq.define('Rooms', {
    roomid:{
        type:DataTypes.TEXT,
        primaryKey:true
    }

})
Room.hasOne(Chat,{
    foreignKey:'roomid',
    sourceKey:'roomid'
})
// Room.hasOne(Chat)
// Room.belongsTo(User)

module.exports = Room