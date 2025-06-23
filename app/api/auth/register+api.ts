import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { User, AuthResponse } from '@/types';

export async function POST(request: Request): Promise<Response> {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return Response.json({
        success: false,
        message: 'Missing required fields'
      } as AuthResponse, { status: 400 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return Response.json({
        success: false,
        message: 'User already exists'
      } as AuthResponse, { status: 400 });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser: Omit<User, '_id'> = {
      email,
      name,
      password: hashedPassword,
      balance: 100.00, // Starting balance
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    const user = await usersCollection.findOne({ _id: result.insertedId });

    if (!user) {
      return Response.json({
        success: false,
        message: 'Failed to create user'
      } as AuthResponse, { status: 500 });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      user: { ...userWithoutPassword, id: user._id.toString() },
      token
    } as AuthResponse);

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse, { status: 500 });
  }
}