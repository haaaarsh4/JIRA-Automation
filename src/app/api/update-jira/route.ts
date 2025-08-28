import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import JiraClient from 'jira-client';

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received');

    // Get form data from the request
    const formData = await request.formData();
    const jiraField = formData.get('jiraField') as string;
    const file = formData.get('file') as File;

    if (!jiraField) {
      return NextResponse.json(
        { message: 'No JIRA field selected' },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { message: 'No file uploaded or file is empty' },
        { status: 400 }
      );
    }

    // Convert file to array buffer and parse Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!Array.isArray(data) || data.length < 2) {
      return NextResponse.json(
        { message: 'Excel file must contain at least 2 rows (header + data)' },
        { status: 400 }
      );
    }

    // Jira setup (use env variables for credentials)
    const jira = new JiraClient({
      protocol: 'https',
      host: 'intra.jira.devops.css.gov.on.ca',
      port: '8443',
      username: process.env.JIRA_USERNAME!,
      password: process.env.JIRA_PASSWORD!,
      apiVersion: '2',
      strictSSL: false,
    });

    let successCount = 0;
    let failCount = 0;

    // Assuming first row is a header
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const ticketId = row[0]?.toString(); // column A = ticket key
      const updateValue = row[1]?.toString(); // column B = updateValue

      if (!ticketId || !updateValue) {
        console.warn(`Skipping row ${i + 1}: missing ticketId or updateValue`);
        failCount++;
        continue;
      }

      try {
        await jira.updateIssue(ticketId, {
          fields: {
            [jiraField]: updateValue,
          },
        });
        console.log(`Updated ${ticketId} with ${jiraField}: ${updateValue}`);
        successCount++;
      } catch (err) {
        console.error(`Failed to update ${ticketId}:`, err);
        failCount++;
      }
    }

    return NextResponse.json({
      message: `Finished updating JIRA tickets.`,
      totalRows: data.length - 1,
      updated: successCount,
      failed: failCount,
    });

  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
}
