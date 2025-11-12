import { Request, Response } from 'express';
import { PrismaClient, DeviceStatus, DeviceOwnership } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Devices
export const getDevices = async (req: Request, res: Response) => {
  try {
    const { status, ownership, brand, model } = req.query;

    const devices = await prisma.device.findMany({
      where: {
        ...(status && { status: status as DeviceStatus }),
        ...(ownership && { ownership: ownership as DeviceOwnership }),
        ...(brand && { brand: { contains: brand as string, mode: 'insensitive' } }),
        ...(model && { model: { contains: model as string, mode: 'insensitive' } }),
      },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(devices);
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
};

export const getDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        client: true,
        assignments: {
          include: {
            vehicle: true,
            client: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json(device);
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
};

export const createDevice = async (req: AuthRequest, res: Response) => {
  try {
    const { brand, model, imei, serialNumber, ownership } = req.body;

    if (!brand || !model || !imei) {
      return res.status(400).json({ error: 'Brand, model, and IMEI are required' });
    }

    const existingDevice = await prisma.device.findUnique({ where: { imei } });

    if (existingDevice) {
      return res.status(400).json({ error: 'Device with this IMEI already exists' });
    }

    const device = await prisma.device.create({
      data: {
        brand,
        model,
        imei,
        serialNumber,
        ownership: ownership || DeviceOwnership.LEASING,
        status: DeviceStatus.AVAILABLE,
      },
    });

    // Log activity
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'CREATE',
          entity: 'DEVICE',
          entityId: device.id,
          description: `Created device ${brand} ${model} - IMEI: ${imei}`,
        },
      });
    }

    res.status(201).json(device);
  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
};

export const updateDevice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { brand, model, serialNumber, status, ownership } = req.body;

    const device = await prisma.device.update({
      where: { id },
      data: {
        ...(brand && { brand }),
        ...(model && { model }),
        ...(serialNumber !== undefined && { serialNumber }),
        ...(status && { status }),
        ...(ownership && { ownership }),
      },
    });

    // Log activity
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'UPDATE',
          entity: 'DEVICE',
          entityId: device.id,
          description: `Updated device ${device.brand} ${device.model}`,
        },
      });
    }

    res.json(device);
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
};

export const deleteDevice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const device = await prisma.device.findUnique({ where: { id } });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.status === DeviceStatus.ASSIGNED) {
      return res.status(400).json({ error: 'Cannot delete assigned device' });
    }

    await prisma.device.delete({ where: { id } });

    // Log activity
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'DELETE',
          entity: 'DEVICE',
          entityId: id,
          description: `Deleted device ${device.brand} ${device.model}`,
        },
      });
    }

    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
};

// SIMs
export const getSIMs = async (req: Request, res: Response) => {
  try {
    const { status, brand } = req.query;

    const sims = await prisma.sIM.findMany({
      where: {
        ...(status && { status: status as DeviceStatus }),
        ...(brand && { brand: { contains: brand as string, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(sims);
  } catch (error) {
    console.error('Get SIMs error:', error);
    res.status(500).json({ error: 'Failed to fetch SIMs' });
  }
};

export const createSIM = async (req: AuthRequest, res: Response) => {
  try {
    const { brand, number, serialNumber } = req.body;

    if (!brand || !number) {
      return res.status(400).json({ error: 'Brand and number are required' });
    }

    const existingSIM = await prisma.sIM.findUnique({ where: { number } });

    if (existingSIM) {
      return res.status(400).json({ error: 'SIM with this number already exists' });
    }

    const sim = await prisma.sIM.create({
      data: {
        brand,
        number,
        serialNumber,
        status: DeviceStatus.AVAILABLE,
      },
    });

    // Log activity
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'CREATE',
          entity: 'SIM',
          entityId: sim.id,
          description: `Created SIM ${brand} - ${number}`,
        },
      });
    }

    res.status(201).json(sim);
  } catch (error) {
    console.error('Create SIM error:', error);
    res.status(500).json({ error: 'Failed to create SIM' });
  }
};

export const updateSIM = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { brand, serialNumber, status } = req.body;

    const sim = await prisma.sIM.update({
      where: { id },
      data: {
        ...(brand && { brand }),
        ...(serialNumber !== undefined && { serialNumber }),
        ...(status && { status }),
      },
    });

    // Log activity
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'UPDATE',
          entity: 'SIM',
          entityId: sim.id,
          description: `Updated SIM ${sim.brand} - ${sim.number}`,
        },
      });
    }

    res.json(sim);
  } catch (error) {
    console.error('Update SIM error:', error);
    res.status(500).json({ error: 'Failed to update SIM' });
  }
};

export const deleteSIM = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const sim = await prisma.sIM.findUnique({ where: { id } });

    if (!sim) {
      return res.status(404).json({ error: 'SIM not found' });
    }

    if (sim.status === DeviceStatus.ASSIGNED) {
      return res.status(400).json({ error: 'Cannot delete assigned SIM' });
    }

    await prisma.sIM.delete({ where: { id } });

    // Log activity
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'DELETE',
          entity: 'SIM',
          entityId: id,
          description: `Deleted SIM ${sim.brand} - ${sim.number}`,
        },
      });
    }

    res.json({ message: 'SIM deleted successfully' });
  } catch (error) {
    console.error('Delete SIM error:', error);
    res.status(500).json({ error: 'Failed to delete SIM' });
  }
};

// Inventory Stats
export const getInventoryStats = async (req: Request, res: Response) => {
  try {
    const deviceStats = await prisma.device.groupBy({
      by: ['status', 'ownership'],
      _count: true,
    });

    const simStats = await prisma.sIM.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalDevices = await prisma.device.count();
    const totalSIMs = await prisma.sIM.count();

    res.json({
      devices: {
        total: totalDevices,
        byStatus: deviceStats,
      },
      sims: {
        total: totalSIMs,
        byStatus: simStats,
      },
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory stats' });
  }
};
