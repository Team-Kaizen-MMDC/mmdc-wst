const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/japansswdb';

async function loadJson(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function transformValue(val) {
  if (Array.isArray(val)) return val.map(transformValue);
  if (val && typeof val === 'object') {
    if (val.$oid) return new mongoose.Types.ObjectId(val.$oid);
    if (val.$date) return new Date(val.$date);
    const out = {};
    for (const k of Object.keys(val)) out[k] = transformValue(val[k]);
    return out;
  }
  return val;
}

function transformDoc(doc) {
  const out = {};
  for (const k of Object.keys(doc)) {
    out[k] = transformValue(doc[k]);
  }
  return out;
}

async function main() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const Company = require('../src/models/Company');
  const Job = require('../src/models/Job');
  const User = require('../src/models/User');

  const downloads = process.env.DOWNLOADS_DIR || path.join(require('os').homedir(), 'Downloads');
  const companiesPath = path.join(downloads, 'japansswdb.companies.json');
  const jobsPath = path.join(downloads, 'japansswdb.jobs.json');

  if (!fs.existsSync(companiesPath) || !fs.existsSync(jobsPath)) {
    console.error('Required JSON files not found in', downloads);
    process.exit(1);
  }

  console.log('Loading JSON files...');
  const rawCompanies = await loadJson(companiesPath);
  const rawJobs = await loadJson(jobsPath);

  const adminEmail = process.env.IMPORT_FALLBACK_ADMIN || 'admin@mmdc.local';
  const adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    console.error('Admin user', adminEmail, 'not found. Create it or set IMPORT_FALLBACK_ADMIN. Aborting.');
    process.exit(1);
  }

  const companyIdMap = {}; // oldOidStr -> new ObjectId
  const report = { companies: { created: 0, updated: 0, errors: [] }, jobs: { created: 0, errors: [] } };

  console.log('Seeding companies...');
  for (const raw of rawCompanies) {
    try {
      const doc = transformDoc(raw);
      // original id string
      const oldId = (raw._id && raw._id.$oid) ? raw._id.$oid : null;
      // Prepare payload: allow upsert by name
      const payload = {
        name: doc.name,
        industry: doc.industry || 'Other',
        size: doc.size,
        founded: doc.founded,
        website: doc.website,
        description: doc.description || doc.desc || '',
        location: doc.location || {},
        contact: doc.contact || {},
        isVerified: !!doc.isVerified,
        isActive: doc.isActive !== false,
        images: doc.images || [],
        videos: doc.videos || [],
        certifications: doc.certifications || [],
      };

      // Determine owner: prefer mapping to existing user id if present
      let ownerId = null;
      if (doc.owner) {
        // if owner is ObjectId
        ownerId = doc.owner;
        const exists = await User.findById(ownerId);
        if (!exists) ownerId = null;
      }
      if (!ownerId) ownerId = adminUser._id;
      payload.owner = ownerId;

      // Upsert by name
      const existing = await Company.findOne({ name: payload.name });
      if (existing) {
        // update non-destructive fields
        existing.industry = existing.industry || payload.industry;
        existing.size = existing.size || payload.size;
        existing.description = existing.description || payload.description;
        existing.location = existing.location || payload.location;
        existing.contact = existing.contact || payload.contact;
        await existing.save();
        companyIdMap[oldId] = existing._id.toString();
        report.companies.updated++;
      } else {
        const created = await Company.create(payload);
        companyIdMap[oldId] = created._id.toString();
        report.companies.created++;
      }
    } catch (err) {
      console.error('Company import error:', err.message || err);
      report.companies.errors.push({ error: err.message || String(err), raw: raw });
    }
  }

  console.log('Seeding jobs...');
  for (const raw of rawJobs) {
    try {
      const doc = transformDoc(raw);
      // Remap company
      const oldCompanyId = (raw.company && raw.company.$oid) ? raw.company.$oid : (doc.company && doc.company.toString && doc.company.toString());
      let newCompanyId = companyIdMap[oldCompanyId];
      if (!newCompanyId) {
        // try lookup by company id in DB
        const found = await Company.findOne({ 'slug': doc.company });
        if (found) newCompanyId = found._id.toString();
      }
      if (!newCompanyId) {
        // create placeholder company
        const placeholder = await Company.create({
          name: doc.companyName || `Imported Company ${oldCompanyId}`,
          industry: doc.industry || 'Other',
          location: doc.location || { prefecture: 'Unknown', city: 'Unknown' },
          contact: doc.contact || { email: `import+${oldCompanyId}@example.local`, phone: '000-000-0000' },
          description: doc.companyDescription || 'Imported placeholder company',
          owner: adminUser._id,
        });
        newCompanyId = placeholder._id.toString();
        companyIdMap[oldCompanyId] = newCompanyId;
        report.companies.created++;
      }

      // Remap postedBy
      let postedById = null;
      if (raw.postedBy && raw.postedBy.$oid) {
        const candidate = await User.findById(raw.postedBy.$oid).catch(() => null);
        if (candidate) postedById = candidate._id;
      }
      if (!postedById) postedById = adminUser._id;

      // Prepare job payload
      const jobPayload = {
        company: new mongoose.Types.ObjectId(newCompanyId),
        postedBy: postedById,
        title: doc.title || 'Imported Job',
        industry: doc.industry || 'Other',
        category: doc.category,
        summary: doc.summary || (doc.responsibilities || '').slice(0, 200),
        responsibilities: doc.responsibilities || '',
        requirements: doc.requirements || '',
        benefits: doc.benefits || '',
        requiredEducation: doc.requiredEducation || 'None',
        japaneseLevel: doc.japaneseLevel || 'None',
        requiredExperience: doc.requiredExperience || { years: 0 },
        requiredSkills: doc.requiredSkills || [],
        requiredCertifications: doc.requiredCertifications || [],
        compensation: doc.compensation || { salaryMin: 0, salaryMax: 0, currency: 'JPY', period: 'monthly' },
        location: doc.location || { prefecture: 'Unknown', city: 'Unknown' },
        workConditions: doc.workConditions || {},
        applicationInfo: doc.applicationInfo || { deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), applicationMethod: 'Platform' },
        status: doc.status || 'active',
        visibility: doc.visibility || 'public',
      };

      // Remove any _id to let Mongo generate a new one
      // Insert via Job model (runs validators)
      const createdJob = await Job.create(jobPayload);
      // Add job to company's jobs array
      await Company.findByIdAndUpdate(createdJob.company, { $push: { jobs: createdJob._id } });
      report.jobs.created++;
    } catch (err) {
      console.error('Job import error:', err.message || err);
      report.jobs.errors.push({ error: err.message || String(err), raw: raw });
    }
  }

  const outPath = path.join(process.cwd(), 'import_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('Import finished. Report written to', outPath);
  console.log('Summary:', report);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });