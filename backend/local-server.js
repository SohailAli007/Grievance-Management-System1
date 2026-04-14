import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
process.env.USER_TABLE = process.env.USER_TABLE || "users";
process.env.COMPLAINT_TABLE = process.env.COMPLAINT_TABLE || "complaints";
import { ddb } from "./Shared/db.js";
import { User, Department, Complaint, Citizen, Officer, Admin, Role, Notification, Assignment, ComplaintLog, Team, Category, Feedback, Verification, SystemAudit } from "./Shared/models.js";
// System Version: 1.0.2 - RESTART REQUIRED - Complaint Logic Sync


const seed = async (email, role, name, phone, departmentName = null, teamName = null) => {
  const hashedPass = await bcrypt.hash("password", 10);
  let department = null;
  if (departmentName) {
    department = await Department.findOne({ name: departmentName });
  }

  const userData = {
    name,
    phone,
    password: hashedPass,
    role,
    departmentId: department?._id || null,
    departmentName: department?.name || null,
    teamName
  };

  // Ensure we don't return early if they exist, but update them.
  const user = await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { userId: `${role.toLowerCase()}-${Date.now()}` }, $set: userData },
    { upsert: true, new: true }
  );

  // Sync role-specific tables
  if (role === "CITIZEN") await Citizen.findOneAndUpdate({ email }, { $set: { ...userData, userId: user.userId } }, { upsert: true });
  if (role === "OFFICER") await Officer.findOneAndUpdate({ email }, { $set: { ...userData, userId: user.userId } }, { upsert: true });
  if (role === "ADMIN") await Admin.findOneAndUpdate({ email }, { $set: { ...userData, userId: user.userId } }, { upsert: true });

  return user;
};


