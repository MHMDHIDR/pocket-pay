import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Transaction, User, ApiResponse } from '@/types';
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

    const transactionData = await request.json();
    const { type, amount, recipientEmail, description } = transactionData;

    if (!type || !amount || amount <= 0) {
      return Response.json({
        success: false,
        message: 'Invalid transaction data'
      } as ApiResponse, { status: 400 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const transactionsCollection = db.collection<Transaction>('transactions');

    // Get sender user
    const sender = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!sender) {
      return Response.json({
        success: false,
        message: 'User not found'
      } as ApiResponse, { status: 404 });
    }

    if (type === 'send') {
      // Validate recipient exists
      if (!recipientEmail) {
        return Response.json({
          success: false,
          message: 'Recipient email required'
        } as ApiResponse, { status: 400 });
      }

      const recipient = await usersCollection.findOne({ email: recipientEmail });
      if (!recipient) {
        return Response.json({
          success: false,
          message: 'Recipient not found'
        } as ApiResponse, { status: 404 });
      }

      // Check sender balance
      if (sender.balance < amount) {
        return Response.json({
          success: false,
          message: 'Insufficient balance'
        } as ApiResponse, { status: 400 });
      }

      // Update balances
      await usersCollection.updateOne(
        { _id: sender._id },
        { 
          $inc: { balance: -amount },
          $set: { updatedAt: new Date() }
        }
      );

      await usersCollection.updateOne(
        { _id: recipient._id },
        { 
          $inc: { balance: amount },
          $set: { updatedAt: new Date() }
        }
      );

      // Create transactions for both users
      const senderTransaction: Omit<Transaction, '_id'> = {
        type: 'send',
        amount,
        senderEmail: sender.email,
        recipientEmail,
        description,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const recipientTransaction: Omit<Transaction, '_id'> = {
        type: 'receive',
        amount,
        senderEmail: sender.email,
        recipientEmail,
        description,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await transactionsCollection.insertMany([senderTransaction, recipientTransaction]);

    } else if (type === 'charge') {
      // Update sender balance
      await usersCollection.updateOne(
        { _id: sender._id },
        { 
          $inc: { balance: amount },
          $set: { updatedAt: new Date() }
        }
      );

      // Create charge transaction
      const chargeTransaction: Omit<Transaction, '_id'> = {
        type: 'charge',
        amount,
        senderEmail: sender.email,
        description: description || 'Added funds',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await transactionsCollection.insertOne(chargeTransaction);
    }

    return Response.json({
      success: true,
      message: 'Transaction completed successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Transaction error:', error);
    return Response.json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse, { status: 500 });
  }
}