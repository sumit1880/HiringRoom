import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
export async function registerUser(data) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (existingUser) {
        throw new ApiError(409, "Email already registered");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
        },
    });
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
}
import { generateToken } from "../utils/jwt.js";
export async function loginUser(data) {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }
    const token = generateToken({
        userId: user.id,
        email: user.email,
    });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}
