import { Request, Response } from 'express';
import { PrismaClient, JobType, DeviceStatus, DeviceOwnership } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const { jobType, clientId, platform, location, startDate, endDate } = req.query;

    const assignments = await prisma.assignment.findMany({
      where: {
        ...(jobType && { jobType: jobType as JobType }),
        ...(clientId && { clientId: clientId as string }),
        ...(platform && { platform: { contains: platform as string, mode: 'insensitive' } }),
        ...(location && { location: { contains: location as string, mode: 'insensitive' } }),
        ...(startDate &&
          endDate && {
            installationDate: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          }),
      },
      include: {
        device: true,
        sim: true,
        vehicle: true,
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

export const getAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        device: true,
        sim: true,
        vehicle: true,
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      jobType,
      deviceId,
      simId,
      vehicleId,
      clientId,
      platform,
      installationDate,
      activationDate,
      certificateExpiry,
      subscriptionExpiry,
      installerName,
      location,
      accessories,
      remarks,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate required fields
    if (!jobType || !deviceId || !vehicleId || !clientId || !platform) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check device availability
    const device = await prisma.device.findUnique({ where: { id: deviceId } });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (jobType === 'NEW_INSTALLATION' && device.status !== DeviceStatus.AVAILABLE) {
      return res.status(400).json({ error: 'Device is not available' });
    }

    // Check SIM availability if provided
    if (simId) {
      const sim = await prisma.sIM.findUnique({ where: { id: simId } });
      if (!sim || sim.status !== DeviceStatus.AVAILABLE) {
        return res.status(400).json({ error: 'SIM is not available' });
      }
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        jobType,
        deviceId,
        simId,
        vehicleId,
        clientId,
        platform,
        installationDate: installationDate ? new Date(installationDate) : new Date(),
        activationDate: activationDate ? new Date(activationDate) : new Date(),
        certificateExpiry: certificateExpiry
          ? new Date(certificateExpiry)
          : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        subscriptionExpiry: subscriptionExpiry
          ? new Date(subscriptionExpiry)
          : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        installerName,
        location,
        accessories,
        remarks,
        addedBy: req.user.userId,
      },
      include: {
        device: true,
        sim: true,
        vehicle: true,
        client: true,
      },
    });

    // Update device status
    if (jobType === 'NEW_INSTALLATION' || jobType === 'DEVICE_REPLACEMENT') {
      await prisma.device.update({
        where: { id: deviceId },
        data: {
          status: DeviceStatus.ASSIGNED,
          clientId,
        },
      });

      // Update SIM status if provided
      if (simId) {
        await prisma.sIM.update({
          where: { id: simId },
          data: { status: DeviceStatus.ASSIGNED },
        });
      }
    }

    // Create renewal record
    await prisma.renewal.create({
      data: {
        assignmentId: assignment.id,
        vehicleId,
        clientId,
        platform,
        activationDate: assignment.activationDate,
        certificateExpiry: assignment.certificateExpiry,
        subscriptionExpiry: assignment.subscriptionExpiry,
        status: 'UPCOMING',
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'CREATE',
        entity: 'ASSIGNMENT',
        entityId: assignment.id,
        description: `Created ${jobType} for vehicle ${vehicleId}`,
        metadata: { jobType, platform, location },
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.installationDate && {
          installationDate: new Date(updateData.installationDate),
        }),
        ...(updateData.activationDate && {
          activationDate: new Date(updateData.activationDate),
        }),
        ...(updateData.certificateExpiry && {
          certificateExpiry: new Date(updateData.certificateExpiry),
        }),
        ...(updateData.subscriptionExpiry && {
          subscriptionExpiry: new Date(updateData.subscriptionExpiry),
        }),
      },
      include: {
        device: true,
        sim: true,
        vehicle: true,
        client: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'UPDATE',
        entity: 'ASSIGNMENT',
        entityId: assignment.id,
        description: `Updated assignment for vehicle ${assignment.vehicleId}`,
      },
    });

    res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { device: true },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Return device to inventory based on ownership
    if (assignment.device.ownership === DeviceOwnership.LEASING) {
      await prisma.device.update({
        where: { id: assignment.deviceId },
        data: {
          status: DeviceStatus.AVAILABLE,
          clientId: null,
        },
      });
    } else {
      await prisma.device.update({
        where: { id: assignment.deviceId },
        data: {
          status: DeviceStatus.TRANSFER_AVAILABLE,
        },
      });
    }

    // Return SIM to inventory if present
    if (assignment.simId) {
      await prisma.sIM.update({
        where: { id: assignment.simId },
        data: { status: DeviceStatus.AVAILABLE },
      });
    }

    await prisma.assignment.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'DELETE',
        entity: 'ASSIGNMENT',
        entityId: id,
        description: `Deleted assignment for vehicle ${assignment.vehicleId}`,
      },
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};

