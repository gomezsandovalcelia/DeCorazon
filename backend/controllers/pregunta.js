    const { response } = require("express");
    const Pregunta  = require("../models/pregunta");
    const Paciente = require("../models/paciente");
    const Respuesta  = require("../models/respuesta");
    const mongoose = require('mongoose');

    const getQuestionOfTheDay = async (req, res = response) => {
        const { patientId } = req.params;
        const today = new Date().toISOString().split("T")[0];

        try {
            // Verifica si el paciente ya respondió hoy
            const existingResponse = await Respuesta.findOne({ patientId, date: today });

            if (existingResponse) {
                return res.status(200).json({
                    ok: false,
                    msg: "Ya respondiste la pregunta de hoy.",
                    question: null
                });
            }

            // Obtiene todas las preguntas y selecciona una al azar
            const questions = await Pregunta.find();
            if (!questions.length) {
                return res.status(404).json({
                    ok: false,
                    msg: "No hay preguntas disponibles.",
                    question: null
                });
            }
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
            return res.json({
                ok: true,
                msg: "Pregunta obtenida",
                question: {
                    _id: randomQuestion._id, // Asegurar que el _id se incluya
                    question: randomQuestion.question,
                    options: randomQuestion.options
                }
            });
            
            

        } catch (error) {
            console.error("Error obteniendo la pregunta:", error);
            return res.status(500).json({
                ok: false,
                msg: "Error interno del servidor",
                question: null
            });
        }
    };

    /*const saveResponse = async (req, res = response) => {
        //console.log("📥 Datos recibidos en el backend:", req.body); // Ver qué está llegando

        const { patientId, questionId, answer } = req.body;
        const today = new Date().toISOString().split("T")[0];

        try {
            if (!patientId || !questionId) {
                return res.status(400).json({
                    ok: false,
                    msg: "patientId y questionId son requeridos"
                });
            }

            // Verifica si el paciente ya respondió hoy
            const existingResponse = await Respuesta.findOne({ patientId, date: today });
            
            if (existingResponse) {
                return res.status(400).json({
                    ok: false,
                    msg: "Ya respondiste la pregunta de hoy."
                });
            }

            // Guarda la respuesta en la base de datos
            const newResponse = new Respuesta({ patientId, questionId, answer, date: today });
            await newResponse.save();

            return res.json({
                ok: true,
                msg: "Respuesta guardada con éxito."
            });

        } catch (error) {
            console.error("❌ Error guardando la respuesta:", error);
            return res.status(500).json({
                ok: false,
                msg: "Error interno del servidor"
            });
        }
    };*/


// Obtener la primera pregunta del cuestionario
const getFirstQuestion = async (req, res = response) => {
    const { patientId } = req.params;
    const today = new Date().toISOString().split("T")[0];

    try {
        // Verificar si el paciente ya completó el cuestionario hoy
        const completedToday = await checkQuestionnaireCompletedToday(patientId, today);
        
        if (completedToday) {
            return res.status(200).json({
                ok: false,
                msg: "Ya completaste el cuestionario de hoy.",
                question: null
            });
        }

        // Obtener la pregunta inicial
        const initialQuestion = await Pregunta.findOne({ questionType: 'initial' });
        
        if (!initialQuestion) {
            return res.status(404).json({
                ok: false,
                msg: "No hay preguntas disponibles.",
                question: null
            });
        }

        return res.json({
            ok: true,
            msg: "Pregunta obtenida",
            question: {
                _id: initialQuestion._id,
                question: initialQuestion.question,
                options: initialQuestion.options
            }
        });
    } catch (error) {
        console.error("Error obteniendo la primera pregunta:", error);
        return res.status(500).json({
            ok: false,
            msg: "Error interno del servidor",
            question: null
        });
    }
};
const getNextQuestion = async (req, res = response) => {
    const { patientId, questionId, answer } = req.params;
    
    try {
        // Buscar la pregunta actual
        const currentQuestion = await Pregunta.findById(questionId);
        
        if (!currentQuestion) {
            return res.status(404).json({
                ok: false,
                msg: "Pregunta no encontrada",
                question: null
            });
        }

        // Verificar si hay una siguiente pregunta para esta respuesta
        if (!currentQuestion.nextQuestions || 
            !currentQuestion.nextQuestions.has(answer)) {
            // No hay más preguntas para esta respuesta
            return res.json({
                ok: true,
                msg: "Fin del cuestionario",
                question: null,
                isLastQuestion: true
            });
        }

        // Obtener el ID de la siguiente pregunta
        const nextQuestionData = currentQuestion.nextQuestions.get(answer);
        const nextQuestionId = nextQuestionData.questionId;
        
        console.log(`Buscando siguiente pregunta con shortId: ${nextQuestionId}`);
        
        // Buscar por shortId en lugar de _id
        const nextQuestion = await Pregunta.findOne({ shortId: nextQuestionId });
        
        if (!nextQuestion) {
            console.log(`No se encontró pregunta con shortId: ${nextQuestionId}`);
            return res.status(404).json({
                ok: false,
                msg: "Pregunta siguiente no encontrada",
                question: null
            });
        }

        // Determinar si es la última pregunta
        const isLastQuestion = !nextQuestion.nextQuestions || 
                              Object.keys(nextQuestion.nextQuestions).length === 0;

        return res.json({
            ok: true,
            msg: "Siguiente pregunta obtenida",
            question: {
                _id: nextQuestion._id,
                question: nextQuestion.question,
                options: nextQuestion.options
            },
            isLastQuestion
        });
    } catch (error) {
        console.error("Error obteniendo la siguiente pregunta:", error);
        return res.status(500).json({
            ok: false,
            msg: "Error interno del servidor",
            question: null
        });
    }
};

