import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { asyncHandler, sendResponse, sendPaginatedResponse } from '../utils/response';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    sendResponse(res, 201, result, 'User registered successfully');
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendResponse(res, 200, result, 'Login successful');
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await authService.getProfile(userId);
    sendResponse(res, 200, user);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await authService.updateProfile(userId, req.body);
    sendResponse(res, 200, user, 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await authService.changePassword(userId, req.body);
    sendResponse(res, 200, result);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const tokens = await authService.refreshToken(userId);
    sendResponse(res, 200, tokens, 'Token refreshed successfully');
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const result = await authService.getAllUsers(page, pageSize);
    sendPaginatedResponse(res, result.data, result.page, result.pageSize, result.total);
  });

  updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;
    const user = await authService.updateUserRole(userId, role);
    sendResponse(res, 200, user, 'User role updated successfully');
  });

  deactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await authService.deactivateUser(userId);
    sendResponse(res, 200, user, 'User deactivated successfully');
  });
}

export default new AuthController();