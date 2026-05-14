import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        if (token !== process.env.API_AUTH_KEY) {
            return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
        }

        const data = await request.json();
        const client = getTursoClient();

        // Helper to init table
        const initTable = async (tableName: string) => {
            await client.execute(`CREATE TABLE IF NOT EXISTS ${tableName} (
                id TEXT PRIMARY KEY,
                data TEXT
            )`);
        };

        const syncTable = async (tableName: string, items: any[]) => {
            if (!items || !Array.isArray(items) || items.length === 0) return;
            await initTable(tableName);

            // Use transaction for batch upsert
            const transaction = await client.transaction("write");
            try {
                for (const item of items) {
                    const id = item.id || item.productId || item.transactionId || item.userId || item.expenseId || item.salaryId || item.customerId || item.supplierId;
                    if (!id) continue;

                    await transaction.execute({
                        sql: `INSERT INTO ${tableName} (id, data) VALUES (?, ?)
                              ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
                        args: [String(id), JSON.stringify(item)]
                    });
                }
                await transaction.commit();
            } catch (e) {
                await transaction.rollback();
                throw e;
            }
        };

        // Sync all provided categories
        await syncTable('products', data.products);
        await syncTable('users', data.users);
        await syncTable('expenses', data.expenses);
        await syncTable('salaries', data.salaries);
        await syncTable('transactions', data.transactions);
        await syncTable('credit_customers', data.customers);
        await syncTable('suppliers', data.suppliers);

        return NextResponse.json({ success: true, message: 'Full sync complete' });
    } catch (error: any) {
        console.error('Full Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
