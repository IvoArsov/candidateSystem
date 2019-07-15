const express = require('express')
const passport = require('passport')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const async = require('async')
const encription = require('../utilities/encryption')
const tokenSaver = require('../utilities/tokenSaver')

const router = new express.Router()

router.get('/all', (req, res, result) => {
    let authToken = tokenSaver.getToken()
  
    if (req.headers.authorization === authToken) {
      let sql = `SELECT id, created_on, eik_number, company_name, organization_type, company_address, email, phone, project_name, project_description, project_budget, creator_id FROM project_info ORDER BY created_on DESC`
  
      global.connection.query(sql, (err, results, fields) => {
        if (err) {
          res.send({ "status": 200, "error": err.sqlMessage, "response": null, "message": "Opss", success: false })
        } else {
          res.send({ "status": 200, "error": null, "response": results, "message": "Data for all project delivered!", success: true })
        }
      })
  
      global.connection.end()
    } else {
      res.send({ "status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false })
    }
  })

  router.post('/add', (req, res, result) => {
    let authToken = tokenSaver.getToken()

    if(req.headers.authorization === authToken){
      let sql = `INSERT INTO project_info (created_on, eik_number, company_name, organization_type, company_address, email, phone, project_name, project_description, project_budget, creator_id) VALUES(NOW(), ${req.body.eikNumber}, "${req.body.companyName}", "${req.body.organizationType}", "${req.body.companyAddress}", "${req.body.email}", "${req.body.phone}", "${req.body.projectName}", "${req.body.projectDescription}", ${req.body.projectBudget}, ${req.body.creatorId});`
      let sql2 = `INSERT INTO project_partners (partner_company_name, partner_company_eik_number, partner_company_phone, partner_company_email, project_id) VALUES("${req.body.partnerCompanyName}", ${req.body.partnerCompanyEikNumber}, "${req.body.partnerCompanyPhone}", "${req.body.partnerCompanyEmail}", last_insert_id());`

      async.parallel([
        function(parallel_done) {
            connection.query(sql, {}, function(err, results) {
                if (err) return parallel_done(err)
                //res.send({"status": 200, "error": null, "response": result, "message": "Project Added Successful", success: true})
                parallel_done()
            });
        },
        function(parallel_done) {
            connection.query(sql2, {}, function(err, results) {
                if (err) return parallel_done(err)
                //return_data.table2 = results
                parallel_done();
            });
        }
     ], function(err) {
          if (err) console.log(err);
          connection.end();
          res.send({"status": 200, "error": null, "response": result, "message": "Project Added Successful", success: true})
     });
     
      }else{
        res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
      }
  }
)

  router.post('/edit/:id', (req, res, result) => {
    let authToken = tokenSaver.getToken()
    if(req.headers.authorization === authToken){

      let sql = `UPDATE project_info SET created_on=NOW(), eik_number = "${req.body.eikNumber}", company_name = "${req.body.companyName}", organization_type = "${req.body.organizationType}", company_address = "${req.body.companyAddress}", email = "${req.body.email}", phone = "${req.body.phone}", project_name = "${req.body.projectName}", project_description = "${req.body.projectDescription}", project_budget = "${req.body.projectBudget}" WHERE id = ${req.body.id};`
      
      let sql2 = `UPDATE project_partners SET partner_company_name = "${req.body.partnerCompanyName}", partner_company_eik_number = "${req.body.partnerCompanyEikNumber}", partner_company_phone = "${req.body.partnerCompanyPhone}", partner_company_email = "${req.body.partnerCompanyEmail}" WHERE project_id = ${req.body.id};`  
      
      async.parallel([
        function(parallel_done) {
            connection.query(sql, {}, function(err, results) {
                if (err) return parallel_done(err)
                //res.send({"status": 200, "error": null, "response": result, "message": "Project Added Successful", success: true})
                parallel_done()
            });
        },
        function(parallel_done) {
            connection.query(sql2, {}, function(err, results) {
                if (err) return parallel_done(err)
                //return_data.table2 = results
                parallel_done();
            });
        }
     ], function(err) {
          if (err) console.log(err);
          connection.end();
          res.send({"status": 200, "error": null, "response": result, "message": "Project Edited Successful", success: true})
     });
      
    }else{
        res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
    }

  })

  router.get('/profile/:id', (req, res, result) => {
    let authToken = tokenSaver.getToken()
    if(req.headers.authorization === authToken){
      let projectId = req.params.id
      let sql = `SELECT p.id AS project_id, p.creator_id, p.project_name, p.created_on, p.eik_number, p.company_name, p.organization_type, p.company_address, p.email, p.phone, p.project_description, p.project_budget, a.id AS partner_id, a.partner_company_name, a.partner_company_eik_number, a.partner_company_phone, a.partner_company_email, a.project_id FROM project_info AS p JOIN project_partners AS a ON a.project_id = p.id WHERE p.id = ${projectId};`
    
      global.connection.query(sql, (err, result, fields) => {
        if (err){
            res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error!", success: false})
          } else{ 
            res.send({"status": 200, "error": null, "response": result, "message": "Информацията за проекта е доставена!", success: true})
          }
      })

      global.connection.end()    
    }else{
      res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
    }  
  })

  router.post('/notifications/add', (req, res, result) => {
    let sql = `INSERT INTO notifications (firm_name, project_name, creator_id) VALUES ("${req.body.company_name}", "${req.body.project_name}", ${req.body.creator_id});`

    global.connection.query(sql, (err, result, fields) => {
      if (err){
          res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Този проект вече е одобрен!", success: false})
        } else{ 
          res.send({"status": 200, "error": null, "response": result, "message": `Одобрихте проект: ${req.body.project_name}`, success: true})
        }
    })

    global.connection.end()
  })

  router.get('/notifications/all', (req, res, result) => {
    

    let sql = `SELECT id, firm_name, project_name FROM notifications;`

    global.connection.query(sql, (err, result, fields) => {
      if (err){
          res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error!", success: false})
        } else{
          console.log(result) 
          res.send({"status": 200, "error": null, "response": result, "message": "Проектите на потребителя!", success: true})
        }
    })

    global.connection.end()
  })

  router.get('/getByAuthor/:id', (req, res, result) => {
      let userId = req.params.id

      let sql = `SELECT id, project_name, project_description, project_budget FROM project_info WHERE creator_id = ${userId} ORDER BY created_on DESC;`

      global.connection.query(sql, (err, result, fields) => {
        if (err){
            res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error!", success: false})
          } else{ 
            res.send({"status": 200, "error": null, "response": result, "message": "Проектите на потребителя!", success: true})
          }
      })

      global.connection.end()
  })

  router.delete('/delete/:id', (req, res, result) => {
    let authToken = tokenSaver.getToken()
    if(req.headers.authorization === authToken){
        let projectId = req.params.id
        let sql = `DELETE FROM project_info WHERE id = ${projectId}`
        
        global.connection.query(sql, (err, result, fields) => {
            if (err){
                res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error!", success: false})
              } else{ 
                res.send({"status": 200, "error": null, "response": result, "message": "Project Deleted!", success: true})
              }
        })
  
        global.connection.end()
    } else{
        res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
    }
})

module.exports = router   