const seedAllData = async () => {
  console.log("Seeding Roles...");


  const roles = [
    { name: "ADMIN", level: 1, description: "Administrator" },
    { name: "OFFICER", level: 2, description: "Officer" },
    { name: "CITIZEN", level: 3, description: "Public user" }
  ];

  for (const r of roles) {
    await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true });
  }

  console.log("Seeding Departments...");
  const departments = [
    { name: "Public Works", description: "Roads, building, bridges, and infrastructure", slaHours: 48 },
    { name: "Water Supply and Drainage", description: "Water supply, leakage, and drainage systems", slaHours: 24 },
    { name: "Electricity and Safety", description: "Power supply, street lights, and electrical safety", slaHours: 12 },
    { name: "Sanitation and Public Health", description: "Garbage, cleaning, and public health issues", slaHours: 24 },
    { name: "Environment and Public Property", description: "Trees, parks, and public property maintenance", slaHours: 72 },
    { name: "Traffic and Public Safety", description: "Traffic signals, signs, and road safety", slaHours: 24 },
    { name: "Civic Control", description: "Nuisance, encroachments, and unauthorized activities", slaHours: 48 }
  ];

  for (const d of departments) {
    await Department.findOneAndUpdate({ name: d.name }, d, { upsert: true });
  }

  console.log("Seeding Accounts...");
  await seed("admin@demo.com", "ADMIN", "System Admin", "0000000000");
  await seed("officer.pw@demo.com", "OFFICER", "PW Officer", "1110001110", "Public Works");
  await seed("officer@demo.com", "OFFICER", "General Officer", "9998887770", "Public Works");
  await seed("officer.water@demo.com", "OFFICER", "Water Officer", "2220002220", "Water Supply and Drainage");

  await seed("officer.elec@demo.com", "OFFICER", "Electric Officer", "3330003330", "Electricity and Safety");
  await seed("officer.sanitation@demo.com", "OFFICER", "Sanitation Officer", "4440004440", "Sanitation and Public Health");
  await seed("officer.env@demo.com", "OFFICER", "Environment Officer", "5550005550", "Environment and Public Property");
  await seed("officer.traffic@demo.com", "OFFICER", "Traffic Officer", "6660006660", "Traffic and Public Safety");
  await seed("officer.civic@demo.com", "OFFICER", "Civic Control Officer", "7770007770", "Civic Control");
  await seed("citizen@demo.com", "CITIZEN", "Default Citizen", "1234567890");

  console.log("Seeding Teams...");
  const teams = [
    { name: "Team Roads", description: "Road repair team" },
    { name: "Team Water", description: "Pipeline repair team" },
    { name: "Team Electric", description: "Power maintenance team" }
  ];

  for (const t of teams) {
    let deptName = "Public Works";
    if (t.name === "Team Water") deptName = "Water Supply and Drainage";
    if (t.name === "Team Electric") deptName = "Electricity and Safety";

    const dept = await Department.findOne({ name: deptName });
    await Team.findOneAndUpdate(
      { name: t.name },
      { ...t, leaderId: null, departmentId: dept?._id },
      { upsert: true }
    );
  }

  console.log("Seeding Categories...");
  const categoryMap = [
    { name: "Potholes / Road damage", dept: "Public Works", priority: "HIGH" },
    { name: "Dugged holes after work", dept: "Public Works", priority: "MEDIUM" },
    { name: "Broken footpath", dept: "Public Works", priority: "LOW" },
    { name: "Damaged divider", dept: "Public Works", priority: "MEDIUM" },
    { name: "Illegal speed breakers", dept: "Public Works", priority: "MEDIUM" },
    { name: "Broken manhole cover", dept: "Public Works", priority: "HIGH" },
    { name: "Road sinking", dept: "Public Works", priority: "HIGH" },
    { name: "Construction debris on road", dept: "Public Works", priority: "LOW" },
    { name: "Damaged bridge / culvert", dept: "Public Works", priority: "HIGH" },
    { name: "Water leakage pipeline", dept: "Water Supply and Drainage", priority: "HIGH" },
    { name: "No water supply", dept: "Water Supply and Drainage", priority: "HIGH" },
    { name: "Low water pressure", dept: "Water Supply and Drainage", priority: "MEDIUM" },
    { name: "Dirty water supply", dept: "Water Supply and Drainage", priority: "HIGH" },
    { name: "Drain blockage", dept: "Water Supply and Drainage", priority: "HIGH" },
    { name: "Sewer overflow", dept: "Water Supply and Drainage", priority: "HIGH" },
    { name: "Open drainage", dept: "Water Supply and Drainage", priority: "HIGH" },
    { name: "Water logging", dept: "Water Supply and Drainage", priority: "MEDIUM" },
    { name: "Broken drainage cover", dept: "Water Supply and Drainage", priority: "HIGH" },
    { name: "Borewell malfunction", dept: "Water Supply and Drainage", priority: "MEDIUM" },
    { name: "Street light not working", dept: "Electricity and Safety", priority: "MEDIUM" },
    { name: "Hanging electric wires", dept: "Electricity and Safety", priority: "HIGH" },
    { name: "Electric pole damaged", dept: "Electricity and Safety", priority: "HIGH" },
    { name: "Spark from transformer", dept: "Electricity and Safety", priority: "HIGH" },
    { name: "Open electric box", dept: "Electricity and Safety", priority: "HIGH" },
    { name: "Cable fallen on road", dept: "Electricity and Safety", priority: "HIGH" },
    { name: "Power fluctuation", dept: "Electricity and Safety", priority: "MEDIUM" },
    { name: "Transformer overheating", dept: "Electricity and Safety", priority: "HIGH" },
    { name: "Garbage not collected", dept: "Sanitation and Public Health", priority: "HIGH" },
    { name: "Overflowing dustbin", dept: "Sanitation and Public Health", priority: "MEDIUM" },
    { name: "Dead animal on road", dept: "Sanitation and Public Health", priority: "HIGH" },
    { name: "Mosquito breeding water", dept: "Sanitation and Public Health", priority: "HIGH" },
    { name: "Public toilet dirty", dept: "Sanitation and Public Health", priority: "MEDIUM" },
    { name: "Sweeping not done", dept: "Sanitation and Public Health", priority: "LOW" },
    { name: "Waste dumping in open area", dept: "Sanitation and Public Health", priority: "MEDIUM" },
    { name: "Bad smell / sewage smell", dept: "Sanitation and Public Health", priority: "MEDIUM" },
    { name: "Tree fallen / dangerous tree", dept: "Environment and Public Property", priority: "HIGH" },
    { name: "Tree cutting complaint", dept: "Environment and Public Property", priority: "MEDIUM" },
    { name: "Park maintenance issue", dept: "Environment and Public Property", priority: "LOW" },
    { name: "Broken benches", dept: "Environment and Public Property", priority: "LOW" },
    { name: "Encroachment on public land", dept: "Environment and Public Property", priority: "HIGH" },
    { name: "Damaged public wall/property", dept: "Environment and Public Property", priority: "MEDIUM" },
    { name: "Signal not working", dept: "Traffic and Public Safety", priority: "HIGH" },
    { name: "Missing road sign", dept: "Traffic and Public Safety", priority: "MEDIUM" },
    { name: "Zebra crossing faded", dept: "Traffic and Public Safety", priority: "LOW" },
    { name: "Illegal parking", dept: "Traffic and Public Safety", priority: "MEDIUM" },
    { name: "Accident-prone area request", dept: "Traffic and Public Safety", priority: "MEDIUM" },
    { name: "School zone safety issue", dept: "Traffic and Public Safety", priority: "HIGH" },
    { name: "Stray animals", dept: "Civic Control", priority: "MEDIUM" },
    { name: "Noise pollution", dept: "Civic Control", priority: "MEDIUM" },
    { name: "Water tanker complaint", dept: "Civic Control", priority: "MEDIUM" },
    { name: "Street vendor obstruction", dept: "Civic Control", priority: "LOW" },
    { name: "Unauthorized construction", dept: "Civic Control", priority: "HIGH" }
  ];

  for (const cat of categoryMap) {
    const dept = await Department.findOne({ name: cat.dept });
    if (dept) {
      await Category.findOneAndUpdate(
        { name: cat.name, departmentId: dept._id },
        { name: cat.name, departmentId: dept._id, priority: cat.priority },
        { upsert: true }
      );
    }
  }

  console.log("Seeding initial logs/notifs...");
  const admin = await User.findOne({ role: "ADMIN" });
  if (admin) {
    const logCount = await ComplaintLog.countDocuments();
    if (logCount === 0) {
      await ComplaintLog.create({
        complaintId: new mongoose.Types.ObjectId(),
        status: "PENDING",
        updatedBy: admin.userId,
        message: "System logs initialized."
      });
    }

    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.create({
        userId: admin._id,
        title: "System Ready",
        message: "Welcome to the modernized GMS System.",
        read: false
      });
    }
  }
};



