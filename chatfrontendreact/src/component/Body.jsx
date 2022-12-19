import './body.css'
import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import auth from '../firebaseconfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function Body() {
    const [userid,setuserid] = useState('')
    const [room, setroom] = useState('')
    const [users, setusers] = useState([])
    const [chatarray, setchatarray] = useState([])
    const [jwt, setjwt] = useState()
    let [result, setresult] = useState([])
    let [user, setuser] = useState()
    const [name, setname] = useState('')
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    let [chat, setchat] = useState('')
    let [socktet, setsocket] = useState()
    const [isconnected, setconnected] = useState(false)
    
    function createuser() {
        if (name) {
            createUserWithEmailAndPassword(auth, email, password).then(value => {
                setuser(value.user)
                socktet.emit('newuser', { token: value.user.accessToken, name: name })

            }).catch(error => {
                signInWithEmailAndPassword(auth, email, password).then(value => {
                    setuser(value.user)
                    socktet.emit('newuser', { token: value.user.accessToken, name: name })
                })
            }).finally(() => {
                console.log(user)
            })
        }
    }
    useEffect(() => {
        if (!isconnected) {
            socktet = io('http://127.0.0.1:80')
            setsocket(socktet)
            setconnected(true)
            socktet.on('connect', () => {
                console.log('hello socket connected')
            })
        }
        else {
            socktet.on('setuserid',data=>{
                setuserid(data)
            })
            socktet.on('senduser', data => {
                let temp2 = []
                data.forEach(value => {
                    if (value.email === email.toLowerCase()) {
                        console.log(true)
                    } else {
                        temp2.push(value)
                    }
                })
                let temp = temp2.map(value => {
                    return <div onClick={() => {
                        console.log(jwt)
                        socktet.emit('joinroom', { jwt: jwt, userid: value.userid })
                        setTimeout(() => {
                            socktet.emit('receivemessage', { jwt: jwt, userid: value.userid })
                        }, 3000)
                    }} key={value.email} style={{ backgroundColor: 'oldlace', padding: '20px', borderRadius: '10px', marginBottom: '10px' }}>{value.name}</div>
                })
                setusers(temp)
            })
            socktet.on('generatejwttoken', data => {
                console.log(data.jwt)
                setjwt(data.jwt)
            })
            socktet.on('getmessage', data => {
                setroom(data.roomid)
                data.message.chats[0]=JSON.parse(data.message.chats[0])
                setchatarray(data.message.chats)
                let keyy = 1;
                let tempsecond = chatarray?.map((value) => {
                    keyy++;
                    let temp, cor
                    if (value.userid === userid) {
                        temp = 'right'
                        cor = '0px'
                    }
                    else {
                        temp = 'left'
                        cor = '400px'
                    }
                    return <div key={keyy}
                        style={{
                            padding: '10px', borderRadius: '10px',
                            backgroundColor: 'yellow',
                            width: 'fit-content',
                            position: 'relative', [temp]: cor
                        }}>{value.text}</div>
                })
                setresult(tempsecond)
            })
            socktet.on('sendmessage', (data) => {
                chatarray.push(data)
                console.log(chatarray)
                setchatarray(chatarray)
                let keyy = 1;
                let tempsecond = chatarray?.map((value) => {
                    keyy++;
                    let temp, cor
                    if (value.userid === userid) {
                        temp = 'right'
                        cor = '0px'
                    }
                    else {
                        temp = 'left'
                        cor = '400px'
                    }
                    return <div key={keyy}
                        style={{
                            padding: '10px', borderRadius: '10px',
                            backgroundColor: 'yellow',
                            width: 'fit-content',
                            position: 'relative', [temp]: cor
                        }}>{value.text}</div>
                })
                setresult(tempsecond)
            })
        }
        return () => {
            socktet.off('connect');
            socktet.off('disconnect');
            socktet.off('sendmessage');
            socktet.off('getmessage');
            socktet.off('generatejwttoken');
            socktet.off('senduser');
            socktet.off('setuserid');
        };
    })
    function sendmessage() {
        chatarray.push({ text: chat, userid: userid })
        setchatarray(chatarray)
        let keyy = 1;
        let tempsecond = chatarray.map((value) => {
            keyy++;
            let temp, cor
            if (value.userid === userid) {
                temp = 'right'
                cor = '0px'
            }
            else {
                temp = 'left'
                cor = '400px'
            }
            return <div key={keyy}
                style={{
                    padding: '10px', borderRadius: '10px',
                    backgroundColor: 'yellow',
                    width: 'fit-content',
                    position: 'relative', [temp]: cor
                }}>{value.text}</div>
        })
        setresult(tempsecond)
        socktet.emit('message', { roomid: room, text: chat, jwt: jwt })
    }

    return <div style={{
        display: 'flex',
        flexDirection: 'row'
    }}>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '20px',
            marginTop: '20px'
        }}>
            {users}
        </div>
        <div style={{
            width: '50vw',
            marginLeft: '30px'
        }}>
            {result}
        </div>
        <div className='inputfield'>
            <input type='text' placeholder='name' onChange={(event) => {
                setname(event.target.value)
            }} />
            <input type='text' placeholder='email' onChange={(event) => {
                setemail(event.target.value)
            }} />
            <input type='text' placeholder='password' onChange={(event) => {
                setpassword(event.target.value)
            }} />
            <input type='submit' value="signin" async onClick={() => {
                createuser()
                setTimeout(() => {
                    socktet.emit('showusers')
                }, 3000)
            }} />
            <input type='text' placeholder='chat' onChange={(event) => {
                setchat(event.target.value)
            }} />
            <button onClick={() => {
                sendmessage()
            }}>send</button>
        </div>
    </div>
}