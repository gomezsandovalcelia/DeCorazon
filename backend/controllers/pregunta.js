    const { response } = require("express");
    const Pregunta  = require("../models/pregunta");
    const Respuesta  = require("../models/respuesta");

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

    const saveResponse = async (req, res = response) => {
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
    };


    module.exports = { getQuestionOfTheDay, saveResponse };
