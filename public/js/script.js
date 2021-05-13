window.onbeforeunload = ()=>{
    return "Do not refresh page, use leavechat button to leave the chat";
}

const token = document.getElementById("token").innerText;
const dtoken = JSON.parse(atob(token.split('.')[1]));

const host = window.location.host;
const socket = new WebSocket(`ws://${host}/${token}`)

const ch_name = document.getElementById("ch_name");
const nick_name = document.getElementById("nick_name");
ch_name.innerText = dtoken.channel;
nick_name.innerText = dtoken.name;

const chat = document.querySelector('.chat-form')
const Input = document.querySelector('.chat-input')


const chatWindow = document.querySelector('.chat-window')

const renderMessage = (sender,message,l) =>{
    const d = document.getElementById("tmp").content.querySelector("div");
    let a = document.importNode(d, true);
    a.querySelector("b").innerText = sender;
    a.getElementsByTagName("p")[1].innerText = message;

    if(l == 0){
        a.style.color = "blue"
        a.style.textAlign = "right"
    }
    else{
        a.style.color = "red"
        a.style.textAlign = "left"
    }
    chatWindow.appendChild(a);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// precompute your DSA key
const myKey = new DSA();

const otrConfig = {
    // long-lived private key
    priv: myKey,
    // turn on some debuggin logs
    debug: true,
    // fragment the message in case of char limits
    fragment_size: 140,
    // ms delay between sending fragmented msgs, avoid rate limits
    send_interval: 200
};

const otrClient = new OTR(otrConfig);

otrClient.on('ui', (msg, encrypted, meta) => {
    // Use this callback to display a decrypted message to a user
    let msgObj = JSON.parse(msg);
    renderMessage(msgObj.name, msgObj.msg, 1);
});

otrClient.on('io', (msg, meta) => {
    // Send here an encrypted message to other user
    socket.send(JSON.stringify(msg));
});

otrClient.on('error', (err, severity) => {
    // ...
});

otrClient.on('status', state => {
    // Status of encryption initialization process
    // Possible states:
    // OTR.CONST.STATUS_SEND_QUERY  : 0
    // OTR.CONST.STATUS_AKE_INIT    : 1
    // OTR.CONST.STATUS_AKE_SUCCESS : 2
    // OTR.CONST.STATUS_END_OTR     : 3
    console.log("Status:", state);
});


chat.addEventListener('submit',event=> {
    event.preventDefault()
    renderMessage("You", Input.value, 0)
    console.log(JSON.stringify({name:dtoken.name, msg:Input.value}));
    otrClient.sendMsg(JSON.stringify({name:dtoken.name, msg:Input.value}))
    Input.value = ''
})

// on receiving message from socket
socket.onmessage = (msg) =>{
    console.log(msg.data);
    let obj = JSON.parse(msg.data);
    if(obj.handshake){
        if(obj.handshake == 2){
            // initiate OTR
            console.log("OTR initiated");
            otrClient.sendQueryMsg();
        }
    }
    else if(obj.error){
        renderMessage("", obj.error, 1)
    }else if(obj.info){
        renderMessage("", obj.msg, 1)
    }else{
        // give to otrClient
        console.log(obj);
        otrClient.receiveMsg(obj);
    }
}

socket.onclose = (err) => {
    renderMessage("", "Connection broken: "+err.message,1)
}
