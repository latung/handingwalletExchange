const io = require("socket.io-client");

// let socket = io.connect("http://206.189.82.236:3009");
let socket = io.connect("http://localhost:3009");

socket.emit('join', { id: 'abc' });

socket.on("exchangeListen", (data) => {
    console.log('exchangeListen', data);
})
socket.on("dataUsers", function (data) {
    console.log('dataUsers', data);
});