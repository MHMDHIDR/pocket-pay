import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { User, ApiResponse } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: Request): Promise<Response> {
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

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return Response.json({
        success: false,
        message: 'User not found'
      } as ApiResponse, { status: 404 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      data: { ...userWithoutPassword, id: user._id.toString() }
    } as ApiResponse);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return Response.json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse, { status: 500 });
  }
}