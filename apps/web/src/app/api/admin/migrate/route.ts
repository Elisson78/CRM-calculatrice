import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('🔌 Starting migration via API...');

        // 1. Check if column exists
        const checkRes = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='devis' AND column_name='nombre_demenageurs';
    `);

        if (checkRes.length === 0) {
            console.log('🚧 Column nombre_demenageurs missing. Adding it...');
            await query(`
        ALTER TABLE devis 
        ADD COLUMN nombre_demenageurs INTEGER DEFAULT NULL;
      `);
            console.log('✅ Column nombre_demenageurs added successfully.');
            return NextResponse.json({ success: true, message: 'Column nombre_demenageurs added.' });
        } else {
            console.log('✅ Column nombre_demenageurs already exists.');
            return NextResponse.json({ success: true, message: 'Column already exists.' });
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        return NextResponse.json(
            {
                error: 'Migration failed',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
