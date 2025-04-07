const express = require ("express");
const session = require ("express-session");
const sqlite3 = require("sqlite3")
const app = express(); // Armazena as chamadas e propriedade de biblioteca EXPRESS  

const PORT = 8000;

app.use ('/static', express.static(__dirname + '/static'));

app.set('view engine', 'ejs');

app.get ("/", (req, res) => {
    //res.send("<img src=' ./static/kendrick.pjpeg'/>");
    res.render("index");
})
app.get ("/sobre", (req, res) => {
    console.log("GET /sobre")
    res.render("sobre");
})
app.get ("/dashboard", (req, res) => {
    console.log("GET /dashboard")
    res.send("Você está na pagina DASHBOARD");
})

app.listen(PORT, () => {
    console.log(`servidor sendo executado na porta ${PORT}`);
    console.log(__dirname + "\\static");
});
