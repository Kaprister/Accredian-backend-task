const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const db = require("./database");
const PORT = 4000;
const bcrypt = require('bcrypt');



const app = express();
app.use(cors());
app.use(express.json());


app.post('/signup', (req, res) => {
    const sql = "INSERT INTO signup(`name`, `email`, `password`) VALUES (?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ]

    const checkEmail = values[1];
    const checkEmailQuery = 'SELECT * FROM signup WHERE email = ?';
    db.query(checkEmailQuery, checkEmail, async (checkEmailErr, checkEmailData) => {
        if (checkEmailErr) {
            return res.json('ERROR');
        }
        if (checkEmailData.length > 0) {
            // Email already exists
            return res.json('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(values[2], 10);
        const valuesStore = [values[0], values[1], hashedPassword];
        console.log(valuesStore);

        
        db.query(sql, [valuesStore], (err, data) => {
            if(err){
                return res.json("ERROR");
            }
            return res.json("User registered successfully");
        })
    });

    


})





app.post('/login', (req, res) => {
    const sql = "SELECT * FROM signup WHERE `email` = ? AND `password` = ?";
    const { email, password } = req.body;
    console.log(password);
    // const isPasswordValid = await bcrypt.compare(password, password);
    // const getUserQuery = 'SELECT * FROM signup WHERE email = ?';
    // const [userData] =  db.query(getUserQuery, [email]);
    // console.log(userData[0].password);

    // db.query(sql, [req.body.email, req.body.password], (err, data) => {
    //     if(err){
    //         return res.json("ERROR");
    //     }
    //     if(data.length > 0){
    //         return res.json("Success");
    //     }else{
    //         return res.json("Failed");
    //     }
    // });

    const checkEmail = email;
    const checkEmailQuery = 'SELECT * FROM signup WHERE email = ?';
    db.query(checkEmailQuery, checkEmail, async (checkEmailErr, checkEmailData) => {
        if (checkEmailErr) {
            return res.json('ERROR');
        }
        if (checkEmailData.length > 0) {
            const getPasswordQuery = 'SELECT password FROM signup WHERE email = ?';

            db.query(getPasswordQuery, [email], (err, result) => {
            if (err) {
                console.error(err);
                // Handle the error
                return res.json('ERROR');
            } else {
                // result[0].password contains the hashed password for the given email
                console.log(result[0].password);
                const hashedPassword = result[0].password;
                const userEnteredPassword = password.toString();

                bcrypt.compare(userEnteredPassword, hashedPassword, (compareErr, isPasswordValid) => {
                    if (compareErr) {
                        console.error(compareErr);
                        // Handle the error
                        return res.json('ERROR');
                    }

                    if (isPasswordValid) {
                        console.log('Password is valid');
                        return res.json('Success');
                    } else {
                        console.log('Password is incorrect');
                        return res.json('password is incorrect');
                    }
                });


                

            }
            });
            
        }else{
            console.log("email not registered");
            return res.json("Email Not Registered");
        }
    });





    
})

// ======================


// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Retrieve user with the given email from the database
//     const getUserQuery = 'SELECT * FROM signup WHERE email = ?';
//     const [userData] =  db.query(getUserQuery, [email]);
//     console.log(userData[0].password);

//     if (userData.length === 0) {
//       // User not found
//       return res.json('Failed');
//     }

//     // Compare the entered password with the hashed password in the database
//     const isPasswordValid = await bcrypt.compare(password, userData[0].password);

//     if (isPasswordValid) {
//       // Password is correct
//       return res.json('Success');
//     } else {
//       // Password is incorrect
//       return res.json('Failed');
//     }
//   } catch (error) {
//     console.error(error);
//     return res.json('ERROR');
//   }
// });



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    db.connect((err) => {
        if(err){
            console.log(`DATABASE CONNECTION FAILED`);
            console.log(err);
        }else{
            console.log(`Database Connected SuccessFully!`);
        }
    })
})