// Replacements
export const createReplacement = async (req: AuthRequest, res: Response) => {
  try {
    const { oldDeviceId, newDeviceId, vehicleId, clientId, reason } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!oldDeviceId || !newDeviceId || !vehicleId || !clientId || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const oldDevice = await prisma.device.findUnique({ where: { id: oldDeviceId } });
    const newDevice = await prisma.device.findUnique({ where: { id: newDeviceId } });

    if (!oldDevice || !newDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (newDevice.status !== DeviceStatus.AVAILABLE) {
      return res.status(400).json({ error: 'New device is not available' });
    }

    const replacement = await prisma.replacement.create({
      data: {
        oldDeviceId,
        newDeviceId,
        vehicleId,
        clientId,
        reason,
        replacedBy: req.user.userId,
      },
      include: {
        oldDevice: true,
        newDevice: true,
        vehicle: true,
        client: true,
      },
    });

    // Update old device status based on ownership
    if (oldDevice.ownership === DeviceOwnership.LEASING) {
      await prisma.device.update({
        where: { id: oldDeviceId },
        data: {
          status: DeviceStatus.AVAILABLE,
          clientId: null,
        },
      });
    } else {
      await prisma.device.update({
        where: { id: oldDeviceId },
        data: {
          status: DeviceStatus.TRANSFER_AVAILABLE,
        },
      });
    }

    // Update new device status
    await prisma.device.update({
      where: { id: newDeviceId },
      data: {
        status: DeviceStatus.ASSIGNED,
        clientId,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'CREATE',
        entity: 'REPLACEMENT',
        entityId: replacement.id,
        description: `Replaced device on vehicle ${vehicleId}`,
        metadata: { reason },
      },
    });

    res.status(201).json(replacement);
  } catch (error) {
    console.error('Create replacement error:', error);
    res.status(500).json({ error: 'Failed to create replacement' });
  }
};

export const getReplacements = async (req: Request, res: Response) => {
  try {
    const replacements = await prisma.replacement.findMany({
      include: {
        oldDevice: true,
        newDevice: true,
        vehicle: true,
        client: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(replacements);
  } catch (error) {
    console.error('Get replacements error:', error);
    res.status(500).json({ error: 'Failed to fetch replacements' });
  }
};

// Removals
export const createRemoval = async (req: AuthRequest, res: Response) => {
  try {
    const { deviceId, vehicleId, clientId, reason } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!deviceId || !vehicleId || !clientId || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await prisma.device.findUnique({ where: { id: deviceId } });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const removal = await prisma.removal.create({
      data: {
        deviceId,
        vehicleId,
        clientId,
        reason,
        removedBy: req.user.userId,
      },
      include: {
        device: true,
        vehicle: true,
        client: true,
      },
    });

    // Update device status based on ownership
    if (device.ownership === DeviceOwnership.LEASING) {
      await prisma.device.update({
        where: { id: deviceId },
        data: {
          status: DeviceStatus.AVAILABLE,
          clientId: null,
        },
      });
    } else {
      await prisma.device.update({
        where: { id: deviceId },
        data: {
          status: DeviceStatus.TRANSFER_AVAILABLE,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'CREATE',
        entity: 'REMOVAL',
        entityId: removal.id,
        description: `Removed device from vehicle ${vehicleId}`,
        metadata: { reason },
      },
    });

    res.status(201).json(removal);
  } catch (error) {
    console.error('Create removal error:', error);
    res.status(500).json({ error: 'Failed to create removal' });
  }
};

export const getRemovals = async (req: Request, res: Response) => {
  try {
    const removals = await prisma.removal.findMany({
      include: {
        device: true,
        vehicle: true,
        client: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(removals);
  } catch (error) {
    console.error('Get removals error:', error);
    res.status(500).json({ error: 'Failed to fetch removals' });
  }
};
