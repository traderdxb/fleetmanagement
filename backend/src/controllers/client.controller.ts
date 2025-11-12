import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getClients = async (req: Request, res: Response) => {
  try {
    const { search, isActive } = req.query;

    const clients = await prisma.client.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      include: {
        _count: {
          select: {
            devices: true,
            assignments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        devices: true,
        assignments: {
          include: {
            device: true,
            vehicle: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        renewals: {
          orderBy: { subscriptionExpiry: 'asc' },
          take: 10,
        },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'CREATE',
          entity: 'CLIENT',
          entityId: client.id,
          description: `Created client ${name}`,
        },
      });
    }

    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, isActive } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'UPDATE',
          entity: 'CLIENT',
          entityId: client.id,
          description: `Updated client ${client.name}`,
        },
      });
    }

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (client._count.assignments > 0) {
      return res.status(400).json({ error: 'Cannot delete client with active assignments' });
    }

    await prisma.client.delete({ where: { id } });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'DELETE',
          entity: 'CLIENT',
          entityId: id,
          description: `Deleted client ${client.name}`,
        },
      });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};

export const getClientHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [assignments, replacements, removals, renewals] = await Promise.all([
      prisma.assignment.findMany({
        where: { clientId: id },
        include: { device: true, vehicle: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.replacement.findMany({
        where: { clientId: id },
        include: { oldDevice: true, newDevice: true, vehicle: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.removal.findMany({
        where: { clientId: id },
        include: { device: true, vehicle: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.renewal.findMany({
        where: { clientId: id },
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      assignments,
      replacements,
      removals,
      renewals,
    });
  } catch (error) {
    console.error('Get client history error:', error);
    res.status(500).json({ error: 'Failed to fetch client history' });
  }
};
