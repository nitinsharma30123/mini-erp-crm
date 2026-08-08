import { Router } from "express";
import { login } from "../controllers/authController";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = Router();

router.post("/login", login);

router.get("/me", authenticateToken, (req: AuthRequest, res) => {
  res.json({
    message: "Authentication successful",
    user: req.user,
  });
});

router.get(
  "/admin-test",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      message: "Admin access granted",
      user: req.user,
    });
  }
);

export default router;