import { Router } from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { getProfileSummary } from '../controllers/profile.controller.js'

const router = Router()

router.get('/summary', protect, getProfileSummary)

export default router