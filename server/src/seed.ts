import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ProductsService } from './products/products.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const productsService = app.get(ProductsService);

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

  // --- Create sample products ---
  const sampleProducts = [
    { name: 'Espresso', price: 150, sku: 'COF-001', businessId: 'bzn_001_dev' },
    { name: 'Latte', price: 250, sku: 'COF-002', businessId: 'bzn_001_dev' },
    { name: 'Cappuccino', price: 250, sku: 'COF-003', businessId: 'bzn_001_dev' },
    { name: 'Black Tea', price: 100, sku: 'TEA-001', businessId: 'bzn_001_dev' },
    { name: 'Herbal Tea', price: 120, sku: 'TEA-002', businessId: 'bzn_001_dev' },
    { name: 'Croissant', price: 200, sku: 'PST-001', businessId: 'bzn_001_dev' },
    { name: 'Muffin', price: 180, sku: 'PST-002', businessId: 'bzn_001_dev' },
    { name: 'Mineral Water', price: 80, sku: 'DRK-001', businessId: 'bzn_001_dev' },
  ];

  console.log('Seeding products...');
  for (const product of sampleProducts) {
    // This is a simple seeder, so we don't check for existence first.
    // In a real app, you might want to avoid duplicates.
    await productsService.create(product);
    console.log(`- Created ${product.name}`);
  }
  console.log('Finished seeding products.');


  await app.close();
  console.log('Seeding complete. Application context closed.');
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
