import { Request, Response } from 'express';
import { loginLocalUser } from './service';
import { sendResponse } from '@/shared/functions';

export const login = async (req: Request, res: Response) => {
  const { token, user } = await loginLocalUser(req.body);
  sendResponse({
    res,
    status: "success",
    statusCode: 200,
    message: "Login successful",
    data: [{ token, user }],
  });
};

export const register = async (req: Request, res: Response) => {
  sendResponse({
    res,
    status: "success",
    statusCode: 201,
    message: "Registration successful",
  });
}

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query as { token: string }; // Assuming token is passed as a query parameter
  // Verify the token and update the user's email verification status in the database 
  // This part is not implemented in the original code, so you can add your logic here
  // For example, you can decode the token and find the user in the database to update their emailVerified status
}
