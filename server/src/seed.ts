import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  console.log('Starting to seed the database...');

  // --- Create a sample Cashier user ---
  const cashierEmail = 'cashier@whizpos.local';
  const existingCashier = await usersService.findOneByEmail(cashierEmail);

  if (!existingCashier) {
    const cashier = await usersService.createUser({
      businessId: 'bzn_001_dev',
      name: 'Jane Cashier',
      roles: ['Cashier'],
      pinHash: '1234', // The schema will hash this before saving
      email: cashierEmail,
    });
    console.log('Successfully created test cashier:', cashier);
    console.log('--> PIN for this user is: 1234');
  } else {
    console.log('Test cashier already exists.');
  }

  await app.close();
  console.log('Seeding complete. Application context closed.');
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
