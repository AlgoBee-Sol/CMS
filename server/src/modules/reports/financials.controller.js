// =============================================================================
// Financials Controller
// Super Admin financials and analytics
// =============================================================================

import { prisma } from "../../config/db.config.js";

/**
 * Get total revenue by month
 * Aggregates all platform payments
 */
export async function getMonthlyRevenue(req, res) {
  const { year = new Date().getFullYear() } = req.query;

  const yearNum = parseInt(year, 10);

  // Get payments grouped by month
  const payments = await prisma.platformPayment.findMany({
    where: {
      paymentDate: {
        gte: new Date(`${yearNum}-01-01`),
        lt: new Date(`${yearNum + 1}-01-01`),
      },
    },
  });

  // Group by month
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(yearNum, i).toLocaleString("en-US", { month: "long" }),
    monthNum: i + 1,
    revenue: 0,
  }));

  payments.forEach((payment) => {
    const monthIndex = payment.paymentDate.getMonth();
    monthlyData[monthIndex].revenue += payment.amount;
  });

  return res.json({
    success: true,
    data: {
      year: yearNum,
      monthlyRevenue: monthlyData,
      totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
    },
  });
}

/**
 * Get yearly revenue
 * Compares current year with previous year
 */
export async function getYearlyRevenue(req, res) {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // Fetch payments for both years
  const [currentYearPayments, previousYearPayments] = await Promise.all([
    prisma.platformPayment.findMany({
      where: {
        paymentDate: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    }),
    prisma.platformPayment.findMany({
      where: {
        paymentDate: {
          gte: new Date(`${previousYear}-01-01`),
          lt: new Date(`${previousYear + 1}-01-01`),
        },
      },
    }),
  ]);

  const currentTotal = currentYearPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const previousTotal = previousYearPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );

  const growth =
    previousTotal > 0
      ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(2)
      : 0;

  return res.json({
    success: true,
    data: {
      currentYear: {
        year: currentYear,
        revenue: currentTotal,
      },
      previousYear: {
        year: previousYear,
        revenue: previousTotal,
      },
      monthOverMonthGrowth: parseFloat(growth),
    },
  });
}

/**
 * Get subscription analytics
 * Includes active, expiring, and overdue subscriptions
 */
export async function getSubscriptionAnalytics(req, res) {
  const now = new Date();
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Get subscriptions by status
  const subscriptions = await prisma.subscription.findMany({
    include: {
      clinic: { select: { id: true, code: true, name: true } },
    },
  });

  const analytics = {
    active: [],
    trial: [],
    ended: [],
    expiringSoon: [],
    overdue: [],
  };

  subscriptions.forEach((sub) => {
    const basic = {
      clinicId: sub.clinicId,
      clinicCode: sub.clinic.code,
      clinicName: sub.clinic.name,
      planType: sub.planType,
      amount: sub.amount,
      startDate: sub.startDate,
      endDate: sub.endDate,
      autoRenew: sub.autoRenew,
    };

    if (sub.status === "Trial") {
      analytics.trial.push(basic);
    } else if (sub.status === "Active") {
      if (sub.endDate < now) {
        analytics.overdue.push(basic);
      } else if (sub.endDate <= thirtyDaysFromNow) {
        analytics.expiringSoon.push(basic);
      } else {
        analytics.active.push(basic);
      }
    } else if (sub.status === "Ended") {
      analytics.ended.push(basic);
    }
  });

  return res.json({
    success: true,
    data: {
      summary: {
        totalActive: analytics.active.length,
        totalTrial: analytics.trial.length,
        totalEnded: analytics.ended.length,
        expiringSoon: analytics.expiringSoon.length,
        overdue: analytics.overdue.length,
      },
      subscriptions: analytics,
    },
  });
}

/**
 * Get clinic payment history
 */
