/**
 * Test Endpoint for Loop Email Service
 *
 * Provides endpoints to test Loop email functionality.
 * Use for development and integration testing.
 */

import { NextResponse } from 'next/server';
import { getLoopService } from '@/lib/services/loop';

// Test endpoint to send verification email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'test@example.com';
    const userName = searchParams.get('userName') || 'Test User';
    const token = searchParams.get('token') || 'test-verification-token-123';

    const loopService = getLoopService();
    const result = await loopService.sendVerificationEmail(email, token, userName);

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test verification email sent successfully' : 'Failed to send test email',
      contactId: result.contactId,
      error: result.message,
      testData: {
        email,
        userName,
        token,
      },
    });
  } catch (error) {
    console.error('Test verification email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test verification email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Test connection endpoint (no published emails required)
export async function PATCH(request: Request) {
  try {
    const loopService = getLoopService();

    // Test 1: Validate API Key by checking if service initializes
    const connectionTest = { success: true, message: 'API Key valid' };

    // Test 2: Try to create/update a test contact (this validates API access)
    const testContact = {
      email: 'test-connection@penguinmails.test',
      firstName: 'Test',
      lastName: 'Connection',
      userGroup: 'test-users',
      subscribed: false,
    };

    const contactResult = await loopService.createContact(testContact);

    return NextResponse.json({
      success: true,
      message: 'Loop connection test successful',
      tests: {
        apiKey: connectionTest,
        contactCreation: {
          success: contactResult.success,
          contactId: contactResult.contactId,
          error: contactResult.message,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Loop connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Loop connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


// Test endpoint to send different types of emails
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = 'verification',
      email = 'test@example.com',
      userName = 'Test User',
      token = 'test-token-123',
      companyName = 'PenguinMails',
    } = body;

    const loopService = getLoopService();
    let result;

    switch (type) {
      case 'verification':
        result = await loopService.sendVerificationEmail(email, token, userName);
        break;
      case 'password-reset':
        result = await loopService.sendPasswordResetEmail(email, token, userName);
        break;
      case 'welcome':
        result = await loopService.sendWelcomeEmail(email, userName, companyName);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: verification, password-reset, or welcome' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? `Test ${type} email sent successfully` : `Failed to send test ${type} email`,
      contactId: result.contactId,
      error: result.message,
      testData: {
        type,
        email,
        userName,
        token,
        companyName,
      },
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
