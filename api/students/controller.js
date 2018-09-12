const models = require("./../models");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const jwt = require("jsonwebtoken");

module.exports = {
  // ---------------------------------------------------------------------------
  // GET /students
  get: (req, res) => {
    models.students.findAll({ limit: 100 }).then(student => {
      if (student === null) {
        return res.send({
          message: "data not fund"
        });
      }

      res.send({
        data: student
      });
    });
  },
  // ---------------------------------------------------------------------------
  // GET /students/login
  login: async (req, res) => {
    try {
      //1. find the accunt
      let student = await models.students
        .findOne({ where: { email: req.body.email } })
        .then(student => student);

      //2. check if the student is exist
      if (student === null) {
        return res.send({
          message: "student not found"
        });
      }

      //3. password validation
      const validPassword = bcrypt.compareSync(
        req.body.password,
        student.password
      );
      if (!validPassword) {
        return res.send({
          message: "password is not valid"
        });
      }

      //4. create payload
      let token_data = {};
      token_data.payload = {
        name: `${student.first_name} ${student.last_name}`,
        email: student.email
      };
      token_data.secret = process.env.JWT_SECRET;
      token_data.options = {
        expiresIn: "30d" // EXPIRATION: 30 days
      };
      const token = jwt.sign(
        token_data.payload,
        token_data.secret,
        token_data.options
      );
      res.send({
        message: "You are logged in",
        email: req.body.email,
        token: token
      });
    } catch (err) {
      res.send({
        message: "error",
        error: err
      });
    }
  },
  // ---------------------------------------------------------------------------
  // GET /students/:emp_no
  getById: (req, res) => {
    req.params.emp_no = JSON.parse(req.params.emp_no);
    models.employees
      .findOne({ where: { emp_no: req.params.emp_no } })
      .then(employee => {
        if (employee === null) {
          return res.send({
            message: "data not fund"
          });
        }

        res.send({
          data: employee
        });
      });
  },
  // ---------------------------------------------------------------------------
  // POST /students/register
  register: async (req, res) => {
    const SALT_WORK_FACTOR = 10;
    const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);

    req.body.password = bcrypt.hashSync(req.body.password, salt);

    models.students
      .create(req.body)
      .then(student => {
        res.send({
          message: "insert student data success",
          data: student
        });
      })
      .catch(err => {
        res.send({
          message: "error",
          error: err
        });
      });
  },
  // ---------------------------------------------------------------------------
  // PUT /students/:email
  put: async (req, res) => {
    console.log(req.decoded);

    // models.students.findOne({ where: { emp_no: req.params.emp_no } }).then(employee => {
    //     if (employee) {
    //         return employee.update(req.body).then(updated_employee => res.send({
    //             message: "update data success",
    //             data: updated_employee
    //         })).catch(err => Promise.reject(err))
    //     } else {
    //         res.send({
    //             message: "data not found",
    //         })
    //     }
    // }).catch(err => {
    //     res.send({
    //         message: "error",
    //         error: err
    //     })
    // })

    // using async await
    // try {
    //     let employee = await models.employees.findOne({ where: { emp_no: req.params.emp_no } }).then(employee => employee)

    //     if (employee) {
    //         await employee.update(req.body).then(updated_employee => res.send({
    //             message: "update data success",
    //             data: updated_employee
    //         }))
    //     } else {
    //         res.send({
    //             message: "data not found",
    //         })
    //     }
    // } catch (err) {
    //     res.send({
    //         message: "error",
    //         error: err
    //     })
    // }
  }
};
