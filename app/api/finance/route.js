export const dynamic = 'force-dynamic';

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

async function getGoogleDoc() {
  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const doc = await getGoogleDoc();
    const sheet = doc.sheetsByIndex[0];

    // Removed Category and Description from here
    await sheet.addRow({
      Date: body.date,
      Type: body.type,
      Amount: body.amount,
      'Added By': 'Charan G', 
    });

    return NextResponse.json({ message: 'Transaction added successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Spreadsheet POST Error Details:', error);
    return NextResponse.json({ error: error.message || 'Failed to add transaction' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const doc = await getGoogleDoc();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    let totalRevenue = 0;
    let totalExpenses = 0;

    rows.forEach(row => {
      const amount = parseFloat(row.get('Amount')) || 0; 
      const type = row.get('Type');

      if (type === 'Revenue') {
        totalRevenue += amount;
      } else if (type === 'Expense') {
        totalExpenses += amount;
      }
    });

    const netProfit = totalRevenue - totalExpenses;

    return NextResponse.json({ 
      revenue: totalRevenue, 
      expenses: totalExpenses, 
      profit: netProfit 
    }, { status: 200 });

  } catch (error) {
    console.error('Spreadsheet GET Error Details:', error);
    return NextResponse.json({ error: error.message || 'Failed to load dashboard' }, { status: 500 });
  }
}