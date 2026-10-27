// controllers/preguntaController.js
const Pregunta = require('../models/pregunta');
const Respuesta = require('../models/respuesta');
const Paciente = require('../models/paciente');
const { response } = require('express');

// Obtener la primera pregunta del árbol
const getFirstQuestion = async (req, res = response) => {
  try {
    const pacienteId = req.params.pacienteId;
    
    // Verificar si el paciente existe
    const pacienteExists = await Paciente.findById(pacienteId);
    if (!pacienteExists) {
      return res.status(404).json({
        ok: false,
        msg: 'Paciente no encontrado'
      });
    }

    // Si ya completó el cuestionario hoy no se le vuelve a preguntar
    const ultimo = pacienteExists.lastQuestionnaire;
    if (ultimo && ultimo.toDateString() === new Date().toDateString()) {
      return res.json({
        ok: true,
        completadoHoy: true,
        question: null
      });
    }

    // Encontrar la primera pregunta (la que tiene questionType: 'initial')
    const firstQuestion = await Pregunta.findOne({ questionType: 'initial' });
    
    if (!firstQuestion) {
      return res.status(404).json({
        ok: false,
        msg: 'No se encontró la primera pregunta'
      });
    }

    return res.json({
      ok: true,
      completadoHoy: false,
      question: firstQuestion
    });
  } catch (error) {
    console.error('Error al obtener la primera pregunta:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener la primera pregunta'
    });
  }
};

