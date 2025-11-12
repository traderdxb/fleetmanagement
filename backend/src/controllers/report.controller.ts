import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getActivityReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, type } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    const [installations, transfers, removals, replacements, renewals] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          jobType: 'NEW_INSTALLATION',
          createdAt: { gte: start, lte: end },
        },
        include: { client: true, vehicle: true, device: true },
      }),
      prisma.assignment.findMany({
        where: {
          jobType: 'TRANSFER_INSTALLATION',
          createdAt: { gte: start, lte: end },
        },
        include: { client: true, vehicle: true, device: true },
      }),
      prisma.removal.findMany({
        where: {
          createdAt: { gte: start, lte: end },
        },
        include: { client: true, vehicle: true, device: true },
      }),
      prisma.replacement.findMany({
        where: {
          createdAt: { gte: start, lte: end },
        },
        include: { client: true, vehicle: true, oldDevice: true, newDevice: true },
      }),
      prisma.renewal.findMany({
        where: {
          renewalDate: { gte: start, lte: end },
        },
        include: { client: true, vehicle: true },
      }),
    ]);

    res.json({
      period: { start, end },
      summary: {
        installations: installations.length,
        transfers: transfers.length,
        removals: removals.length,
        replacements: replacements.length,
        renewals: renewals.length,
      },
      details: {
        installations,
        transfers,
        removals,
        replacements,
        renewals,
      },
    });
  } catch (error) {
    console.error('Get activity report error:', error);
    res.status(500).json({ error: 'Failed to fetch activity report' });
  }
};

export const getPlatformMasterlist = async (req: Request, res: Response) => {
  try {
    const { platform, clientId, location, ownership } = req.query;

    const assignments = await prisma.assignment.findMany({
      where: {
        ...(platform && { platform: { contains: platform as string } }),
        ...(clientId && { clientId: clientId as string }),
        ...(location && { location: { contains: location as string } }),
        ...(ownership && { device: { ownership: ownership as any } }),
      },
      include: {
        device: true,
        sim: true,
        vehicle: true,
        client: true,
      },
      orderBy: { platform: 'asc' },
    });

    const groupedByPlatform = assignments.reduce((acc: any, assignment) => {
      if (!acc[assignment.platform]) {
        acc[assignment.platform] = [];
      }
      acc[assignment.platform].push(assignment);
      return acc;
    }, {});

    res.json({
      total: assignments.length,
      platforms: Object.keys(groupedByPlatform),
      data: groupedByPlatform,
    });
  } catch (error) {
    console.error('Get platform masterlist error:', error);
    res.status(500).json({ error: 'Failed to fetch platform masterlist' });
  }
};
