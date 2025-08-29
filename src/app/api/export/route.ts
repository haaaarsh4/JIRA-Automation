import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import JiraClient from 'jira-client';

// Type definitions
interface ExportRequestBody {
  project?: string;
  status?: string;
  assignee?: string;
  labels?: string;
  fixVersion?: string;
  issueType?: string;
  priority?: string;
  customJQL?: string;
  fields?: string[];
}

interface JiraIssue {
  key: string;
  fields: {
    summary?: string;
    status?: { name: string };
    assignee?: { displayName: string };
    priority?: { name: string };
    created?: string;
    updated?: string;
    description?: string;
    labels?: string[];
    fixVersions?: Array<{ name: string }>;
    issuetype?: { name: string };
    [key: string]: any; // For custom fields
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('Export request received');

    const body: ExportRequestBody = await request.json();
    const { 
      project, 
      status, 
      assignee, 
      labels, 
      fixVersion, 
      issueType,
      priority,
      customJQL,  // For advanced users who want to write their own JQL
      fields = ['key', 'summary', 'status', 'assignee', 'priority', 'created', 'updated'] // Default fields to export
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
      // Build JQL from filters
      if (project) conditions.push(`project = "${project}"`);
      if (status) conditions.push(`status = "${status}"`);
      if (assignee) conditions.push(`assignee = "${assignee}"`);
      if (labels) conditions.push(`labels = "${labels}"`);
      if (fixVersion) conditions.push(`fixVersion = "${fixVersion}"`);
      if (issueType) conditions.push(`issuetype = "${issueType}"`);
      if (priority) conditions.push(`priority = "${priority}"`);
      
      jqlQuery = conditions.join(' AND ');
    }

    if (!jqlQuery) {
      return NextResponse.json(
        { message: 'No search criteria provided' },
        { status: 400 }
      );
    }

    console.log('Executing JQL query:', jqlQuery);

    // Search JIRA issues
    const searchResults = await jira.searchJira(jqlQuery, {
      startAt: 0,
      maxResults: 1000, // Adjust as needed
      fields: fields,
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
    
    // Create header row
    const headers: string[] = [];
    fields.forEach((field: string) => {
      switch (field) {
        case 'key':
          headers.push('Issue Key');
          break;
        case 'summary':
          headers.push('Summary');
          break;
        case 'status':
          headers.push('Status');
          break;
        case 'assignee':
          headers.push('Assignee');
          break;
        case 'priority':
          headers.push('Priority');
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
          headers.push('Fix Version');
          break;
        case 'issuetype':
          headers.push('Issue Type');
          break;
        default:
          headers.push(field); // For custom fields
      }
    });
    excelData.push(headers);

    // Add data rows
    searchResults.issues.forEach((issue: JiraIssue) => {
      const row: (string | number)[] = [];
      fields.forEach((field: string) => {
        switch (field) {
          case 'key':
            row.push(issue.key);
            break;
          case 'summary':
            row.push(issue.fields.summary || '');
            break;
          case 'status':
            row.push(issue.fields.status?.name || '');
            break;
          case 'assignee':
            row.push(issue.fields.assignee?.displayName || 'Unassigned');
            break;
          case 'priority':
            row.push(issue.fields.priority?.name || '');
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
          case 'issuetype':
            row.push(issue.fields.issuetype?.name || '');
            break;
          default:
            // Handle custom fields
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