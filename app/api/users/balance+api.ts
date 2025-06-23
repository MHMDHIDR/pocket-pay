import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { User, ApiResponse } from '@/types';
import { ObjectId } from 'mongodb';

export async function POST(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({
        success: false,
        message: 'Unauthorized'
      } as ApiResponse, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({
        success: false,
        message: 'Invalid token'
      } as ApiResponse, { status: 401 });
    }

    const { amount } = await request.json();
    if (typeof amount !== 'number') {
      return Response.json({
        success: false,
        message: 'Invalid amount'
      } as ApiResponse, { status: 400 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $inc: { balance: amount },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({
        success: false,
        message: 'User not found'
      } as ApiResponse, { status: 404 });
    }

    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });

    return Response.json({
      success: true,
      data: { balance: updatedUser?.balance }
    } as ApiResponse);

  } catch (error) {
    console.error('Balance update error:', error);
    return Response.json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse, { status: 500 });
  }
}