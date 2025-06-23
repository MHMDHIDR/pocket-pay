import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Transaction, User, ApiResponse } from '@/types';
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
    const transactionsCollection = db.collection<Transaction>('transactions');

    // Get user to find their email
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return Response.json({
        success: false,
        message: 'User not found'
      } as ApiResponse, { status: 404 });
    }

    // Get transactions where user is sender or recipient
    const transactions = await transactionsCollection
      .find({
        $or: [
          { senderEmail: user.email },
          { recipientEmail: user.email }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Transform transactions to include id field
    const transformedTransactions = transactions.map(transaction => ({
      ...transaction,
      id: transaction._id?.toString(),
      timestamp: transaction.createdAt
    }));

    return Response.json({
      success: true,
      data: transformedTransactions
    } as ApiResponse);

  } catch (error) {
    console.error('Transaction history error:', error);
    return Response.json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse, { status: 500 });
  }
}