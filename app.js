const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");


const app = express(); //Armazena as chamadas e propriedades da biblioteca EXPRESS

const PORT = 8000;

//Conexão com o Banco de Dados
const db = new sqlite3.Database("users.db");
db.serialize(() => {
    db.run(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
    )
});
app.use(
    session({
        secret: "senhaforte",
        resave: true,
        saveUninitialized: true,
    })
)

app.use('/static', express.static(__dirname + '/static'))


//Configuração do Express para processar requisições POST com BODY PARAMETERS
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    console.log("GET /")
    res.render("pages/index");
})

app.get("/sobre", (req, res) => {
    console.log("GET /sobre")
    res.render("pages/sobre");
})

app.get("/login", (req, res) => {
    console.log("GET /login")
    res.render("pages/login");
})

//Rota /login para processamento dos dados do formulário de LOGIN no cliente
app.post("/login", (req, res) => {

    console.log("POST /login")
    console.log(JSON.stringify(req.body));
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username=? AND password=?`;

    db.get(query, [username, password], (err, row) => {
        if (err) throw err; 

        //1. Verificar se o usuário existe
        console.log(JSON.stringify(row))
        if (row) {
            res.redirect("/dashboard")
        } else {
            res.send("Usuário Inválido")
        }
    })
    // res.render("pages/login")
})

app.get("/cadastro", (req, res) => {
    console.log("GET /cadastro")
    res.render("pages/cadastro");
})

app.post("/cadastro", (req, res) => {

    console.log("POST /cadastro")
    console.log(JSON.stringify(req.body));
    const { username, password } = req.body;

    const query1 = `SELECT * FROM users WHERE username=?`;
    const query2 = `INSERT INTO users (username, password) VALUES (? , ?)`;

    db.get(query1, [username], (err, row) => {
        if (err) throw err; 

        //1. Verificar se o usuário existe
        console.log(JSON.stringify(row))
        if (row) {
            console.log(`Usuario ${username} já cadastrado`)
            res.send("Este usuário já existe")
        } else {
            db.get(query2, [username, password], (err, row) => {

                if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO

                //1. Verificar se o usuário existe
                console.log(JSON.stringify(row))
                console.log(`Usuário ${username} cadastrado com sucesso`)
                res.redirect("/login")
            })
        }

    })
});
app.get("/logout", (req, res) => {
    console.log("GET /logout")
    req.session.destroy(() => {
       res.redirect("/");

    });
});

app.get("/dashboard", (req, res) => {
    console.log("GET /dashboard")

    if (req.session.loggedin) {
        const query = "SELECT    * FROM users";
        db.all(query, [], (err, row) => {
            if (err) throw err;
            console.log(JSON.stringify(row));
            //Renderiza a pagina dashboard com a lista de usuario coletada de BD pelo select
            res.render("pages/dashboard")


        }
        
        )
    }
    res.render("pages/dashboard");
})

app.listen(PORT, () => {
    console.log(`Servidor sendo excexutado na porta ${PORT}`)
    console.log(__dirname + "\\static")
});