import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPlatforms = async (req: Request, res: Response) => {
  try {
    const platforms = await prisma.platform.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
};

export const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

export const getInstallers = async (req: Request, res: Response) => {
  try {
    const installers = await prisma.installer.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json(installers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch installers' });
  }
};

export const getAccessories = async (req: Request, res: Response) => {
  try {
    const accessories = await prisma.accessory.findMany({ orderBy: { type: 'asc' } });
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accessories' });
  }
};

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { plateNumber: 'asc' } });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { make, model, plateNumber, chassisNumber } = req.body;
    const vehicle = await prisma.vehicle.create({ data: { make, model, plateNumber, chassisNumber } });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};
