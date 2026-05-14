import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.API_AUTH_KEY) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
    }

    const client = getTursoClient();

    // Tables might not exist initially, we handle errors gracefully or create them.
    // In a real app we'd have a schema creation step. For this, we assume they exist or we create them.

    const fetchData = async (table: string) => {
        try {
            const rs = await client.execute(`SELECT * FROM ${table}`);
            return rs.rows.map(row => {
                    const item: any = {};
                for (const col of rs.columns) {
                        item[col] = row[col];
                }
                    if (item.data) {
                        try { return JSON.parse(item.data); } catch { return item; }
                }
                return item;
            });
        } catch (e) {
            console.error(`Error fetching table ${table}`, e);
            return [];
        }
    }

    const products = await fetchData('products');
    const users = await fetchData('users');
    const expenses = await fetchData('expenses');
    const salaries = await fetchData('salaries');
    const transactions = await fetchData('transactions');
    const suppliers = await fetchData('suppliers');
    const customers = await fetchData('credit_customers');

    return NextResponse.json({
        products,
        users,
        expenses,
        salaries,
        transactions,
        suppliers,
        customers
    });
  } catch (error: any) {
    console.error('API Pull Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

        const queue = await request.json();
        if (!Array.isArray(queue)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const client = getTursoClient();

        // Helper to map sync operation types to database tables
        const getTableFromType = (type: string) => {
            if (type.includes('transaction')) return 'transactions';
            if (type.includes('product')) return 'products';
            if (type.includes('customer')) return 'credit_customers';
            if (type.includes('expense')) return 'expenses';
            if (type.includes('salary')) return 'salaries';
            if (type.includes('user')) return 'users';
            if (type.includes('supplier')) return 'suppliers';
            return null;
        };

        // Process queue
        for (const item of queue as any[]) {
            const type = item.type;
            const payload = item.data || item.payload; // Desktop app uses `data`

            if (!type || !payload) continue;

            const tableName = getTableFromType(type);
            if (!tableName) continue;

            try {
                // Ensure table exists
                await client.execute(`CREATE TABLE IF NOT EXISTS ${tableName} (
                    id TEXT PRIMARY KEY,
                    data TEXT
                )`);

                if (type.startsWith('delete-')) {
                    const id = payload.id;
                    if (id) {
                        await client.execute({
                            sql: `DELETE FROM ${tableName} WHERE id = ?`,
                            args: [String(id)]
                        });
                    }
                } else if (type.startsWith('update-')) {
                    const id = payload.id;
                    const updates = payload.updates;
                    if (id && updates) {
                        // For updates, we first fetch the existing row, merge the JSON, and upsert
                        const existing = await client.execute({
                            sql: `SELECT data FROM ${tableName} WHERE id = ?`,
                            args: [String(id)]
                        });

                        let currentData = {};
                        if (existing.rows.length > 0 && existing.rows[0].data) {
                            try {
                                currentData = JSON.parse(existing.rows[0].data as string);
                            } catch (e) {}
                        }

                        const mergedData = { ...currentData, ...updates };
                        await client.execute({
                            sql: `INSERT INTO ${tableName} (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
                            args: [String(id), JSON.stringify(mergedData)]
                        });
                    }
                } else {
                    // add- or new- operations
                    const id = payload.id || payload.productId || payload.transactionId;
                    if (id) {
                        await client.execute({
                            sql: `INSERT INTO ${tableName} (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
                            args: [String(id), JSON.stringify(payload)]
                        });
                    }
                }
            } catch (err) {
                console.error(`Failed to process sync item type: ${type}`, err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
