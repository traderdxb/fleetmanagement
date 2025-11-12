import { PrismaClient, UserRole, DeviceStatus, DeviceOwnership } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional)
  await prisma.activityLog.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.renewal.deleteMany();
  await prisma.task.deleteMany();
  await prisma.removal.deleteMany();
  await prisma.replacement.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.device.deleteMany();
  await prisma.sIM.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.client.deleteMany();
  await prisma.installer.deleteMany();
  await prisma.location.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.accessory.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fleet.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@fleet.com',
      password: await bcrypt.hash('manager123', 10),
      name: 'Manager User',
      role: UserRole.MANAGER,
    },
  });

  const support = await prisma.user.create({
    data: {
      email: 'support@fleet.com',
      password: await bcrypt.hash('support123', 10),
      name: 'Support User',
      role: UserRole.SUPPORT,
    },
  });

  console.log('✅ Users created');

  // Create Platforms
  const platforms = await Promise.all([
    prisma.platform.create({ data: { name: 'Securepath' } }),
    prisma.platform.create({ data: { name: 'Securepath Premium' } }),
    prisma.platform.create({ data: { name: 'AVL View' } }),
    prisma.platform.create({ data: { name: 'ASATEEL' } }),
    prisma.platform.create({ data: { name: 'Teletix' } }),
    prisma.platform.create({ data: { name: 'AVL View & ASATEEL' } }),
    prisma.platform.create({ data: { name: 'Fleetcop' } }),
  ]);

  console.log('✅ Platforms created');

  // Create Locations
  const locations = await Promise.all([
    prisma.location.create({ data: { name: 'Dubai' } }),
    prisma.location.create({ data: { name: 'Abu Dhabi' } }),
    prisma.location.create({ data: { name: 'Ajman' } }),
    prisma.location.create({ data: { name: 'Ras Al Khaimah' } }),
    prisma.location.create({ data: { name: 'Sharjah' } }),
    prisma.location.create({ data: { name: 'Umm Al-Quwain' } }),
  ]);

  console.log('✅ Locations created');

  // Create Installers
  const installers = await Promise.all([
    prisma.installer.create({ data: { name: 'Miqdad', phone: '+971501234567' } }),
    prisma.installer.create({ data: { name: 'Rashid', phone: '+971502345678' } }),
    prisma.installer.create({ data: { name: 'Waseem', phone: '+971503456789' } }),
  ]);

  console.log('✅ Installers created');

  // Create Accessories
  const accessories = await Promise.all([
    prisma.accessory.create({ data: { type: 'Immobilizer', description: 'Vehicle immobilizer relay' } }),
    prisma.accessory.create({ data: { type: 'Buzzer', description: 'Alarm buzzer' } }),
    prisma.accessory.create({ data: { type: 'I-Button', description: 'Driver identification' } }),
    prisma.accessory.create({ data: { type: 'Eye Sensor', description: 'Fatigue detection sensor' } }),
    prisma.accessory.create({ data: { type: 'Fuel Sensor', description: 'Fuel level monitoring' } }),
    prisma.accessory.create({ data: { type: 'Temperature Sensor', description: 'Temperature monitoring' } }),
    prisma.accessory.create({ data: { type: 'CANBUS L200', description: 'CANBUS interface' } }),
  ]);

  console.log('✅ Accessories created');

  // Create Clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'ABC Transport LLC',
        email: 'contact@abctransport.ae',
        phone: '+971501111111',
        address: 'Dubai, UAE',
      },
    }),
    prisma.client.create({
      data: {
        name: 'XYZ Logistics',
        email: 'info@xyzlogistics.ae',
        phone: '+971502222222',
        address: 'Abu Dhabi, UAE',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Emirates Fleet Services',
        email: 'fleet@emirates.ae',
        phone: '+971503333333',
        address: 'Sharjah, UAE',
      },
    }),
  ]);

  console.log('✅ Clients created');

  // Create Devices
  const devices = await Promise.all([
    ...Array.from({ length: 5 }, (_, i) =>
      prisma.device.create({
        data: {
          brand: 'Teltonika',
          model: 'FMC 130',
          imei: `35000000000000${i}`,
          serialNumber: `TEL-FMC130-${1000 + i}`,
          status: DeviceStatus.AVAILABLE,
          ownership: DeviceOwnership.LEASING,
        },
      })
    ),
    ...Array.from({ length: 3 }, (_, i) =>
      prisma.device.create({
        data: {
          brand: 'JIMI IoT',
          model: 'JM-VL103M',
          imei: `86000000000000${i}`,
          serialNumber: `JIMI-VL103M-${2000 + i}`,
          status: DeviceStatus.AVAILABLE,
          ownership: DeviceOwnership.OWNED,
        },
      })
    ),
    ...Array.from({ length: 3 }, (_, i) =>
      prisma.device.create({
        data: {
          brand: 'Ruptela',
          model: 'Trace 5',
          imei: `35800000000000${i}`,
          serialNumber: `RUP-TR5-${3000 + i}`,
          status: DeviceStatus.AVAILABLE,
          ownership: DeviceOwnership.LEASING,
        },
      })
    ),
  ]);

  console.log('✅ Devices created');

  // Create SIMs
  const sims = await Promise.all([
    ...Array.from({ length: 8 }, (_, i) =>
      prisma.sIM.create({
        data: {
          brand: 'DU',
          number: `05055500${100 + i}`,
          serialNumber: `DU-SIM-${4000 + i}`,
          status: DeviceStatus.AVAILABLE,
        },
      })
    ),
    ...Array.from({ length: 6 }, (_, i) =>
      prisma.sIM.create({
        data: {
          brand: 'Etisalat',
          number: `05055600${100 + i}`,
          serialNumber: `ETI-SIM-${5000 + i}`,
          status: DeviceStatus.AVAILABLE,
        },
      })
    ),
  ]);

  console.log('✅ SIMs created');

  // Create Vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        make: 'Toyota',
        model: 'Land Cruiser',
        plateNumber: 'A-12345',
        chassisNumber: 'TLC-CHAS-001',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Nissan',
        model: 'Patrol',
        plateNumber: 'B-67890',
        chassisNumber: 'NIS-CHAS-002',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Ford',
        model: 'F-150',
        plateNumber: 'C-11111',
        chassisNumber: 'FORD-CHAS-003',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Mitsubishi',
        model: 'L200',
        plateNumber: 'D-22222',
        chassisNumber: 'MIT-CHAS-004',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Isuzu',
        model: 'D-Max',
        plateNumber: 'E-33333',
        chassisNumber: 'ISU-CHAS-005',
      },
    }),
  ]);

  console.log('✅ Vehicles created');

  // Create Sample Assignments
  const today = new Date();
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(today.getFullYear() + 1);

  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        jobType: 'NEW_INSTALLATION',
        deviceId: devices[0].id,
        simId: sims[0].id,
        vehicleId: vehicles[0].id,
        clientId: clients[0].id,
        platform: 'Securepath',
        installationDate: today,
        activationDate: today,
        certificateExpiry: oneYearLater,
        subscriptionExpiry: oneYearLater,
        installerName: 'Miqdad',
        location: 'Dubai',
        accessories: JSON.stringify([{ type: 'Immobilizer', details: 'Standard relay' }]),
        remarks: 'Installation completed successfully',
        addedBy: admin.id,
      },
    }),
    prisma.assignment.create({
      data: {
        jobType: 'NEW_INSTALLATION',
        deviceId: devices[1].id,
        simId: sims[1].id,
        vehicleId: vehicles[1].id,
        clientId: clients[1].id,
        platform: 'AVL View',
        installationDate: today,
        activationDate: today,
        certificateExpiry: oneYearLater,
        subscriptionExpiry: oneYearLater,
        installerName: 'Rashid',
        location: 'Abu Dhabi',
        accessories: JSON.stringify([
          { type: 'Fuel Sensor', details: 'Capacitive sensor' },
          { type: 'Temperature Sensor', details: 'Cold chain monitoring' },
        ]),
        remarks: 'Installed with additional sensors',
        addedBy: manager.id,
      },
    }),
  ]);

  // Update device statuses
  await prisma.device.update({
    where: { id: devices[0].id },
    data: { status: DeviceStatus.ASSIGNED },
  });
  await prisma.device.update({
    where: { id: devices[1].id },
    data: { status: DeviceStatus.ASSIGNED },
  });

  await prisma.sIM.update({
    where: { id: sims[0].id },
    data: { status: DeviceStatus.ASSIGNED },
  });
  await prisma.sIM.update({
    where: { id: sims[1].id },
    data: { status: DeviceStatus.ASSIGNED },
  });

  console.log('✅ Assignments created');

  // Create Renewals from Assignments
  await Promise.all(
    assignments.map((assignment) =>
      prisma.renewal.create({
        data: {
          assignmentId: assignment.id,
          vehicleId: assignment.vehicleId,
          clientId: assignment.clientId,
          platform: assignment.platform,
          activationDate: assignment.activationDate,
          certificateExpiry: assignment.certificateExpiry,
          subscriptionExpiry: assignment.subscriptionExpiry,
          status: 'UPCOMING',
        },
      })
    )
  );

  console.log('✅ Renewals created');

  // Create Sample Tasks
  await Promise.all([
    prisma.task.create({
      data: {
        type: 'NEW_INSTALLATION',
        title: 'Install GPS on vehicle F-44444',
        description: 'Client: Emirates Fleet Services, Location: Sharjah',
        status: 'PENDING',
        assignedTo: support.id,
        createdBy: manager.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
    }),
    prisma.task.create({
      data: {
        type: 'REMOVAL',
        title: 'Remove device from vehicle G-55555',
        description: 'End of contract, return device to inventory',
        status: 'PENDING',
        assignedTo: support.id,
        createdBy: admin.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
    }),
  ]);

  console.log('✅ Tasks created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📧 Default login credentials:');
  console.log('   Admin: admin@fleet.com / admin123');
  console.log('   Manager: manager@fleet.com / manager123');
  console.log('   Support: support@fleet.com / support123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
