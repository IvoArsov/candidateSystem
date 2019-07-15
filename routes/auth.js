const express = require('express')
const passport = require('passport')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const encription = require('../utilities/encryption')
const tokenSaver = require('../utilities/tokenSaver')

const router = new express.Router()

router.post('/signup', (req, res, next) => {
  if (req.headers.authorization === 'nUwdaa*=632Ate') {
    if (typeof req.body.firstName === 'string' &&
      typeof req.body.lastName === 'string' &&
      typeof req.body.email === 'string' &&
      typeof req.body.role === 'string' &&
      typeof req.body.username === 'string' &&
      typeof req.body.password === 'string') {
      let salt = encription.generateSalt()
      let hashedPass = encription.generateHashedPassword(salt, req.body.password)
      
      let user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role,
        username: req.body.username,
        salt: salt,
        hashedPass: hashedPass
      }
      let sql = `INSERT INTO users (first_name, last_name, created_on, email, username, salt, hashed_pass, role, count_assigns) VALUES ("${user.firstName}", "${user.lastName}", NOW(), "${user.email}", "${user.username}", "${salt}", "${user.hashedPass}", "${user.role}", 0)`

      global.connection.query(sql, (err, results, fields) => {
        if (err) {
          res.send({ "status": 200, "error": err.sqlMessage, "response": null, "message": "Wrong Form", success: false })
        } else {
          res.send({ "status": 200, "error": null, "response": results, "message": "Register Successful", success: true })
        }
      })

      global.connection.end()
    } else {
      res.send({ "status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false })
    }

  } else {
    res.send({ "status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false })
  }
})

router.post('/login', (req, res, next) => {

  if (req.headers.authorization === 'nUwdaa*=632Ate') {
    let user = {
      username: req.body.username,
      password: req.body.password
    }

    let searchSql = `SELECT id, username, email, salt, hashed_pass, role FROM users WHERE username = "${user.username}"`

    global.connection.query(searchSql, (err, result, fields) => {
      if (result.length === 0) {
        res.send(JSON.stringify({
          success: false,
          message: 'Wrong Credentials!'
        }))
      } else {
        let resSalt = result[0].salt
        let hashedPass = result[0].hashed_pass
        let resId = result[0].id
        let newHash = encription.generateHashedPassword(resSalt, user.password)
        
        const payload = {
          sub: resId
        }

        let userData = {
          userId: result[0].id,
          username: result[0].username,
          email: result[0].email,
          role: result[0].role
        }
        
        if (newHash === hashedPass) {
          const token = jwt.sign(payload, 's0m3 r4nd0m str1ng')
          tokenSaver.setToken(token)
          return res.json({
            success: true,
            message: 'You have successfully logged in!',
            token,
            user: userData
          })
        } else {
          return res.json({
            success: false,
            message: 'Wrong Credentials!'
          })
        }
      }
    })

    global.connection.end()
  } else {
    res.send({ "status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false })
  }
})

router.get('/all', (req, res, result) => {
  let authToken = tokenSaver.getToken()
  if (req.headers.authorization === authToken) {
    let sql = `SELECT id, first_name, last_name, username, email, role FROM users ORDER BY role DESC`

    global.connection.query(sql, (err, results, fields) => {
      if (err) {
        res.send({ "status": 200, "error": err.sqlMessage, "response": null, "message": "Wrong Form", success: false })
      } else {
        res.send({ "status": 200, "error": null, "response": results, "message": "All users data delivered!", success: true })
      }
    })

    global.connection.end()
  } else {
    res.send({ "status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false })
  }
})

router.delete('/delete/:id', (req, res, result) => {
  let authToken = tokenSaver.getToken()
  if (req.headers.authorization === authToken) {
    let userId = req.params.id

    let sql = `DELETE FROM users WHERE id = ${userId}`

    global.connection.query(sql, (err, results, fields) => {
      if (err) {
        res.send({ "status": 200, "error": err.sqlMessage, "response": null, "message": "Employee have assign! Cannot delete!", success: false })
      } else {
        res.send({ "status": 200, "error": null, "response": results, "message": "Delete user succesful!", success: true })
      }
    })

    global.connection.end()
  } else {
    res.send({ "status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false })
  }

})

router.get('/1/noAssign', (req, res, result) => {
  let authToken = tokenSaver.getToken()
  if (req.headers.authorization === authToken) {
    let sql = `SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.role, a.task FROM users AS u LEFT JOIN assigns AS a ON a.user_id = u.id WHERE a.task IS NULL`

    global.connection.query(sql, (err, results, fields) => {
      if (err) {
        res.send({ "status": 200, "error": err.sqlMessage, "response": null, "message": "Error", success: false })
      } else {
        res.send({ "status": 200, "error": null, "response": results, "message": "Users without assigns!", success: true })
      }
    })

    global.connection.end()
  } else {
    res.send({ "status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false })
  }
})

router.get('/1/withAssign', (req, res, result) => {
  let authToken = tokenSaver.getToken()
  if (req.headers.authorization === authToken) {
    let sql = `SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.role, a.task FROM users AS u LEFT JOIN assigns AS a ON a.user_id = u.id WHERE a.task IS NOT NULL GROUP BY u.id`

    global.connection.query(sql, (err, results, fields) => {
      if (err) {
        res.send({ "status": 200, "error": err.sqlMessage, "response": null, "message": "Error", success: false })
      } else {
        res.send({ "status": 200, "error": null, "response": results, "message": "Users without assigns!", success: true })
      }
    })

    global.connection.end()
  } else {
    res.send({ "status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false })
  }
})

module.exports = router
