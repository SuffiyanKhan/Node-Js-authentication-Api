const http = require('http')
const queryString = require('node:querystring')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')

const PORT = 3001
const filePath = path.join(process.cwd(), 'data.json')


const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.url === '/') {
        res.write('Home Route')
        res.end()
        return
    }

    if (req.url === '/signup' && req.method === 'POST') {
        let data = ""
        req.on('data', (chunk) => {
            data += chunk
        })

        req.on('end', () => {

            const parsedData = JSON.parse(data)
            console.log(parsedData.Password)
            bcrypt.hash(parsedData.Password, 10, (err, hash) => {
                if (err) {
                    console.log("ERROR", err)
                }
                parsedData.Password = hash

                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        console.log("Error reding file", err);
                    } else {
                        const newData = JSON.parse(data)
                        newData.push(parsedData)
                        console.log("Data", newData);
                        fs.writeFile(filePath, JSON.stringify(newData), (err) => {
                            if (err) {
                                console.log("ERROR", err)
                            }
                            console.log("SUCCESSFULLY")
                        })
                    }

                })

            })
            res.write('Success')
            res.end()
        })
        return
    }
    if (req.url === '/login' && req.method === 'POST') {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', () => {
            const parsedData = JSON.parse(data);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.log("Error reading file", err);
                    res.write('Error reading data file');
                    res.end();
                    return;
                }
                const users = JSON.parse(data);
                const user = users.find(u => u.Username === parsedData.Username);
                if (!user) {
                    res.write('Invalid Username');
                    res.end();
                    return;
                }
                bcrypt.compare(parsedData.Password, user.Password, (err, result) => {
                    if (err) {
                        console.log("Error comparing passwords", err);
                        res.write('Error comparing passwords');
                        res.end();
                        return;
                    }
                    if (result) {
                        res.write('Success');
                        res.end();
                    } else {
                        res.write('Invalid Credentials');
                        res.end();
                    }
                });
            });
        });
        return;
    }



    res.write('Invalid Route')
    res.end()
})

server.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
})