import prisma from "../config/database.js";
import { NotFoundError } from "../errors/AppError.js";

const publicQuestionSelect = {
  id: true,
  enunciado: true,
  dificuldade: true,
  respostaCorreta: true,
  ativa: true,
  createdAt: true,
  updatedAt: true,
  subjectId: true,
  authorId: true,
  subject: {
    select: { id: true, nome: true, ativa: true },
  },
  author: {
    select: { id: true, nome: true, email: true, papel: true, foto: true },
  },
};

export async function getAllQuestions() {
  return prisma.question.findMany({
    select: publicQuestionSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuestionById(questionId) {
  const id = Number(questionId);
  if (!id || isNaN(id) || id <= 0) {
    throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
  }

  const question = await prisma.question.findUnique({
    where: { id },
    select: publicQuestionSelect,
  });

  if (!question) {
    throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
  }

  return question;
}

export async function createQuestion(data) {
  const subjectId = Number(data?.subjectId);
  const authorId = Number(data?.authorId);

  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new NotFoundError(`Matéria com ID ${data?.subjectId} não encontrada`);
  }

  if (!authorId || isNaN(authorId) || authorId <= 0) {
    throw new NotFoundError(`Autor com ID ${data?.authorId} não encontrado`);
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true },
  });

  if (!subject) {
    throw new NotFoundError(`Matéria com ID ${subjectId} não encontrada`);
  }

  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { id: true },
  });

  if (!author) {
    throw new NotFoundError(`Autor com ID ${authorId} não encontrado`);
  }

  return prisma.question.create({
    data: {
      enunciado: data.enunciado,
      dificuldade: Number(data.dificuldade),
      respostaCorreta: data.respostaCorreta ?? null,
      ativa: data.ativa ?? true,
      subjectId,
      authorId,
    },
    select: publicQuestionSelect,
  });
}

export async function updateQuestion(questionId, data) {
  const id = Number(questionId);
  if (!id || isNaN(id) || id <= 0) {
    throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
  }

  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
  }

  if (data?.subjectId !== undefined) {
    const subjectId = Number(data.subjectId);
    if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
      throw new NotFoundError(`Matéria com ID ${data.subjectId} não encontrada`);
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundError(`Matéria com ID ${data.subjectId} não encontrada`);
    }
  }

  if (data?.authorId !== undefined) {
    const authorId = Number(data.authorId);
    if (!authorId || isNaN(authorId) || authorId <= 0) {
      throw new NotFoundError(`Autor com ID ${data.authorId} não encontrado`);
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    if (!author) {
      throw new NotFoundError(`Autor com ID ${data.authorId} não encontrado`);
    }
  }

  return prisma.question.update({
    where: { id },
    data: {
      ...(data.enunciado !== undefined && { enunciado: data.enunciado }),
      ...(data.dificuldade !== undefined && { dificuldade: Number(data.dificuldade) }),
      ...(data.respostaCorreta !== undefined && { respostaCorreta: data.respostaCorreta }),
      ...(data.ativa !== undefined && { ativa: data.ativa }),
      ...(data.subjectId !== undefined && { subjectId: Number(data.subjectId) }),
      ...(data.authorId !== undefined && { authorId: Number(data.authorId) }),
    },
    select: publicQuestionSelect,
  });
}

export async function deleteQuestion(questionId) {
  const id = Number(questionId);
  if (!id || isNaN(id) || id <= 0) {
    throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
  }

  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
  }

  return prisma.question.delete({
    where: { id },
  });
}