export async function getClinicPaymentHistory(req, res) {
  const { clinicId } = req.params;
  const { page = "1", limit = "20" } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * pageSize;

  // Verify clinic exists
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) {
    return res.status(404).json({
      success: false,
      error: "Clinic not found",
    });
  }

  // Fetch payments
  const [payments, total] = await Promise.all([
    prisma.platformPayment.findMany({
      where: { clinicId },
      include: {
        loggedBySuperAdmin: { select: { name: true, email: true } },
      },
      skip,
      take: pageSize,
      orderBy: { paymentDate: "desc" },
    }),
    prisma.platformPayment.count({ where: { clinicId } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return res.json({
    success: true,
    data: {
      clinic: { id: clinic.id, code: clinic.code, name: clinic.name },
      payments,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
      },
    },
  });
}

/**
 * Record a platform payment
 */
export async function recordPayment(req, res) {
  const { clinicId, amount, paymentMethod, description } = req.body;
  const { userId: superAdminId } = req.user;

  if (!clinicId || !amount || !paymentMethod) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
    });
  }

  // Verify clinic exists
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) {
    return res.status(404).json({
      success: false,
      error: "Clinic not found",
    });
  }

  const payment = await prisma.platformPayment.create({
    data: {
      clinicId,
      amount,
      paymentMethod,
      description: description || null,
      loggedBySuperAdminId: superAdminId,
    },
    include: {
      clinic: { select: { code: true, name: true } },
    },
  });

  return res.status(201).json({
    success: true,
    data: { payment },
  });
}

/**
 * Get dashboard summary for super admin
 */
export async function getDashboardSummary(req, res) {
  const now = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Total clinics
  const totalClinics = await prisma.clinic.count({
    where: { isDeleted: false },
  });

  // Active subscriptions
  const activeSubscriptions = await prisma.subscription.count({
    where: { status: "Active", endDate: { gt: now } },
  });

  // Trial subscriptions
  const trialSubscriptions = await prisma.subscription.count({
    where: { status: "Trial" },
  });

  // Revenue last 30 days
  const recentPayments = await prisma.platformPayment.findMany({
    where: { paymentDate: { gte: thirtyDaysAgo } },
  });

  const revenue30Days = recentPayments.reduce((sum, p) => sum + p.amount, 0);

  // Total revenue
  const allPayments = await prisma.platformPayment.findMany();
  const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

  // Expiring soon
  const expiringSoon = await prisma.subscription.count({
    where: {
      status: "Active",
      endDate: {
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        gt: now,
      },
    },
  });

  return res.json({
    success: true,
    data: {
      summary: {
        totalClinics,
        activeSubscriptions,
        trialSubscriptions,
        expiringSoon,
        revenue30Days,
        totalRevenue,
      },
    },
  });
}

/**
 * Get all platform payments (global payment history)
 * Super Admin endpoint with filtering and pagination
 */
export async function getPayments(req, res) {
  const { page = "1", limit = "20", clinicId, paymentMethod, startDate, endDate } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * pageSize;

  const where = {};

  if (clinicId) {
    where.clinicId = clinicId;
  }

  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  if (startDate || endDate) {
    where.paymentDate = {};
    if (startDate) {
      where.paymentDate.gte = new Date(startDate);
    }
    if (endDate) {
      // Set to end of the day if it's just a date string
      const end = new Date(endDate);
      if (!endDate.includes("T")) {
        end.setHours(23, 59, 59, 999);
      }
      where.paymentDate.lte = end;
    }
  }

  const [payments, total] = await Promise.all([
    prisma.platformPayment.findMany({
      where,
      include: {
        clinic: { select: { id: true, name: true, code: true } },
        loggedBySuperAdmin: { select: { id: true, name: true, email: true } },
      },
      skip,
      take: pageSize,
      orderBy: { paymentDate: "desc" },
    }),
    prisma.platformPayment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return res.json({
    success: true,
    data: {
      payments,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
      },
    },
  });
}
