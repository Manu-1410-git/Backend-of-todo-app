const express = require("express");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const dns = require("dns");
const { error } = require("console");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
mongoose.connect("mongodb+srv://csitmanu_db_user:7kmYNG4vwSMrjw03@cluster0.76j95rd.mongodb.net/todo-app-database")

const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        name: z.string().min(3).max(100),
        password: z.string().min(3).max(30)
        
    });

    const parsedData = requiredBody.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid request body",
            errors: parsedData.error
        })
        return
    }   
    // const email = req.body.email;
    // const password = req.body.password;
    // const name = req.body.name;

    try {
        const hashedPassword = await bcrypt.hash(password, 5);
        console.log("Hashed Password:", hashedPassword);

    await UserModel.create({
        email: email,
        password: hashedPassword,
        name: name
    })
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({
            message: "Error during signup"
        });
        return;
    }
    res.json({
        message: "You are signed up"
    })
});

app.post("/signin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email: email
    })
    if(!user) {
        res.status(403).json({
            message: "User does not exist"
        })
        return
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_SECRET);

        res.json({
            token: token
        })
    }else {
        res.status(403).json({
            message: "Incorrect Credentials"
        })

    }
});

app.post("/todo", auth, async function (req, res) {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;


    await TodoModel.create({
        userId: userId,
        title: title,
        done: done
    });

    res.json({
        message: "Todo Added"
    })

});

app.get("/todos", auth, async function (req, res) {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId: userId
    })

    res.json({
        todos
    })

});

app.listen(3000,function(){
    console.log("Server is running on port 3000");
});