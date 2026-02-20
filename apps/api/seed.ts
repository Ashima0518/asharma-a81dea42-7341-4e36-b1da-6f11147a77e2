import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './src/database/entities/user.entity';
import { OrganizationEntity } from './src/database/entities/organization.entity';
import { TaskEntity } from './src/database/entities/task.entity';
import { AuditLogEntity } from './src/database/entities/audit-log.entity';

const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'task.db',
    entities: [UserEntity, OrganizationEntity, TaskEntity, AuditLogEntity],
    synchronize: true,
});

async function seed() {
    await AppDataSource.initialize();
    const orgRepo = AppDataSource.getRepository(OrganizationEntity);
    const userRepo = AppDataSource.getRepository(UserEntity);

    console.log('Seeding database...');

    // Create a main organization
    let org = await orgRepo.findOne({ where: { name: 'Acme Corp' } });
    if (!org) {
        org = orgRepo.create({ name: 'Acme Corp' });
        await orgRepo.save(org);
    }

    // Create an OWNER
    const ownerEmail = 'owner@acmecorp.com';
    let owner = await userRepo.findOne({ where: { email: ownerEmail } });
    if (!owner) {
        owner = userRepo.create({
            email: ownerEmail,
            name: 'Owner User',
            password: await bcrypt.hash('Password123', 10),
            organizationId: org.id,
            role: 'OWNER' as any
        });
        await userRepo.save(owner);
        console.log(`Created OWNER: ${ownerEmail}`);
    }

    // Create an ADMIN
    const adminEmail = 'admin@acmecorp.com';
    let admin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
        admin = userRepo.create({
            email: adminEmail,
            name: 'Admin User',
            password: await bcrypt.hash('Password123', 10),
            organizationId: org.id,
            role: 'ADMIN' as any
        });
        await userRepo.save(admin);
        console.log(`Created ADMIN: ${adminEmail}`);
    }

    // Create a VIEWER
    const viewerEmail = 'viewer@acmecorp.com';
    let viewer = await userRepo.findOne({ where: { email: viewerEmail } });
    if (!viewer) {
        viewer = userRepo.create({
            email: viewerEmail,
            name: 'Viewer User',
            password: await bcrypt.hash('Password123', 10),
            organizationId: org.id,
            role: 'VIEWER' as any
        });
        await userRepo.save(viewer);
        console.log(`Created VIEWER: ${viewerEmail}`);
    }

    console.log('Seeding complete. Password for all is Password123');
    await AppDataSource.destroy();
}

seed().catch(err => {
    console.error('Error during seeding:', err);
    process.exit(1);
});
