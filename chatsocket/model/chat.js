const { DataTypes } = require('sequelize');
let seq = require('../modules/sequelize')
const Chat = seq.define('Chat', {
    chats: {
      type:DataTypes.ARRAY(DataTypes.JSON),
      allowNull: false
    }
  });


module.exports = Chat
// seq.sync({force:true})
// seq.sync({force:true
// })

// const u = new User({
//     userName:"wdnarendra",
//     password:"it'sasecret"
// })
// u.save()