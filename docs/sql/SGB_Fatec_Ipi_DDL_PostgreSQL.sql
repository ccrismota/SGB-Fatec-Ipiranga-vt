-- Tabela ALUNO
CREATE TABLE ALUNO (
    idAluno SERIAL PRIMARY KEY,
    ra VARCHAR(13) UNIQUE,
    nome VARCHAR(255),
    email VARCHAR(255),
    curso VARCHAR(255),
    periodo VARCHAR(20),
    senha VARCHAR(200),
    tipoUsuario INT
);

-- Tabela PROFESSOR
CREATE TABLE PROFESSOR (
    idProfessor SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255) UNIQUE
);

-- Tabela TRABALHO
CREATE TABLE TRABALHO (
    idTrabalho SERIAL PRIMARY KEY,
    titulo VARCHAR(255),
    descricao TEXT,
    notaFinal NUMERIC(3, 1) CHECK (notaFinal >= 0 AND notaFinal <= 10)
);

-- Tabela BANCA
CREATE TABLE BANCA (
    idBanca SERIAL PRIMARY KEY,
    idTrabalho INT REFERENCES TRABALHO(idTrabalho),
    dataHora TIMESTAMP UNIQUE
);

-- Tabela CARGO-PROFESSOR
CREATE TABLE CARGO_PROFESSOR (
    id_Cargo_Prof SERIAL PRIMARY KEY,
    idProfessor INT REFERENCES PROFESSOR(idProfessor),
    cargo VARCHAR(255)
);

-- Tabela DIA-AULA
CREATE TABLE DIA_AULA (
    idDiaAula SERIAL PRIMARY KEY,
    idProfessor INT REFERENCES PROFESSOR(idProfessor),
    diaSemana VARCHAR(20)
);

-- Tabela TRABALHO-ALUNO
CREATE TABLE TRABALHO_ALUNO (
    id_Trab_Aluno SERIAL PRIMARY KEY,
    idAluno INT REFERENCES ALUNO(idAluno),
    idTrabalho INT REFERENCES TRABALHO(idTrabalho)
);

-- Tabela HORARIO-AULA
CREATE TABLE HORARIO_AULA (
    idHorarioAula SERIAL PRIMARY KEY,
    idProfessor INT REFERENCES PROFESSOR(idProfessor),
    idDiaAula INT REFERENCES DIA_AULA(idDiaAula),
    entrada TIME,
    saida TIME
);

-- Tabela TRABALHO-PROFESSOR
CREATE TABLE TRABALHO_PROFESSOR (
    id_Trab_Prof SERIAL PRIMARY KEY,
    id_Cargo_Prof INT REFERENCES CARGO_PROFESSOR(id_Cargo_Prof),
    idTrabalho INT REFERENCES TRABALHO(idTrabalho)
);

-- Tabela AVALIACAO
CREATE TABLE AVALIACAO (
    idAvaliacao SERIAL PRIMARY KEY,
    idTrabalho INT REFERENCES TRABALHO(idTrabalho),
    id_Cargo_Prof INT REFERENCES CARGO_PROFESSOR(id_Cargo_Prof),
    valor NUMERIC(3, 1) CHECK (valor >= 0 AND valor <= 10),
    comentario TEXT
);

-- Tabela BANCA-PROFESSOR
CREATE TABLE BANCA_PROFESSOR (
    id_Banca_Prof SERIAL PRIMARY KEY,
    id_Cargo_Prof INT REFERENCES CARGO_PROFESSOR(id_Cargo_Prof),
    idBanca INT REFERENCES BANCA(idBanca)
);

-- Tabela CERTIFICADO
CREATE TABLE CERTIFICADO (
    idCertificado SERIAL PRIMARY KEY,
    id_Cargo_Prof INT REFERENCES CARGO_PROFESSOR(id_Cargo_Prof),
    idBanca INT REFERENCES BANCA(idBanca),
    dataHoraEmissao TIMESTAMP,
    comentario TEXT
);