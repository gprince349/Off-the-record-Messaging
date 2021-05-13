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

function updateScroll(){
    // var element = document.getElementById("yourDivID");
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

const renderMessage = (message,l) =>{
    const div = document.createElement('div')
    // const div2 = document.createElement('div')

    div.classList.add('render-message')
    // div2.classList.add('msg-cover')

    div.innerText = message
    if(l == 0){
        div.style.color = "blue"
        div.style.textAlign = "right"
    }
    else{
        div.style.color = "red"
        div.style.textAlign = "left"
    }
    // div2.append(div)
    chatWindow.appendChild(div)
    updateScroll();
}



chat.addEventListener('submit',event=> {
    event.preventDefault()
    socket.send(Input.value)
    renderMessage(Input.value,0)
    Input.value = ''
})

socket.onmessage = (msg) =>{
    console.log(msg.data);
    let obj = JSON.parse(msg.data);
    let text = "@"+obj.name+"--> "+obj.msg;
    if(obj.error){
        text = obj.error;
    }
    renderMessage(text,1)
}

socket.onclose = (err) => {
    renderMessage("Connection broken: "+err.message,1)
}