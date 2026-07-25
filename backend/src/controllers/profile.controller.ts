import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { profileService } from '../services/profile.service.js'

export const getProfileSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const summary = await profileService.getSummary(req.user!.id)

    res.json({
      success: true,
      data: summary,
    })
  }
)