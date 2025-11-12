import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalDevices,
      assignedDevices,
      totalClients,
      totalVehicles,
      monthlyInstallations,
      monthlyRemovals,
      upcomingRenewals,
      pendingTasks,
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { status: 'ASSIGNED' } }),
      prisma.client.count({ where: { isActive: true } }),
      prisma.vehicle.count(),
      prisma.assignment.count({
        where: {
          jobType: 'NEW_INSTALLATION',
          createdAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }),
      prisma.removal.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }),
      prisma.renewal.count({
        where: {
          subscriptionExpiry: {
            lte: new Date(new Date().setDate(new Date().getDate() + 30)),
          },
          status: { not: 'RENEWED' },
        },
      }),
      prisma.task.count({
        where: { status: 'PENDING' },
      }),
    ]);

    res.json({
      inventory: {
        totalDevices,
        assignedDevices,
        availableDevices: totalDevices - assignedDevices,
      },
      fleet: {
        totalClients,
        totalVehicles,
      },
      thisMonth: {
        installations: monthlyInstallations,
        removals: monthlyRemovals,
      },
      alerts: {
        upcomingRenewals,
        pendingTasks,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getTechnicianPerformance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate as string) : new Date();

    const installations = await prisma.assignment.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      select: {
        installerName: true,
        location: true,
        createdAt: true,
      },
    });

    const performanceByTechnician = installations.reduce((acc: any, installation) => {
      const tech = installation.installerName;
      if (!acc[tech]) {
        acc[tech] = {
          name: tech,
          installations: 0,
          locations: new Set(),
        };
      }
      acc[tech].installations++;
      acc[tech].locations.add(installation.location);
      return acc;
    }, {});

    const performance = Object.values(performanceByTechnician).map((tech: any) => ({
      name: tech.name,
      installations: tech.installations,
      locationsCount: tech.locations.size,
    }));

    res.json(performance);
  } catch (error) {
    console.error('Get technician performance error:', error);
    res.status(500).json({ error: 'Failed to fetch technician performance' });
  }
};

export const getInstallationMetrics = async (req: Request, res: Response) => {
  try {
    const last6Months = new Date();
    last6Months.setMonth(last6Months.getMonth() - 6);

    const installations = await prisma.assignment.findMany({
      where: {
        jobType: 'NEW_INSTALLATION',
        createdAt: { gte: last6Months },
      },
      select: {
        createdAt: true,
        location: true,
        platform: true,
      },
    });

    const byMonth = installations.reduce((acc: any, inst) => {
      const month = inst.createdAt.toISOString().substring(0, 7);
      if (!acc[month]) acc[month] = 0;
      acc[month]++;
      return acc;
    }, {});

    const byLocation = installations.reduce((acc: any, inst) => {
      if (!acc[inst.location]) acc[inst.location] = 0;
      acc[inst.location]++;
      return acc;
    }, {});

    const byPlatform = installations.reduce((acc: any, inst) => {
      if (!acc[inst.platform]) acc[inst.platform] = 0;
      acc[inst.platform]++;
      return acc;
    }, {});

    res.json({
      byMonth,
      byLocation,
      byPlatform,
      total: installations.length,
    });
  } catch (error) {
    console.error('Get installation metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch installation metrics' });
  }
};
