import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function validateRequest(
  req: NextRequest,
  handler: (userId: string, req: NextRequest) => Promise<NextResponse>
) {
  try {
    const session = await auth();
    
    if (!session.userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    return await handler(session.userId, req);
  } catch (error) {
    console.error('Authentication error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}

export function withAuth(handler: (userId: string, req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => validateRequest(req, handler);
}
