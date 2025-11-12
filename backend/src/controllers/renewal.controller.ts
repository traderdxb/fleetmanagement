import { Request, Response } from 'express';
import { PrismaClient, RenewalStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getRenewals = async (req: Request, res: Response) => {
  try {
    const { status, clientId, platform } = req.query;
    
    const renewals = await prisma.renewal.findMany({
      where: {
        ...(status && { status: status as RenewalStatus }),
        ...(clientId && { clientId: clientId as string }),
        ...(platform && { platform: { contains: platform as string } }),
      },
      include: {
        client: true,
        vehicle: true,
        assignment: {
          include: { device: true },
        },
      },
      orderBy: { subscriptionExpiry: 'asc' },
    });

    res.json(renewals);
  } catch (error) {
    console.error('Get renewals error:', error);
    res.status(500).json({ error: 'Failed to fetch renewals' });
  }
};

export const renewSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { renewalRemarks } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const renewal = await prisma.renewal.findUnique({ where: { id } });

    if (!renewal) {
      return res.status(404).json({ error: 'Renewal not found' });
    }

    const newExpiry = new Date(renewal.subscriptionExpiry);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    const updated = await prisma.renewal.update({
      where: { id },
      data: {
        status: RenewalStatus.RENEWED,
        subscriptionExpiry: newExpiry,
        renewalDate: new Date(),
        renewalRemarks,
        renewedBy: req.user.userId,
      },
      include: {
        client: true,
        vehicle: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'RENEW',
        entity: 'RENEWAL',
        entityId: id,
        description: `Renewed subscription for vehicle ${renewal.vehicleId}`,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({ error: 'Failed to renew subscription' });
  }
};

export const getUpcomingRenewals = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const renewals = await prisma.renewal.findMany({
      where: {
        subscriptionExpiry: {
          gte: today,
          lte: thirtyDaysLater,
        },
        status: { not: RenewalStatus.RENEWED },
      },
      include: {
        client: true,
        vehicle: true,
      },
      orderBy: { subscriptionExpiry: 'asc' },
    });

    res.json(renewals);
  } catch (error) {
    console.error('Get upcoming renewals error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming renewals' });
  }
};
