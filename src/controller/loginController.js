import { v4 as uuidv4 } from 'uuid';
import loginRegisterService from "../service/loginRegisterService";
import { createJWT } from '../middleware/JWTAction';
import "dotenv/config";

const getLoginPage = (req, res) => {
    let { serviceURL } = req.query;
    return res.render("login.ejs", { redirectURL: serviceURL });
}

const verifySSOToken = async (req, res) => {
    try {
        const ssoToken = req.body.ssoToken;
        console.log("check ssoToken", ssoToken);
        console.log("check ssoToken user", req.user);

        if (req.user && req.user.code && req.user.code === ssoToken) {
            const refreshToken = uuidv4();
            await loginRegisterService.updateRefreshToken(req.user.email, refreshToken);

            let payload = {
                email: req.user.email,
                groupWithRoles: req.user.groupWithRoles,
                username: req.user.username,
            }
            let token = createJWT(payload);

            //set cookie
            res.cookie("access_token", token, {
                maxAge: process.env.MAX_AGE_ACCESS_TOKEN,
                httpOnly: true,
                domain: process.env.COOKIE_DOMAIN,
                path: "/"
            });
            res.cookie("refresh_token", refreshToken, {
                maxAge: process.env.MAX_AGE_REFRESH_TOKEN,
                httpOnly: true,
                domain: process.env.COOKIE_DOMAIN,
                path: "/"
            });

            const resData = {
                access_token: token,
                refresh_token: refreshToken,
                email: req.user.email,
                groupWithRoles: req.user.groupWithRoles,
                username: req.user.username,
            }

            //destroy 
            req.session.destroy(function (err) {
                if (err) { return next(err); }
            });
            return res.status(200).json({
                EC: 0,
                EM: "ok",
                DT: resData
            });
        } else {
            return res.status(200).json({
                EC: 1,
                EM: "not match token",
                DT: ""
            });
        }
    } catch (error) {
        return res.status(200).json({
            EC: -1,
            EM: "Server Error",
            DT: ""
        });
    }
}

module.exports = { getLoginPage, verifySSOToken }