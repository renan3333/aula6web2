import * as questionService from "../services/questionService.js";

export async function getAllQuestions(req, res, next) {
  try {
    const questions = await questionService.getAllQuestions();
    return res.json({
      success: true,
      data: questions,
      total: questions.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getQuestionById(req, res, next) {
  try {
    const { id } = req.params;
    const question = await questionService.getQuestionById(Number(id));
    return res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
}

export async function createQuestion(req, res, next) {
  try {
    const question = await questionService.createQuestion(req.body);
    return res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const question = await questionService.updateQuestion(Number(id), req.body);
    return res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const question = await questionService.deleteQuestion(Number(id));
    return res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
}