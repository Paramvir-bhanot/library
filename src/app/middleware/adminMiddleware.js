import jwt from 'jsonwebtoken';
import Admin from '../../models/admin.js';
import connectDB from '../../lib/DBconnection.js';
import { NextResponse } from 'next/server';

export const protect = async (req) => {
  let token;

  
  // Use the correct method to get headers in Next.js App Router
  const authHeader = req.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      
      
      if (!process.env.JWT_SECRET) {
        
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
     
      
      await connectDB();
      const admin = await Admin.findById(decoded.id).select('-password');
     
      
      if (!admin) {
        return NextResponse.json({ error: 'Not authorized, admin not found' }, { status: 401 });
      }
      return admin;
    } catch (error) {
     
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json({ error: 'Not authorized, invalid token' }, { status: 401 });
      } else if (error.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Not authorized, token expired' }, { status: 401 });
      } else {
        return NextResponse.json({ error: 'Not authorized, token failed' }, { status: 401 });
      }
    }
  } else {
   
    return NextResponse.json({ error: 'Not authorized, no token provided' }, { status: 401 });
  }
};