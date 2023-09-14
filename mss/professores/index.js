const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });
const app = express();
app.use(bodyParser.json());

const port = process.env.MSS_PORTA_PROFESSORES;


const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


const VerificarToken = require('../middlewares/VerificarToken.js');
//const AuthCheck = require('../middlewares/AuthCheck.js');

// Configuração do banco de dados
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_SERVER,
  database: process.env.DB_USER,
  password: process.env.DB_PWD,
  port: process.env.DB_PORT,
});



app.post('/professores', async (req, res) => {
  try {
    const { user_id, nome, email } = req.body;

    const query = 'INSERT INTO professor (user_id, nome, email) VALUES ($1, $2, $3) RETURNING id_professor, user_id, nome, email, email_inst_verif';
    const values = [user_id, nome, email];

    const result = await pool.query(query, values);
    console.log("O que veio no result", result.rows)

    const professor = {
      id_professor: result.rows[0].id_professor,
      user_id: result.rows[0].user_id, // Corrigido
      nome: result.rows[0].nome,
      email: result.rows[0].email,
      email_inst_verif: result.rows[0].email_inst_verif // Corrigido
    };
    
    res.status(201).json({ message: 'Professor cadastrado com sucesso!', professor });
    

    if (res.status(201)) {
      // Envio de email ao usuário com link de validação
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.REACT_APP_EMAIL_USER,
          pass: process.env.REACT_APP_EMAIL_PWD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: process.env.REACT_APP_EMAIL_USER,
        to: email,
        subject: "Bem vindo ao SGB - FATEC Ipiranga",
        html: `
                  <p>Olá, professor ${nome.split(' ')[0]}</p>
                  <p>Bem vindo ao Sistema Gerenciador de Bancas da FATEC Ipiranga!</p>
                  <p>Para confirmar seu cadastro e validar seu e-mail institucional, por favor, clique no link abaixo:</p>
                  <p><a href="http://localhost:3000/VerifyEmailProfessor/${professor.id_professor}">Clique aqui para validar o cadastro</a></p>
                  <p>Atenciosamente,</p>
                  <p>Equipe SGB</p>
              `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error)
        } else {
          console.log("Email enviado:", info.response)
        }
      })
    }

  } catch (error) {
    console.error('Erro ao cadastrar o professor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



app.get('/professores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM professor');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



app.get('/professores/:id_professor', async (req, res) => {
  const id_professor = req.params.id_professor;

  try {
    const result = await pool.query('SELECT * FROM professor WHERE id_professor = $1', [id_professor]);
    console.log(result.rows[0])
    if (result.rows.length === 0) {
      res.status(404).json({ error: `Professor com ID ${id_professor} não encontrado.` });
    } else {
      const professor = {
        id_professor: result.rows[0].id_professor,
        user_id: result.rows[0].user_id,
        nome: result.rows[0].nome,
        email: result.rows[0].email,
        email_inst_verif: result.rows[0].email_inst_verif
      };

      res.status(200).json(professor);
    }
  } catch (error) {
    console.error(`Erro ao buscar professor com ID ${id_professor}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});




app.put('/professores/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id, nome, email, email_inst_verif } = req.body;
    const result = await pool.query(
      'UPDATE professor SET user_id=$1, nome=$2, email=$3, email_inst_verif=$4 WHERE id_professor=$5 RETURNING *',
      [user_id, nome, email, email_inst_verif, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



app.patch('/professores/:id_professor', async (req, res) => {
  try {
    const id_professor = req.params.id_professor;
    const { email_inst_verif } = req.body;

    if (email_inst_verif !== true) {
      return res.status(400).json({ error: 'O atributo email_inst_verif deve ser true para a atualização.' });
    }

    const query = 'UPDATE professor SET email_inst_verif = $1 WHERE id_professor = $2 RETURNING *';
    const values = [email_inst_verif, id_professor];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }

    const professor = {
      id_professor: result.rows[0].idprofessor,
      user_id: result.rows[0].userid,
      nome: result.rows[0].nome,
      email: result.rows[0].email,
      email_inst_verif: result.rows[0].emailinstverif
    };

    res.json({ message: 'Professor atualizado com sucesso!', professor });
  } catch (error) {
    console.error('Erro ao atualizar o professor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});




app.delete('/professores/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query('DELETE FROM professor WHERE id_professor=$1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    res.json({ message: 'Professor deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
