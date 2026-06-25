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

    await sheet.addRow({
      Date: body.date,
      Type: body.type,
      Amount: body.amount,
      Item: body.item || '', 
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

    let allTime = { revenue: 0, expenses: 0 };
    let thisMonth = { revenue: 0, expenses: 0 };
    let history = []; 

    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = String(now.getFullYear());

    rows.forEach(row => {
      const amount = parseFloat(row.get('Amount')) || 0; 
      const type = row.get('Type');
      const dateStr = row.get('Date'); 

      const isThisMonth = dateStr && dateStr.startsWith(`${currentYear}-${currentMonth}`);

      if (type === 'Revenue') {
        allTime.revenue += amount;
        if (isThisMonth) thisMonth.revenue += amount;
      } else if (type === 'Expense') {
        allTime.expenses += amount;
        if (isThisMonth) thisMonth.expenses += amount;
      }

      if (amount > 0) {
        history.push({
          date: dateStr,
          type: type,
          amount: amount,
          item: row.get('Item') || ''
        });
      }
    });

    allTime.profit = allTime.revenue - allTime.expenses;
    thisMonth.profit = thisMonth.revenue - thisMonth.expenses;

    const recentHistory = history.reverse().slice(0, 5);

    return NextResponse.json({ allTime, thisMonth, history: recentHistory }, { status: 200 });

  } catch (error) {
    console.error('Spreadsheet GET Error Details:', error);
    return NextResponse.json({ error: error.message || 'Failed to load dashboard' }, { status: 500 });
  }
}