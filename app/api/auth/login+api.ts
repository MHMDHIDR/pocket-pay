import { getDatabase } from '@/lib/mongodb';
import { verifyPassword, generateToken } from '@/lib/auth';
import { User, AuthResponse } from '@/types';

export async function POST(request: Request): Promise<Response> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({
        success: false,
        message: 'Missing email or password'
      } as AuthResponse, { status: 400 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Find user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return Response.json({
        success: false,
        message: 'Invalid credentials'
      } as AuthResponse, { status: 401 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password!);
    if (!isValidPassword) {
      return Response.json({
        success: false,
        message: 'Invalid credentials'
      } as AuthResponse, { status: 401 });
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
    console.error('Login error:', error);
    return Response.json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse, { status: 500 });
  }
}