const startup = async () => {
  console.log("Starting GMS Backend Initialization...");
  try {
    // Wait for Mongoose to be ready (readyState 1 = connected)
    for (let i = 0; i < 10; i++) {
      if (mongoose.connection.readyState === 1) break;
      console.log(`Waiting for MongoDB... (Attempt ${i + 1}/10)`);
      await new Promise(r => setTimeout(r, 1000));
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error("Could not connect to MongoDB after 10 seconds.");
    }

    console.log("MongoDB Connected. Running Seeder...");
    await seedAllData();
    console.log("✓ System initialized successfully.");

  } catch (err) {
    console.error("Critical Startup Error:", err);
  }
};

startup();


const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const sseClients = new Set();
const broadcast = (event, data) => {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
};

const getAuthToken = (req) => {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth) return null;
  return auth.replace("Bearer ", "");
};

const invokeLambda = async (lambdaModulePath, req, extraEvent = {}) => {
  try {
    const mod = await import(lambdaModulePath);

    const event = {
      headers: req.headers,
      body: req.body ? JSON.stringify(req.body) : null,
      queryStringParameters: req.query,
      httpMethod: req.method,
      path: req.path,
      ...extraEvent,
    };

    const result = await mod.handler(event);
    const statusCode = result?.statusCode ?? 200;
    const body = result?.body ? JSON.parse(result.body) : null;
    return { statusCode, body, headers: result?.headers };
  } catch (err) {
    console.error("invokeLambda error:", lambdaModulePath, err);
    return { statusCode: 500, body: { error: "Internal Server Error", details: err.message } };
  }
};

