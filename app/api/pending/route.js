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

async function getPendingSheet() {
  const doc = await getGoogleDoc();
  const sheet = doc.sheetsByTitle['Pending'];
  if (!sheet) throw new Error("Could not find a tab named 'Pending' in your Google Sheet.");
  return sheet;
}

export async function GET() {
  try {
    const sheet = await getPendingSheet();
    const rows = await sheet.getRows();

    let totalPending = 0;
    const history = rows.map(row => {
      const amount = parseFloat(row.get('Amount')) || 0;
      totalPending += amount;
      return {
        id: row.get('ID'),
        date: row.get('Date'),
        name: row.get('Name'),
        amount: amount
      };
    });

    return NextResponse.json({ totalPending, history }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sheet = await getPendingSheet();

    await sheet.addRow({
      ID: Date.now().toString(), 
      Date: body.date,
      Name: body.name,
      Amount: body.amount,
    });

    return NextResponse.json({ message: 'Pending due added!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idToDelete = searchParams.get('id'); 
    
    const sheet = await getPendingSheet();
    const rows = await sheet.getRows();

    const rowToDelete = rows.find(row => row.get('ID') === idToDelete);
    
    if (rowToDelete) {
      await rowToDelete.delete(); 
      return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
  } catch(error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}