import passport from "passport";
import LocalStrategy from "passport-local";
import loginRegisterService from "../service/loginRegisterService";

const configPassport = () => {
    passport.use(new LocalStrategy(async function verify(username, password, done) {
        const data = {
            valueLogin: username,
            password: password
        }
        let res = await loginRegisterService.handleUserLogin(data);
        if (res && +res.EC === 0) {
            return done(null, res.DT);
        } else {
            return done(null, false, { message: res.EM });
        }
    }));
}

const handleLogout = (req, res, next) => {
    req.session.destroy(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
}

module.exports = { configPassport, handleLogout }