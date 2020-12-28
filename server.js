const express = require('express');
const cors = require('cors');
const path = require('path');
const api = require('./src/service/api')
const passSocket = require('passport.socketio');
const cookieParser = require('cookie-parser');

const passport = require("passport");
const session = require("express-session");

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const initializePassport = require("./auth")(passport);

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname,'public'));
app.set('view engine', 'ejs');

//session
app.use(session({
  secret:"1996",
  resave:false,
  saveUnitialized:false,
  //cookie:{maxAge: 2 * 60 * 1000}
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

//----------------------------------ROTAS--------------------------------------------
app.get('/',authenticationMiddleware,(req, res)=>{
    res.redirect('/home');
});

app.post('/login',passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login?fail=true"
}));

app.get("/login",(req, res) => {
res.render("index.ejs");
});

//pagina home
app.get('/home',notAuthenticationMiddleware,async (req, res)=>{

  const id = req.session.passport.user;
  await api.get('usuario/'+id).then(response => (this.info = response.data.usuario[0]));
  const perfil = this.info;
 

  await api.get('usuario').then(response => (this.info = response.data.usuarios));
  const user = this.info;
  
  res.render('index.ejs',{title:"Usuarios",user,perfil});
});

//Criar usuario
app.post("/createuser", async (req, res) => {
  const {nome, email, senha} = req.body;
  const user = {
                nome:nome,
                email:email,
                senha:senha
              };
  console.log(user);
  await api.post('usuario',user).then(response => (this.info = response.data.usuarios));
  res.redirect("/");
});

app.get('/chat',authenticationMiddleware,async (req,res)=>{
  const id = req.session.passport.user;
  await api.get('usuario/'+id).then(response => (this.info = response.data.usuario[0]));
  res.render("chat.ejs",this.info);
});

//Buscar mensagens quando clicar no ususario
//ok
app.get('/mensagens',async (req,res)=>{   
    await api.get('mensage').then(response=>this.info = response.data.usuario);
    const dados = this.info;
    res.json({dados});
});

//Enviar mensagens
app.get('/mensagem',(req,res)=>{
    const{conteudo, remetente, destinatario} = req.body;
    const msg = {conteudo:"asdasdasd", 
    remetente: "diones@gmail.com",
    destinatario: "matheus63360@gmail.com",}
    api.post('mensage',msg).then(response=>(this.info = response.data));     
    const response = this.info;           
    res.json(response);
});


app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

//---------------------------------FIM ROTAS---------------------------

function authenticationMiddleware(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.render('login.ejs');
}

function notAuthenticationMiddleware(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
}

//LISTA DE MENSAGENS
async function getMessages(){
  await api.get('mensage').then(response=>this.info = response.data.messages);
  const mensagens = this.info;
  return mensagens;
}

//ENVIA MENSAGENS BANCO
async function sendMessage(msg){
  await api.post('mensage',msg);
  const mensagem = this.info;
  return mensagem;
}

//GET USERNAME
async function getUsername (){
console.log("AAAAA");
app.get(async (req, res) => {
  console.log("AAAAA");
  const id = req.session.passport.user;
  console.log(id);
  await api.get('usuario/'+id).then(response=>this.info = response.data.usuario);
  const user = this.info;
  return user;
});

  
  
}

io.on('connection',async socket => {
  
    console.log(`Socket conectado:${socket.id}`);

    socket.emit('previousMessages',await getMessages());//ok

    socket.on('sendMessage', data => {
        console.log(data);
        sendMessage(data);//manda para o banco
        socket.broadcast.emit('receivedMessage',data);
    });


});


server.listen(3008, ()=>{
    console.log('Conectado na porta 3008');
});