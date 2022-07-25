import "dotenv/config";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from "passport";
import loginRegisterService from "../../service/loginRegisterService";
import { v4 as uuidv4 } from 'uuid';

const configLoginWithGoogle = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_APP_CLIENT_ID,
        clientSecret: process.env.GOOGLE_APP_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_APP_REDIRECT_LOGIN
    },
        async function (accessToken, refreshToken, profile, cb) {
            // console.log("Check google", profile);
            const typeAcc = "GOOGLE";
            const dataRaw = {
                username: profile.displayName,
                email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : profile.id
            }
            let user = await loginRegisterService.upsertUserWithSocialMedia(typeAcc, dataRaw);
            user.code = uuidv4();
            return cb(null, user);
        }
    ));
}

export default configLoginWithGoogle;