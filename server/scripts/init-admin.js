#!/usr/bin/env node

// =============================================================================
// Initialize Super Admin User
// Run: npm run init:admin
// =============================================================================

import readline from "readline";
import bcrypt from "bcrypt";
import { prisma } from "./src/config/db.config.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function initAdmin() {
  console.log("\n📋 Clinic Management System - Super Admin Initialization\n");

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.superAdmin.findFirst();
    if (existingAdmin) {
      console.log("⚠️  Super admin already exists!");
      process.exit(0);
    }

    const email = await question("📧 Super Admin Email: ");
    const name = await question("👤 Super Admin Name: ");
    const password = await question("🔐 Password (min 8 chars): ");

    // Validate
    if (!email || !name || !password) {
      console.log("❌ All fields are required");
      process.exit(1);
    }

    if (password.length < 8) {
      console.log("❌ Password must be at least 8 characters");
      process.exit(1);
    }

    if (!email.includes("@")) {
      console.log("❌ Invalid email format");
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin
    const admin = await prisma.superAdmin.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    console.log("\n✅ Super Admin Created Successfully!\n");
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log(`ID: ${admin.id}\n`);
    console.log("💡 Use these credentials to login at /api/auth/login\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

initAdmin();
