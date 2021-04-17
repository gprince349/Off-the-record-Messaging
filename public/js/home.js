const cch_form = document.getElementById("cch_form");
const cch_msg = document.getElementById("cch_msg");

cch_form.addEventListener('submit',event=> {
    event.preventDefault()

    const name = document.getElementById("cch_name").value;
    const data = { name: name };

    const submit_btn = document.getElementById("cch_submit");
    submit_btn.disabled = true;
    cch_msg.innerText = "";

    fetch('http://localhost:3000/createChannel', {
        method: 'POST',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        submit_btn.disabled = false;
        cch_msg.innerText = JSON.stringify(data);
        console.log('Success:', data);
    })
    .catch((error) => {
        submit_btn.disabled = false;
        console.error('Error:', error);
    });

})

