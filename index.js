import express from 'express'
import jwt from 'jsonwebtoken'

const app = express();

app.use(express.json())

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, ACCESS_TOKEN, (err, data) => {
        if (err) {
            return res.sendStatus(403); // Forbidden // Forbidden
        }

        req.user = data;
        next();
    })
}

const ACCESS_TOKEN = 'aopoqy73cnji39h3nbaguyrbv13';
const REFRESH_TOKEN = 'aofh3cnji39h3nbag89sdadv13';

let refreshTokens = []

const users = [
    {id: 1, name: "Adam", email: "adam@dobrze.wlkadam"},
    {id: 2, name: "Lukasz", email: "lukasz@czego.szukasz"},
]

app.get('/', (req, res) => {
    res.send('Hello from main page')
})

app.get("/admin", authMiddleware, (req, res) => {
    res.send("Hello from admin page")
})

app.post("/login", (req, res) => {
    const user = users.find(u => u.email === req.body.email.trim());
    if (!user) {
        return res.sendStatus(401); // Unauthorized
    }

    const payload = user

    const token = jwt.sign(payload, ACCESS_TOKEN, {expiresIn: '15s'})
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN)
    refreshTokens.push(refreshToken)

    res.json({token, refreshToken})
})

app.post("/refresh-token", (req, res) => {
    const {token} = req.body
    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403)
    }

    jwt.verify(token, REFRESH_TOKEN, (err, data) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        const payload = {
            id: data.id,
            name: data.name,
            email: data.email
        }
        const newAccessToke = jwt.sign(payload, ACCESS_TOKEN, {expiresIn: '15s'})
        res.json({token: newAccessToke})
    })
})

app.delete('logout', (req, res) => {
    const {refreshToken} = req.body
    refreshTokens = refreshTokens.filter(t => t !== refreshToken)
    res.sendStatus(204);

})


app.listen(3000, () => {
    console.log("Server is listening...")
})