app.get("/health", (_req, res) => res.json({ ok: true }));

// Serve empty response for favicon requests to avoid 404 noise in browser devtools
app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);
  res.write(`event: ready\ndata: {}\n\n`);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

app.post("/api/register", async (req, res) => {
  const out = await invokeLambda("./Lambda/Auth/CreateUser.js", req);
  if (out.statusCode < 400) broadcast("user_created", out.body);
  res.status(out.statusCode).json(out.body);
});

app.get("/api/users/profile", async (req, res) => {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const jwt = (await import("jsonwebtoken")).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const out = await invokeLambda("./Lambda/users/getProfile.js", req, {
      user: decoded
    });
    res.status(out.statusCode).json(out.body);
  } catch (e) {
    res.status(401).json({ error: "Invalid Token" });
  }
});

app.patch("/api/users/profile", async (req, res) => {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  // Verify token to get userId
  try {
    const jwt = (await import("jsonwebtoken")).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pass user info to lambda
    const out = await invokeLambda("./Lambda/users/updateProfile.js", req, {
      user: decoded
    });

    if (out.statusCode === 200) {
      broadcast("profile_updated", { userId: decoded.userId, user: out.body.user });
    }

    res.status(out.statusCode).json(out.body);
  } catch (e) {
    res.status(401).json({ error: "Invalid Token" });
  }
});

app.post("/api/login", async (req, res) => {
  const out = await invokeLambda("./Lambda/Auth/loginUser.js", req);
  res.status(out.statusCode).json(out.body);
});

app.get("/api/verify", async (req, res) => {
  const out = await invokeLambda("./Lambda/Auth/verifyToken.js", req);
  res.status(out.statusCode).json(out.body);
});

app.post("/api/complaints", async (req, res) => {
  const out = await invokeLambda("./Lambda/fileComplaints.js", req);
  if (out.statusCode < 400) broadcast("complaint_created", out.body);
  res.status(out.statusCode).json(out.body);
});

app.get("/api/complaints/track", async (req, res) => {
  const out = await invokeLambda("./Lambda/trackComplaint.js", req);
  res.status(out.statusCode).json(out.body);
});

app.get("/api/complaints/my", async (req, res) => {
  const out = await invokeLambda("./Lambda/complaints/getMyComplaints.js", req);
  res.status(out.statusCode).json(out.body);
});

app.get("/api/complaints/assigned", async (req, res) => {
  const out = await invokeLambda("./Lambda/complaints/getAssignedComplaints.js", req);
  res.status(out.statusCode).json(out.body);
});

app.patch("/api/complaints/:complaintId/status", async (req, res) => {
  const out = await invokeLambda("./Lambda/complaints/updateComplaintStatus.js", req, {
    pathParameters: { complaintId: req.params.complaintId },
  });
  if (out.statusCode < 400) broadcast("complaint_updated", { complaintId: req.params.complaintId, ...out.body });
  res.status(out.statusCode).json(out.body);
});

app.get("/api/admin/users", async (req, res) => {
  const out = await invokeLambda("./Lambda/admin/getAllUsers.js", req);
  res.status(out.statusCode).json(out.body);
});