// Obtener la siguiente pregunta basada en la respuesta actual
const getNextQuestion = async (req, res = response) => {
  try {
    const { pacienteId, currentQuestionId, answer } = req.params;
    
    // Verificar si el paciente existe
    const pacienteExists = await Paciente.findById(pacienteId);
    if (!pacienteExists) {
      return res.status(404).json({
        ok: false,
        msg: 'Paciente no encontrado'
      });
    }

    // Encontrar la pregunta actual
    const currentQuestion = await Pregunta.findById(currentQuestionId);
    if (!currentQuestion) {
      return res.status(404).json({
        ok: false,
        msg: 'Pregunta no encontrada'
      });
    }

    
    // Verificar si nextQuestions es un Map o un objeto
    const nextQuestionsMap = currentQuestion.nextQuestions || new Map();
    
    // Obtener la configuración para la respuesta dada
    let nextConfig;
    
    // Verificar si estamos usando un Map o un objeto plano
    if (nextQuestionsMap instanceof Map) {
      nextConfig = nextQuestionsMap.get(answer);
    } else {
      // Si es un objeto plano
      nextConfig = nextQuestionsMap[answer];
    }
    
    
    if (!nextConfig || !nextConfig.questionId) {
      const isEndPoint = nextConfig && nextConfig.endQuestionnaire;
      
      return res.json({
        ok: true,
        question: null,
        isLastQuestion: true,
        msg: isEndPoint ? 'Fin del cuestionario' : 'No hay más preguntas'
      });
    }
    
    // Obtener el ID de la siguiente pregunta
    const nextQuestionId = nextConfig.questionId;
    
    // Buscar la siguiente pregunta por su shortId
    const nextQuestion = await Pregunta.findOne({ shortId: nextQuestionId });
    
    if (!nextQuestion) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontró la pregunta con shortId ${nextQuestionId}`
      });
    }
    

    // Verificar si es la última pregunta
    const nextQuestionsForNext = nextQuestion.nextQuestions || new Map();
    let hasNextQuestions = false;
    
    // Verificar si hay alguna opción que lleve a otra pregunta
    if (nextQuestionsForNext instanceof Map) {
      for (const [_, config] of nextQuestionsForNext.entries()) {
        if (config.questionId && !config.endQuestionnaire) {
          hasNextQuestions = true;
          break;
        }
      }
    } else {
      // Si es un objeto plano
      hasNextQuestions = Object.values(nextQuestionsForNext).some(
        config => config.questionId && !config.endQuestionnaire
      );
    }
    
    const isLastQuestion = !hasNextQuestions;

    return res.json({
      ok: true,
      question: nextQuestion,
      isLastQuestion
    });
  } catch (error) {
    console.error('Error en getNextQuestion:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener la siguiente pregunta',
    });
  }
};

// Guardar la respuesta del paciente
const saveResponse = async (req, res = response) => {
  try {
    const { pacienteId, questionId, answer } = req.body;
    
    // Verificar si el paciente existe
    const pacienteExists = await Paciente.findById(pacienteId);
    if (!pacienteExists) {
      return res.status(404).json({
        ok: false,
        msg: 'Paciente no encontrado'
      });
    }

    // Verificar si la pregunta existe
    const question = await Pregunta.findById(questionId);
    if (!question) {
      return res.status(404).json({
        ok: false,
        msg: 'Pregunta no encontrada'
      });
    }

    // Crear la respuesta
    const newResponse = new Respuesta({
      pacienteId: pacienteId,
      questionId,
      answer,
      date: new Date(),
      triggeredAlert: false
    });

    await newResponse.save();

    // Verificar si la respuesta requiere alerta
    let requiresAlert = false;
    let alertReason = '';

    // Verificar en alertConditions (array de respuestas que generan alerta)
    if (question.alertConditions && question.alertConditions.includes(answer)) {
      requiresAlert = true;
      alertReason = `Respuesta de alerta: ${question.question} - ${answer}`;
      newResponse.triggeredAlert = true;
      await newResponse.save();
    }

    // Verificar en nextQuestions si tiene configuración de alerta
    const nextQuestionsMap = question.nextQuestions || new Map();
    let nextConfig;
    
    if (nextQuestionsMap instanceof Map) {
      nextConfig = nextQuestionsMap.get(answer);
    } else {
      nextConfig = nextQuestionsMap[answer];
    }
    
    if (nextConfig && nextConfig.triggerAlert) {
      requiresAlert = true;
      alertReason = `Respuesta de alerta: ${question.question} - ${answer}`;
      newResponse.triggeredAlert = true;
      await newResponse.save();
    }

    return res.json({
      ok: true,
      response: newResponse,
      requiresAlert,
      alertReason
    });
  } catch (error) {
    console.error('Error al guardar la respuesta:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al guardar la respuesta',
    });
  }
};

// Enviar alerta al personal sanitario
const sendAlert = async (req, res = response) => {
  try {
    const { patientId, reason } = req.body;

    // Verificar si el paciente existe
    const paciente = await Paciente.findById(patientId);
    if (!paciente) {
      return res.status(404).json({
        ok: false,
        msg: 'Paciente no encontrado'
      });
    }

    // Aquí implementarías la lógica para enviar la alerta al sanitario
    // Por ejemplo, enviando un email, SMS, o guardando en una colección de alertas
    console.warn(`ALERTA: Paciente ${paciente.nombre} ${paciente.apellidos} (${paciente._id}) - ${reason}`);

    // Actualizar el estado del paciente
    paciente.lastAlert = {
      date: new Date(),
      reason
    };
    await paciente.save();

    return res.json({
      ok: true,
      msg: 'Alerta enviada correctamente'
    });
  } catch (error) {
    console.error('Error al enviar la alerta:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al enviar la alerta',
    });
  }
};

// Finalizar el cuestionario
const finishQuestionnaire = async (req, res = response) => {
  try {
    const { patientId } = req.body;

    // Verificar si el paciente existe
    const paciente = await Paciente.findById(patientId);
    if (!paciente) {
      return res.status(404).json({
        ok: false,
        msg: 'Paciente no encontrado'
      });
    }

    // Actualizar la fecha del último cuestionario completado
    paciente.lastQuestionnaire = new Date();
    await paciente.save();

    return res.json({
      ok: true,
      msg: 'Cuestionario finalizado correctamente'
    });
  } catch (error) {
    console.error('Error al finalizar el cuestionario:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al finalizar el cuestionario',
    });
  }
};

// Endpoint para debugging del árbol de preguntas
const debugQuestions = async (req, res = response) => {
  try {
    // Obtener todas las preguntas
    const preguntas = await Pregunta.find();
    
    // Crear estructura para visualizar
    const questionsData = preguntas.map(pregunta => {
      const nextQuestionsData = {};
      
      // Convertir nextQuestions a un formato visualizable
      if (pregunta.nextQuestions) {
        if (pregunta.nextQuestions instanceof Map) {
          // Si es un Map
          for (const [key, value] of pregunta.nextQuestions.entries()) {
            nextQuestionsData[key] = value;
          }
        } else {
          // Si es un objeto
          Object.assign(nextQuestionsData, pregunta.nextQuestions);
        }
      }
      
      return {
        id: pregunta._id,
        shortId: pregunta.shortId,
        question: pregunta.question,
        options: pregunta.options,
        questionType: pregunta.questionType,
        nextQuestions: nextQuestionsData,
        alertConditions: pregunta.alertConditions
      };
    });
    
    // Encontrar relaciones entre preguntas para visualizar el árbol
    const relationships = [];
    
    preguntas.forEach(pregunta => {
      if (!pregunta.nextQuestions) return;
      
      // Procesar las conexiones
      if (pregunta.nextQuestions instanceof Map) {
        // Si es un Map
        for (const [respuesta, config] of pregunta.nextQuestions.entries()) {
          if (config.questionId) {
            relationships.push({
              from: pregunta.shortId,
              condition: respuesta,
              to: config.questionId,
              endQuestionnaire: config.endQuestionnaire || false,
              triggerAlert: config.triggerAlert || false
            });
          } else if (config.endQuestionnaire) {
            relationships.push({
              from: pregunta.shortId,
              condition: respuesta,
              to: 'FIN',
              triggerAlert: config.triggerAlert || false
            });
          }
        }
      } else {
        // Si es un objeto
        for (const [respuesta, config] of Object.entries(pregunta.nextQuestions)) {
          if (config.questionId) {
            relationships.push({
              from: pregunta.shortId,
              condition: respuesta,
              to: config.questionId,
              endQuestionnaire: config.endQuestionnaire || false,
              triggerAlert: config.triggerAlert || false
            });
          } else if (config.endQuestionnaire) {
            relationships.push({
              from: pregunta.shortId,
              condition: respuesta,
              to: 'FIN',
              triggerAlert: config.triggerAlert || false
            });
          }
        }
      }
    });
    
    return res.json({
      ok: true,
      questions: questionsData,
      relationships: relationships
    });
  } catch (error) {
    console.error('Error en debug-questions:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener la información de debug',
    });
  }
};
const getAllQuestions = async (req, res) => {
  try {
      const preguntas = await Pregunta.find();
      
      res.json({
          ok: true,
          preguntas
      });
  } catch (error) {
      console.error('Error al obtener preguntas:', error);
      res.status(500).json({
          ok: false,
          msg: 'Error al obtener las preguntas. Por favor, contacte al administrador.'
      });
  }
};

const getQuestionById = async (req, res) => {
  const questionId = req.params.id;
  
  try {
      const pregunta = await Pregunta.findById(questionId);
      
      if (!pregunta) {
          return res.status(404).json({
              ok: false,
              msg: 'Pregunta no encontrada'
          });
      }
      
      res.json({
          ok: true,
          pregunta
      });
  } catch (error) {
      console.error('Error al obtener pregunta:', error);
      res.status(500).json({
          ok: false,
          msg: 'Error al obtener la pregunta. Por favor, contacte al administrador.'
      });
  }
};

module.exports = {
  getFirstQuestion,
  getNextQuestion,
  saveResponse,
  sendAlert,
  finishQuestionnaire,
  debugQuestions,
  getAllQuestions,
  getQuestionById
};