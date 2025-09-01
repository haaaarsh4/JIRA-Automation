import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import JiraClient from 'jira-client';

// Type definitions matching the frontend
interface ExportRequestBody {
  type?: string;
  status?: string;
  labels?: string;
  fixVersion?: string;
  customJQL?: string;
  fields?: string[];
}

interface JiraIssue {
  key: string;
  fields: {
    summary?: string;
    status?: { name: string };
    assignee?: { displayName: string };
    created?: string;
    updated?: string;
    description?: string;
    labels?: string[];
    fixVersions?: Array<{ name: string }>;
    issuetype?: { name: string };
    // Custom fields
    'T-shirt size'?: any;
    groomingDeadline?: any;
    BAEffort?: any;
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('Export request received');

    const body: ExportRequestBody = await request.json();
    const { 
      type,        // Changed from issueType to type to match frontend
      status, 
      labels, 
      fixVersion,  // Changed from fixVersions to fixVersion to match frontend
      customJQL,
      fields = ['summary', 'status', 'assignee', 'created', 'updated'] // Default fields matching frontend
    } = body;

    // Jira setup
    const jira = new JiraClient({
      protocol: 'https',
      host: 'intra.jira.devops.css.gov.on.ca',
      port: '8443',
      username: process.env.JIRA_USERNAME!,
      password: process.env.JIRA_PASSWORD!,
      apiVersion: '2',
      strictSSL: false,
    });

    // Build JQL query
    let jqlQuery = '';
    const conditions = [];

    if (customJQL) {
      // If user provides custom JQL, use it directly
      jqlQuery = customJQL;
    } else {
      // Build JQL from filters - using exact field names from frontend
      if (type) conditions.push(`issuetype = "${type}"`);
      if (status) conditions.push(`status = "${status}"`);
      if (labels) conditions.push(`labels = "${labels}"`);
      if (fixVersion) conditions.push(`fixVersion = "${fixVersion}"`);
      
      jqlQuery = conditions.join(' AND ');
    }

    if (!jqlQuery) {
      return NextResponse.json(
        { message: 'No search criteria provided' },
        { status: 400 }
      );
    }

    console.log('Executing JQL query:', jqlQuery);

    // Create fields array for JIRA API - need to include 'key' and map frontend field names
    const jiraFields = ['key']; // Always include key
    fields.forEach((field: string) => {
      switch (field) {
        case 'summary':
          jiraFields.push('summary');
          break;
        case 'status':
          jiraFields.push('status');
          break;
        case 'assignee':
          jiraFields.push('assignee');
          break;
        case 'created':
          jiraFields.push('created');
          break;
        case 'updated':
          jiraFields.push('updated');
          break;
        case 'description':
          jiraFields.push('description');
          break;
        case 'labels':
          jiraFields.push('labels');
          break;
        case 'fixVersions':
          jiraFields.push('fixVersions');
          break;
        case 'T-shirt size':
          jiraFields.push('T-shirt size'); // Custom field - may need customfield_xxxxx
          break;
        case 'groomingDeadline':
          jiraFields.push('groomingDeadline'); // Custom field - may need customfield_xxxxx
          break;
        case 'BAEffort':
          jiraFields.push('BAEffort'); // Custom field - may need customfield_xxxxx
          break;
        default:
          jiraFields.push(field);
      }
    });

    // Search JIRA issues
    const searchResults = await jira.searchJira(jqlQuery, {
      startAt: 0,
      maxResults: 1000,
      fields: jiraFields,
    });

    if (!searchResults.issues || searchResults.issues.length === 0) {
      return NextResponse.json(
        { message: 'No issues found matching the criteria' },
        { status: 404 }
      );
    }

    console.log(`Found ${searchResults.issues.length} issues`);

    // Prepare data for Excel
    const excelData: (string | number)[][] = [];
    
    // Create header row using the exact field labels from frontend
    const headers: string[] = [];
    fields.forEach((field: string) => {
      switch (field) {
        case 'summary':
          headers.push('Summary');
          break;
        case 'status':
          headers.push('Status');
          break;
        case 'assignee':
          headers.push('Assignee');
          break;
        case 'created':
          headers.push('Created Date');
          break;
        case 'updated':
          headers.push('Updated Date');
          break;
        case 'description':
          headers.push('Description');
          break;
        case 'labels':
          headers.push('Labels');
          break;
        case 'fixVersions':
          headers.push('Fix Versions');
          break;
        case 'T-shirt size':
          headers.push('T-shirt size');
          break;
        case 'groomingDeadline':
          headers.push('Grooming Deadline');
          break;
        case 'BAEffort':
          headers.push('BA Effort');
          break;
        default:
          headers.push(field);
      }
    });
    excelData.push(headers);

    // Add data rows
    searchResults.issues.forEach((issue: JiraIssue) => {
      const row: (string | number)[] = [];
      fields.forEach((field: string) => {
        switch (field) {
          case 'summary':
            row.push(issue.fields.summary || '');
            break;
          case 'status':
            row.push(issue.fields.status?.name || '');
            break;
          case 'assignee':
            row.push(issue.fields.assignee?.displayName || 'Unassigned');
            break;
          case 'created':
            row.push(issue.fields.created ? new Date(issue.fields.created).toLocaleDateString() : '');
            break;
          case 'updated':
            row.push(issue.fields.updated ? new Date(issue.fields.updated).toLocaleDateString() : '');
            break;
          case 'description':
            row.push(issue.fields.description || '');
            break;
          case 'labels':
            row.push(issue.fields.labels ? issue.fields.labels.join(', ') : '');
            break;
          case 'fixVersions':
            row.push(issue.fields.fixVersions ? issue.fields.fixVersions.map((v) => v.name).join(', ') : '');
            break;
          case 'T-shirt size':
            row.push(issue.fields['T-shirt size'] || '');
            break;
          case 'groomingDeadline':
            row.push(issue.fields.groomingDeadline || '');
            break;
          case 'BAEffort':
            row.push(issue.fields.BAEffort || '');
            break;
          default:
            // Handle any other custom fields
            row.push(issue.fields[field] || '');
        }
      });
      excelData.push(row);
    });

    // Create Excel workbook
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'JIRA Issues');

    // Convert to buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `jira-export-${timestamp}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error in export handler:', error);
    return NextResponse.json(
      { message: `Export error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint only accepts POST requests. Send filter criteria in request body.' },
    { status: 405 }
  );
}