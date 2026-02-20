#!/usr/bin/env node
const fetch = global.fetch || require("node-fetch");

const BASE = process.env.BASE_URL || "http://localhost:3000/api/v1";

function log(...args) {
  console.log(...args);
}

async function run() {
  try {
    const email = `e2e+${Date.now()}@example.com`;
    const password = "TestPass123!";

    log("1) Registering user:", email);
    let r = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "jobseeker" }),
    });

    const reg = await r.json();
    if (!r.ok) {
      console.error("Register failed:", r.status, reg);
      process.exit(2);
    }

    const token = reg.data && reg.data.token;
    if (!token) {
      console.error("No token received from register response", reg);
      process.exit(3);
    }

    log("-> Received token, calling GET /profile");
    r = await fetch(`${BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const before = await r.json();
    log("GET /profile response status:", r.status);
    console.log(JSON.stringify(before, null, 2));

    // Prepare payload used for create/update
    const payload = {
      firstName: "E2E",
      lastName: "Tester",
      city: "TestCity",
      prefecture: "TestPrefecture",
      nationality: "not-applicable",
      dateOfBirth: "1970-01-01",
    };

    // If no profile exists, create it first
    if (r.status === 404) {
      log("Profile not found - creating via POST /profile");
      r = await fetch(`${BASE}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const postRes = await r.json();
      log("POST /profile status:", r.status);
      console.log(JSON.stringify(postRes, null, 2));
      if (!r.ok) {
        console.error("Failed to create profile:", r.status, postRes);
        process.exit(6);
      }
    } else {
      log("2) Updating profile (PUT /profile)");
      r = await fetch(`${BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const putRes = await r.json();
      log("PUT /profile status:", r.status);
      console.log(JSON.stringify(putRes, null, 2));
      if (!r.ok) {
        console.error("Failed to update profile via PUT:", r.status, putRes);
        process.exit(7);
      }
    }

    log("3) Re-fetching profile to verify changes");
    r = await fetch(`${BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const after = await r.json();
    log("GET /profile after update status:", r.status);
    console.log(JSON.stringify(after, null, 2));

    // Basic verification
    const profile = after.data && after.data.profile;
    if (!profile) {
      console.error("No profile object returned after update");
      process.exit(4);
    }

    const ok =
      profile.firstName === payload.firstName &&
      profile.lastName === payload.lastName &&
      profile.city === payload.city;
    if (ok) {
      log("E2E check PASSED: profile updated and returned by API.");
      process.exit(0);
    } else {
      console.error(
        "E2E check FAILED: profile fields do not match expected payload",
      );
      process.exit(5);
    }
  } catch (err) {
    console.error("E2E script error:", err);
    process.exit(1);
  }
}

run();
