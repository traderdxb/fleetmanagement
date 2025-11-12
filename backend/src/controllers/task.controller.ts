import { Request, Response } from 'express';
import { PrismaClient, TaskStatus, JobType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { status, type, assignedTo } = req.query;
    
    const tasks = await prisma.task.findMany({
      where: {
        ...(status && { status: status as TaskStatus }),
        ...(type && { type: type as JobType }),
        ...(assignedTo && { assignedTo: assignedTo as string }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, description, assignedTo, dueDate } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!type || !title) {
      return res.status(400).json({ error: 'Type and title are required' });
    }

    const task = await prisma.task.create({
      data: {
        type,
        title,
        description,
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdBy: req.user.userId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, title, description, assignedTo, dueDate, completedAt } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