// En pregunta.js (controller)
const saveResponse = async (req, res = response) => {
    const { patientId, questionId, answer } = req.body;
    const today = new Date().toISOString().split("T")[0];

    try {
        if (!patientId || !questionId) {
            return res.status(400).json({
                ok: false,
                msg: "patientId y questionId son requeridos"
            });
        }

        // Verificar si la respuesta requiere alerta
        const question = await Pregunta.findById(questionId);
        
        if (!question) {
            return res.status(404).json({
                ok: false,
                msg: "Pregunta no encontrada"
            });
        }

        const requiresAlert = question.alertConditions && 
                             question.alertConditions.includes(answer);

        // Guardar la respuesta en la base de datos con el campo de alerta
        const newResponse = new Respuesta({ 
            patientId, 
            questionId, 
            answer, 
            date: today,
            alerta: requiresAlert // Establecer el campo alerta
        });
        await newResponse.save();

        return res.json({
            ok: true,
            msg: "Respuesta guardada con éxito.",
            requiresAlert
        });
    } catch (error) {
        console.error("Error guardando la respuesta:", error);
        return res.status(500).json({
            ok: false,
            msg: "Error interno del servidor"
        });
    }
};

// Enviar alerta al sanitario
const sendAlert = async (req, res = response) => {
    const { patientId, reason } = req.body;
    
    try {
        // Aquí implementarías la lógica para notificar al sanitario
        // Por ejemplo, guardar la alerta en la base de datos y/o enviar una notificación
        
        // Ejemplo: Crear una alerta en la base de datos
        const paciente = await Paciente.findById(patientId);
        if (!paciente) {
            return res.status(404).json({
                ok: false,
                msg: "Paciente no encontrado"
            });
        }

        // Agregar la alerta a un nuevo campo en el modelo de paciente (requiere actualizar el modelo)
        if (!paciente.alerts) {
            paciente.alerts = [];
        }

        paciente.alerts.push({
            date: new Date(),
            reason,
            status: 'pending'
        });

        await paciente.save();

        // Aquí se podría implementar el envío de notificaciones por email, SMS, etc.

        return res.json({
            ok: true,
            msg: "Alerta enviada con éxito al personal sanitario"
        });
    } catch (error) {
        console.error("Error enviando alerta:", error);
        return res.status(500).json({
            ok: false,
            msg: "Error interno al enviar la alerta"
        });
    }
};

// Marcar el cuestionario como completado
const finishQuestionnaire = async (req, res = response) => {
    const { patientId } = req.body;
    const today = new Date().toISOString().split("T")[0];
    
    try {
        // Aquí podrías agregar cualquier lógica adicional al finalizar el cuestionario
        // Por ejemplo, actualizar un estado en el paciente

        return res.json({
            ok: true,
            msg: "Cuestionario completado con éxito"
        });
    } catch (error) {
        console.error("Error finalizando cuestionario:", error);
        return res.status(500).json({
            ok: false,
            msg: "Error interno al finalizar el cuestionario"
        });
    }
};

// Función auxiliar para verificar si el cuestionario fue completado hoy
const checkQuestionnaireCompletedToday = async (patientId, today) => {
    // Obtener todas las preguntas
    const questions = await Pregunta.find();
    
    // Para cada pregunta, verificar si hay una respuesta de hoy
    const responses = await Respuesta.find({ 
        patientId, 
        date: today 
    });

    // Si hay al menos una respuesta, consideramos que inició el cuestionario
    return responses.length > 0;
};
    module.exports = { getQuestionOfTheDay, saveResponse, getFirstQuestion, 
        getNextQuestion, 
        sendAlert, 
        finishQuestionnaire  };
