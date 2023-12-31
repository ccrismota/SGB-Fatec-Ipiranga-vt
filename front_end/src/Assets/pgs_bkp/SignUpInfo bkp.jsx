import React, { useState } from 'react';
import { Form, InputGroup, Button, Row, Col, Card, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
// import HorarioSelecaoProfs from '../components/HorarioSelecaoProfs'


const SignUpInfo = () => {

  const { user } = useAuth0();
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [userId, setUserId] = useState('6439d5i62sqf28u4818eab0d');
  const [email, setEmail] = useState('');
  const [ra, setRA] = useState('');
  const [nome, setNome] = useState('');
  const [curso, setCurso] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showConfirmationModalProf, setShowConfirmationModalProf] = useState(false);

  const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const periodos = ['Manhã', 'Tarde', 'Noite'];
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const [horarios, setHorarios] = useState({});
  const [horariosTrabalho, setHorariosTrabalho] = useState([]);


  const cadastrarProfessor = async (dadosProfessor) => {
    try {
      const response = await axios.post('http://localhost:4001/professores', dadosProfessor);
      console.log(`Aqui a porra do idProfessor: ${response.data.id_professor}`)
      return response.data.id_professor;
    } catch (error) {
      throw new Error(`Erro ao cadastrar professor: ${error}`);
    }
  };

  const cadastrarDiaAula = async (idProfessor, diaSemana) => {
    try {
      const response = await axios.post('http://localhost:4002/dia_aula', {
        idProfessor,
        diaSemana,
      });
      return response.data.id_dia_aula;
    } catch (error) {
      throw new Error(`Erro ao cadastrar dia de aula: ${error}`);
    }
  };

  const cadastrarHorarioAula = async (idProfessor, idDiaAula, entrada, saida) => {
    try {
      await axios.post('http://localhost:4003/horario_aula', {
        idProfessor,
        idDiaAula,
        entrada,
        saida,
      });
    } catch (error) {
      throw new Error(`Erro ao cadastrar horário de aula: ${error}`);
    }
  };


  const HorarioSelecaoProfs = () => {


    const handleDiaChange = (dia, isChecked) => {
      setDiasSelecionados(prevState => {
        const updatedDias = isChecked
          ? [...prevState, dia]
          : prevState.filter(d => d !== dia);

        // Remove os horários do dia desmarcado
        setHorarios(prevHorarios => {
          const updatedHorarios = { ...prevHorarios };
          if (!isChecked) {
            delete updatedHorarios[dia];
          }
          return updatedHorarios;
        });

        return updatedDias;
      });
    };

    const handlePeriodoChange = (dia, periodo, isChecked) => {
      setHorarios(prevHorarios => {
        const updatedHorarios = { ...prevHorarios };
        if (isChecked) {
          if (!updatedHorarios[dia]) {
            updatedHorarios[dia] = {};
          }
          updatedHorarios[dia][periodo] = { entrada: '', saida: '' };
        } else {
          delete updatedHorarios[dia][periodo];
          if (Object.keys(updatedHorarios[dia]).length === 0) {
            delete updatedHorarios[dia];
          }
        }
        return updatedHorarios;
      });
    };

    const handleHorarioChange = (dia, periodo, tipo, value) => {
      setHorarios(prevHorarios => {
        const updatedHorarios = { ...prevHorarios };
        if (!updatedHorarios[dia]) {
          updatedHorarios[dia] = {};
        }
        if (!updatedHorarios[dia][periodo]) {
          updatedHorarios[dia][periodo] = { entrada: '', saida: '' };
        }
        updatedHorarios[dia][periodo][tipo] = value;
        return updatedHorarios;
      });
    };

    return (
      <Form style={{ display: 'flex', flexDirection: 'column' }}>
        <h3>Horários de trabalho:</h3>
        <p>Selecione abaixo os dias e horários que você trabalha na FATEC Ipiranga.</p>
        <div className='SignUpInfo_Cards_grid'>
          {diasSemana.map(dia => (
            <Card key={dia} style={{ marginBottom: '10px', padding: '10px', width: 300 }}>
              <div>
                <Form.Check
                  type="checkbox"
                  label={dia}
                  checked={diasSelecionados.includes(dia)}
                  onChange={e => handleDiaChange(dia, e.target.checked)}
                />
                {diasSelecionados.includes(dia) && (
                  <div>
                    {periodos.map(periodo => (
                      <div key={`${dia}-${periodo}`} style={{ marginLeft: '20px' }}>
                        <Form.Check
                          type="checkbox"
                          label={periodo}
                          checked={!!(horarios[dia]?.[periodo])}
                          onChange={e => handlePeriodoChange(dia, periodo, e.target.checked)}
                        />
                        {horarios[dia]?.[periodo] && (
                          <Row>
                            <Col>
                              <Form.Group controlId={`${dia}-${periodo}-entrada`}>
                                <Form.Label>Entrada:</Form.Label>
                                <Form.Control
                                  type="time"
                                  style={{ width: 'fit-content' }}
                                  onChange={e =>
                                    handleHorarioChange(dia, periodo, 'entrada', e.target.value)
                                  }
                                  value={horarios[dia]?.[periodo]?.entrada || ''} />
                              </Form.Group>
                            </Col>
                            <Col>
                              <Form.Group controlId={`${dia}-${periodo}-saida`}>
                                <Form.Label>Saída:</Form.Label>
                                <Form.Control
                                  type="time"
                                  style={{ width: 'fit-content' }}
                                  onChange={e =>
                                    handleHorarioChange(dia, periodo, 'saida', e.target.value)
                                  }
                                  value={horarios[dia]?.[periodo]?.saida || ''} />
                              </Form.Group>
                            </Col>
                          </Row>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Form>
    );
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmationModal(true);
  }

  const handleSubmitProfessor = async (e) => {
    e.preventDefault();
    setShowConfirmationModalProf(true);
  }

  const handleConfirmProfessor = async () => {
    setShowConfirmationModalProf(false);

    try {
      const idProfessor = await cadastrarProfessor({
        userId,
        nome,
        email,
      });

      const diasAulaIds = await Promise.all(diasSelecionados.map(async (dia) => {
        return await cadastrarDiaAula(idProfessor, dia);
      }));

      console.log('diasAulaIds:', diasAulaIds);

      await Promise.all(diasAulaIds.map(async (diaAulaId) => {
        const horario = horarios[diaAulaId];
        await cadastrarHorarioAula(idProfessor, diaAulaId, horario.entrada, horario.saida);
      }));

      toast.success('Professor cadastrado com sucesso!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      console.log('Professor cadastrado com sucesso');

      navigate("/sgb");

    } catch (error) {
      toast.error('Erro ao cadastrar professor. Tente novamente mais tarde.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      console.error('Erro ao cadastrar professor:', error);
    }
  };

  const handleConfirm = async () => {

    setShowConfirmationModal(false);

    // Enviando os dados para a API
    try {
      const response = await axios.post('http://localhost:4000/alunos', {
        userId,
        ra,
        nome,
        email,
        curso,
        periodo
      })

      // Se o cadastro for bem-sucedido, exibe o toast
      toast.success('Aluno cadastrado com sucesso!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      console.log('Dados enviados com sucesso:', response.data)

      navigate("/sgb");

    } catch (error) {

      // Exibe o toast de erro
      toast.error('Erro ao cadastrar aluno. Tente novamente mais tarde.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      console.error('Erro ao enviar os dados:', error);
    }
  };

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
  }



  return (
    <div style={{ display: 'block', padding: 30 }}>
      <h1>Conclua seu cadastro</h1>
      <p>Para concluir seu acesso à plataforma, por favor, insira seu email institucional. Mas antes...</p>
      <h2>Você é:</h2>

      <Form.Check
        type="radio"
        label="Aluno"
        name="profile"
        id="aluno"
        checked={selectedProfile === 'aluno'}
        onChange={() => handleSelectProfile('aluno')}
      />

      <Form.Check
        type="radio"
        label="Professor"
        name="profile"
        id="professor"
        checked={selectedProfile === 'professor'}
        onChange={() => handleSelectProfile('professor')}
      />

      {selectedProfile === 'aluno' && (
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label htmlFor="email"><b>E-mail Institucional:</b></Form.Label>
            <InputGroup style={{ width: 400 }} className="mb-3">
              <Form.Control
                id="email"
                type="text"
                placeholder="seu email"
                aria-label="seu email"
                aria-describedby="basic-addon2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputGroup.Text id="basic-addon2">@fatec.sp.gov.br</InputGroup.Text>
            </InputGroup>
            <InputGroup className="mb-3">
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">RA:</InputGroup.Text>
                <Form.Control
                  id="ra"
                  type="text"
                  placeholder=""
                  aria-label=""
                  aria-describedby="basic-addon1"
                  value={ra}
                  onChange={(e) => setRA(e.target.value)}
                />
              </InputGroup>
              <InputGroup.Text id="basic-addon1">Nome completo:</InputGroup.Text>
              <Form.Control
                id="nomeCompleto"
                type="text"
                placeholder=""
                aria-label=""
                aria-describedby="basic-addon1"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </InputGroup>
            <InputGroup.Text style={{ gap: 10, marginBottom: '1rem', padding: '10px' }} id="basic-addon1">
              Curso:<Form.Select id="curso" aria-label="Selecione o curso" value={curso} onChange={(e) => setCurso(e.target.value)}>
                <option value="">Selecione uma opção</option> {/* Adicionada a opção default */}
                <option value="ads">Análise e Desenvolvimento de Sistemas</option>
                <option value="bigdata">Big Data</option>
                <option value="rh">Recursos Humanos</option>
                <option value="eventos">Eventos</option>
              </Form.Select>
            </InputGroup.Text>

            <InputGroup.Text style={{ gap: 10, marginBottom: 10, padding: 10 }} id="basic-addon1">
              Período:<Form.Select id="periodo" aria-label="Selecione o curso" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option value="">Selecione uma opção</option> {/* Adicionada a opção default */}
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </Form.Select>
            </InputGroup.Text>
          </Form.Group>

          <Button style={{ marginTop: '5px' }} variant="primary" type="submit">
            Enviar
          </Button>
        </Form>
      )}

      {selectedProfile === 'professor' && (
        <Form onSubmit={handleSubmitProfessor}>
          <Form.Group>
            <Form.Label htmlFor="basic-url"><b>E-mail Institucional:</b></Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="digite"
                aria-label="digite"
                aria-describedby="basic-addon2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputGroup.Text id="basic-addon2">@fatec.sp.gov.br</InputGroup.Text>
            </InputGroup>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">Nome completo:</InputGroup.Text>
              <Form.Control
                placeholder=""
                aria-label=""
                aria-describedby="basic-addon1"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </InputGroup>
            <HorarioSelecaoProfs /> {/* Mantém a seleção de horários */}
            <Button
              style={{ marginTop: '5px' }}
              variant="primary"
              onClick={() => setShowConfirmationModalProf(true)}
            >
              Enviar
            </Button>
          </Form.Group>
        </Form>
      )}

      {/* MODAL DE CONFIRMAÇÃO ----------------- */}
      <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação de Cadastro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Um email de validação será enviado para o endereço de email que você forneceu, a fim de confirmar sua identidade e validar seu cadastro.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
      {/* MODAL DE CONFIRMAÇÃO ----------------- */}

      {/* MODAL DE CONFIRMAÇÃO ----------------- */}
      <Modal show={showConfirmationModalProf} onHide={() => setShowConfirmationModalProf(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação de Cadastro Professor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Um email de validação será enviado para o endereço de email que você forneceu, a fim de confirmar sua identidade e validar seu cadastro.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmationModalProf(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmProfessor}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
      {/* MODAL DE CONFIRMAÇÃO ----------------- */}

      {/* <ToastContainer /> */}

    </div>
  )
}

export default SignUpInfo;