app.post("/api/admin/users", async (req, res) => {
  const out = await invokeLambda("./Lambda/admin/addStaff.js", req);
  res.status(out.statusCode).json(out.body);
});

app.get("/api/admin/complaints", async (req, res) => {
  const out = await invokeLambda("./Lambda/complaints/getAllComplaints.js", req);
  res.status(out.statusCode).json(out.body);
});

app.post("/api/admin/complaints/:complaintId/close", async (req, res) => {
  const out = await invokeLambda("./Lambda/complaints/closeComplaint.js", req, {
    pathParameters: { complaintId: req.params.complaintId },
  });
  if (out.statusCode < 400) broadcast("complaint_closed", { complaintId: req.params.complaintId });
  res.status(out.statusCode).json(out.body);
});

// Departments
app.get("/api/departments", async (req, res) => {
  const out = await invokeLambda("./Lambda/departments/getDepartments.js", req);
  res.status(out.statusCode).json(out.body);
});

// Categories
app.get("/api/categories", async (req, res) => {
  const out = await invokeLambda("./Lambda/categories/getCategories.js", req);
  res.status(out.statusCode).json(out.body);
});

app.get("/api/categories/:departmentId", async (req, res) => {
  const out = await invokeLambda("./Lambda/categories/getCategories.js", req, {
    queryStringParameters: { departmentId: req.params.departmentId },
  });
  res.status(out.statusCode).json(out.body);
});

// Teams
app.get("/api/teams", async (req, res) => {
  const out = await invokeLambda("./Lambda/teams/getTeams.js", req);
  res.status(out.statusCode).json(out.body);
});

// Notifications
app.get("/api/notifications", async (req, res) => {
  const out = await invokeLambda("./Lambda/notifications/getNotifications.js", req);
  res.status(out.statusCode).json(out.body);
});

app.patch("/api/notifications/:notificationId/read", async (req, res) => {
  const out = await invokeLambda("./Lambda/notifications/markAsRead.js", req, {
    pathParameters: { notificationId: req.params.notificationId },
  });
  res.status(out.statusCode).json(out.body);
});

app.patch("/api/notifications/read-all", async (req, res) => {
  const out = await invokeLambda("./Lambda/notifications/markAsRead.js", req);
  res.status(out.statusCode).json(out.body);
});

// Assignments
app.post("/api/complaints/:complaintId/assign", async (req, res) => {
  const out = await invokeLambda("./Lambda/complaints/assignComplaint.js", req, {
    pathParameters: { complaintId: req.params.complaintId },
  });
  if (out.statusCode < 400) broadcast("complaint_assigned", { complaintId: req.params.complaintId, ...out.body });
  res.status(out.statusCode).json(out.body);
});

// Claim complaint
app.post("/api/complaints/:complaintId/claim", async (req, res) => {
  const out = await invokeLambda("./Lambda/complaints/claimComplaint.js", req, {
    pathParameters: { complaintId: req.params.complaintId },
  });
  if (out.statusCode < 400) broadcast("complaint_claimed", { complaintId: req.params.complaintId, ...out.body });
  res.status(out.statusCode).json(out.body);
});

// Feedback
app.post("/api/feedback", async (req, res) => {
  const out = await invokeLambda("./Lambda/feedback/submitFeedback.js", req);
  res.status(out.statusCode).json(out.body);
});

app.get("/api/feedback", async (req, res) => {
  const out = await invokeLambda("./Lambda/feedback/getFeedback.js", req);
  res.status(out.statusCode).json(out.body);
});

// Analytics
app.get("/api/admin/analytics", async (req, res) => {
  const out = await invokeLambda("./Lambda/admin/getAnalytics.js", req);
  res.status(out.statusCode).json(out.body);
});


const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Server error:", err);
    }
  });
};

const initialPort = Number(process.env.PORT || 4001);
startServer(initialPort);
