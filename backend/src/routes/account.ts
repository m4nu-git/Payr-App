import { Router, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware";
import { Account, Transaction, User } from "../db";


const router = Router();

const transferSchema = z.object({
  to: z.string().min(1, "Recipient userId is required"),
  amount: z.number().positive("Amount must be positive"),
  note: z.string().max(100).optional()
});

// GET /account/balance (protected)
router.get("/balance", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const account = await Account.findOne({ userId: req.userId });
    if (!account) {
      res.status(404).json({ message: "Account not found" });
      return;
    }
    res.json({ balance: account.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// POST /account/transfer (protected)
router.post("/transfer", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = transferSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
    return;
  }

  const { to, amount, note } = parsed.data;

  if (to === req.userId) {
    res.status(400).json({ message: "Cannot transfer to yourself" });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const senderAccount = await Account.findOne({ userId: req.userId }).session(session);
    if (!senderAccount) {
      await session.abortTransaction();
      res.status(404).json({ message: "Sender account not found" });
      return;
    }

    if (senderAccount.balance < amount) {
      await session.abortTransaction();
      res.status(400).json({ message: "Insufficient balance" });
      return;
    }

    const recipientUser = await User.findById(to).session(session);
    if (!recipientUser) {
      await session.abortTransaction();
      res.status(404).json({ message: "Recipient user not found" });
      return;
    }

    const recipientAccount = await Account.findOne({ userId: to }).session(session);
    if (!recipientAccount) {
      await session.abortTransaction();
      res.status(404).json({ message: "Recipient account not found" });
      return;
    }

    // Perform transfer atomically
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();

    const tx = await Transaction.create({
      senderId: req.userId,
      receiverId: to,
      amount,
      note: note || "",
      status: "success"
    })

    const updatedSender = await Account.findOne({ userId: req.userId });
    res.json({
      message: "Transfer successful",
      newBalance: updatedSender?.balance,
      transferredTo: `${recipientUser.firstName} ${recipientUser.lastName}`,
      amount,
      transactionId: tx._id,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: "Transfer failed", error: err });
  } finally {
    session.endSession();
  }
});

//GET /account/history (protected)
router.get("/history", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const type  = (req.query.type as string) || "all";
  const skip  = (page - 1) * limit;
 
  try {
    let filter: Record<string, unknown> = {};
    if      (type === "sent")     filter = { senderId:   req.userId };
    else if (type === "received") filter = { receiverId: req.userId };
    else filter = { $or: [{ senderId: req.userId }, { receiverId: req.userId }] };
 
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId",   "firstName lastName username")
        .populate("receiverId", "firstName lastName username")
        .lean(),
      Transaction.countDocuments(filter),
    ]);
 
    const shaped = transactions.map((tx: any) => {
      const isSent = tx.senderId._id.toString() === req.userId;
      return {
        id:           tx._id,
        type:         isSent ? "sent" : "received",
        amount:       tx.amount,
        note:         tx.note,
        status:       tx.status,
        createdAt:    tx.createdAt,
        counterparty: isSent ? tx.receiverId : tx.senderId,
      };
    });
 
    res.json({
      transactions: shaped,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext:    page < Math.ceil(total / limit),
        hasPrev:    page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

export default router;