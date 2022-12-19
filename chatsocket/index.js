let Chat = require('./model/chat')
let User = require('./model/users')
let auth = require('./modules/firebaseadmin')
let Room = require('./model/room')
require('dotenv').config()
let seq = require('./modules/sequelize')
let jwt = require('jsonwebtoken')
let { v4: uuid } = require('uuid')
const http = require('http').createServer()
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

io.on('connection', client => {
    console.log('connect')


    client.on('showusers', (data) => {
        let users = []
        User.findAll().then(value => {
            value.forEach(value => {
                users.push(value.dataValues)
            })
            client.emit('senduser', users)
        })
    })

    client.on('joinroom', (data) => {
        const user = jwt.verify(data.jwt, process.env.JWTSECRET)
        let roomid = uuid().split('-').join('')
        Room.findOne({ where: { userid1: user.userid, userid2: data.userid } }).then( value => {
            if (!value) {
                return Room.findOne({ where: { userid1: data.userid, userid2: user.userid } })
            }
            else {
             
                client.join(`${value.dataValues.roomid}`)
                client.emit('setuserid', user.userid)
              
            }
        }).then(value => {
            if (!value) {
                new Room({
                    userid1: user.userid,
                    userid2: data.userid,
                    roomid: roomid
                }).save().then(value => {
                    client.join(`${roomid}`)
                    client.emit('setuserid', user.userid)
                })
            }
            else {
                client.join(`${value.dataValues.roomid}`)
                client.emit('setuserid', user.userid)
            }
        })
    })

    client.on('receivemessage', async (data) => {
        const user = jwt.verify(data.jwt, process.env.JWTSECRET)
        let roomid
      
        await Room.findOne({
            where: {
                userid1: user.userid,
                userid2: data.userid
            }
        }).then(async value => {
            
            if (!value) {
               await Room.findOne({
                    where: {
                        userid1: data.userid,
                        userid2: user.userid
                    }
                }).then(value => {
                  
                    if (!value) {

                    }
                    else {
                        roomid = value.dataValues.roomid
                    }
                })
            }
            else {
                roomid = value.dataValues.roomid
            }
        })
        Chat.findOne({
            where: {
                roomid: roomid
            }
        }).then(value => {
            if (value){
                client.emit('getmessage', {
                    roomid: roomid,
                    message: value.dataValues
                })
            }
           
            else {
                client.emit('getmessage', {
                    roomid: roomid,
                    message: {
                        chats: []
                    }
                })
            }
        })
    })

    client.on('newuser', (data) => {
        auth.verifyIdToken(data.token).then(value => {
            let user = new User({
                email: value.email,
                name: data.name,
                userid: uuid().split('-').join('')
            })
            user.save().then((val) => {
                client.emit('generatejwttoken', { jwt: jwt.sign({ userid: val.dataValues.userid, email: val.dataValues.email, name: val.dataValues.name }, process.env.JWTSECRET) })
            }).catch(error => {
                User.findOne({ where: { email: value.email } }).then(v => {
                    client.emit('generatejwttoken', { jwt: jwt.sign({ userid: v.dataValues.userid, email: v.dataValues.email, name: v.dataValues.name }, process.env.JWTSECRET) })
                })
            })
        }).catch(error => {
            client.emit('signinerror', error)
        })
    })

    client.on('message', async data => {
        const user = jwt.verify(data.jwt, process.env.JWTSECRET)
        Chat.findOne({
            where: {
                roomid: data.roomid
            }
        }).then(async (value) => {
            if (!value) {
              await  new Chat({
                    roomid: data.roomid,
                    chats: [JSON.stringify({ text: data.text, userid: user.userid })]
                }).save()
                client.to(`${data.roomid}`).emit('sendmessage',{text:data.text,userid:user.userid})

            } else {
                await Chat.update({
                    'chats': seq.fn('array_append', seq.col('chats'), JSON.stringify({ text: data.text, userid: user.userid }))
                }, {
                    'where': { 'roomid': data.roomid }
                }).then(value => {
                    console.log(value)
                    client.to(`${data.roomid}`).emit('sendmessage',{text:data.text,userid:user.userid})
                })
            }
        })


    })
    client.on('disconnect', () => {

    })
})

http.listen(80)

