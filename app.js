const express = require("express");
const session = require("express-session");
const { get } = require("express/lib/response");
const sqlite3 = require("sqlite3");


const app = express(); //Armazena as chamadas e propriedades da biblioteca EXPRESS

const PORT = 8000;

//Conexão com o Banco de Dados
const db = new sqlite3.Database("users.db");
db.serialize(() => {
    db.run(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
    )

    db.run(
        "CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, titulo TEXT, conteudo TEXT, data_criacao TEXT)"
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
    res.render("pages/index", { titulo: "Index" , req: req}); 
})

app.get("/sobre", (req, res) => {
    console.log("GET /sobre")
    res.render("pages/sobre", { titulo: "Sobre" , req: req});
})

app.get("/login", (req, res) => {
    console.log("GET /login")
    res.render("pages/login", { titulo: "Login" , req: req});
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
            req.session.loggedin = true;
            req.session.username = username;
            req.session.id_username = row.id; //Armazena o ID do usuário na sessão
            res.redirect("/dashboard")
        } else {
            res.redirect("/usuario_incorreto")
        }
    })
    // res.render("pages/login")
})

app.get("/cadastro", (req, res) => {
    console.log("GET /cadastro")
    res.render("pages/cadastro", { titulo: "Cadastro" , req: req});
});

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
            res.redirect("usuario_cadastrado")
        
        } else {
            db.get(query2, [username, password], (err, row) => {

                if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO

                //1. Verificar se o usuário existe
                console.log(JSON.stringify(row))
                console.log(`Usuário ${username} cadastrado com sucesso`)
                res.redirect("/cadastro_concluido")
            })
        }
    })
});
app.get("/post_create", (req, res) => {
    console.log("GET /post_create")
    //verificar se o usuário está logado 
    if(req.session.loggedin){
    //se estiver renderizar a página de criação de post  
    res.render("pages/post_form", { titulo: "Criar postagem" , req: req}); 
    } else {
    //se não estiver redirecionar para a página de usuario invalido
        res.redirect("/nao_autorizado")
    }
})
app.post("/post_create", (req, res) => {
    console.log("POST /post_create")
    if(req.session.loggedin) {
        console.log("Dados da postagem ", req.body);
        const { titulo, conteudo } = req.body;
        const data_criacao = new Date();
        console.log("Username: ", data_criacao, "username:", req.session.username, "id_username:", req.session.id_username,);
        const query = "INSERT INTO posts (id_users, titulo, conteudo, data_criacao) VALUES (?, ?, ?, ?)";

        db.get(query, [req.session.id_username, titulo, conteudo, data_criacao], (err, row) => {
            if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO
            res.send("Post criado com sucesso");

            //1. Verificar se o usuário existe
            
        })
    } else {
        res.redirect("/nao_autorizado")
    }
})

app.get("/logout", (req, res) => {
    console.log("GET /logout")
    req.session.destroy(() => {
       res.redirect("/");

    });
});

app.get("/dashboard", (req, res) => {
    console.log("GET /dashboard")
    //res.render("./pages/dashboard", {titulo: "Dashboard"});
    //Listar todos os usurios
    if(req.session.loggedin){
    const query = "SELECT * FROM users";
    db.all(query, [], (err, row) => {
        if (err) throw err;
        console.log(JSON.stringify(row));
        res.render("pages/dashboard", { titulo: "Tabela de usuários", dados: row, req: req });
    })
    } else {
        res.redirect("/nao_autorizado")
    }
});
      app.get("/nao_autorizado", (req, res) => {
    res.render("./pages/nao_autorizado", { titulo: "Usuario não autorizado", req: req });
    console.log("GET /nao_autorizado");
})
      app.get("/usuario_cadastrado", (req, res) => {
    res.render("./pages/usuario_cadastrado", { titulo: "Usuario autorizado", req: req });
    console.log("GET /usuario_cadastrado");
})
      app.get("/usuario_incorreto", (req, res) => {
    res.render("./pages/usuario_incorreto", { titulo: "Usuario incorreto", req: req });
    console.log("GET /usuario_incorreto");
})
      app.get("/cadastro_concluido", (req, res) => {
    res.render("./pages/cadastro_concluido", { titulo: "Cadastro Concluido", req: req });
    console.log("GET /cadastro_concluido");
})
      app.use('/{*erro}', (req, res) => {
  
  res.status(404).render('pages/erro', { titulo: "ERRO 404", req: req, msg: "404" });
});

app.listen(PORT, () => {
    console.log(`Servidor sendo excexutado na porta ${PORT}`)
    console.log(__dirname + "\\static")
});