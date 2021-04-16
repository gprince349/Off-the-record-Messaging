const jwt = document.cookie.split('=')[1];
const socket = new WebSocket(`ws://localhost:3000/${jwt}`)

const chat = document.querySelector('.chat-form')
const Input = document.querySelector('.chat-input')


const chatWindow = document.querySelector('.chat-window')

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
}



chat.addEventListener('submit',event=> {
    event.preventDefault()
    socket.send(Input.value)
    renderMessage(Input.value,0)
    Input.value = ''
})

socket.onmessage = (msg) =>{
    // console.log('from server', msg)
    renderMessage(msg.data,1)
}
