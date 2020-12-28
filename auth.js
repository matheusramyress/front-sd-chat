const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const api = require('./src/service/api');

module.exports = function (passport) {
    console.log('Inicio');

    async function findUser(email) {
        const emailobjt = {email:email};
        await api.post('usuario/email',emailobjt).then(response => (this.data = response.data.usuario[0]));
        return this.data;
    }

    async function findUserById(id) {
        await api.get('usuario/'+id).then(response => (this.info = response.data.usuario[0]));
        return this.info;
    }

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        try {
            const user = findUserById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pass'
    },
        async (email, pass, done) => {
            try {
                const user = await findUser(email);
                // usuário inexistente
                if (!user) { return done(null, false) }
                // comparando as senhas
                const isValid = bcrypt.compareSync(pass, user.senha);

                if (!isValid) return done(null, false)
                
                return done(null, user)
            } catch (err) {
                done(err, false);
            }
        }
    ));
}