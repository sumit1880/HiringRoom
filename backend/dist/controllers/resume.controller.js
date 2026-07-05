import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadResume, getUserResumes, getResumeById, deleteResume, } from "../services/resume.service.js";
export const upload = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    if (!req.file) {
        throw new ApiError(400, "Please upload a PDF resume");
    }
    const resume = await uploadResume(req.user.id, req.file);
    res.status(201).json({
        success: true,
        message: "Resume uploaded successfully",
        data: resume,
    });
});
export const getAll = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    const resumes = await getUserResumes(req.user.id);
    res.status(200).json({
        success: true,
        data: resumes,
    });
});
export const getOne = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    const resume = await getResumeById(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        data: resume,
    });
});
export const remove = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    await deleteResume(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Resume deleted successfully",
    });
});
