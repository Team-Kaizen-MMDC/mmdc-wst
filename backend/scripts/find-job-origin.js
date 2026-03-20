#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const JOB_ID = process.argv[2] || '69971dd432ff2fc05e7e80ce';

(async function run(){
  try{
    if(!process.env.MONGODB_URI){
      console.error('MONGODB_URI not found in env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const ObjectId = require('mongodb').ObjectId;
    const job = await db.collection('jobs').findOne({_id: new ObjectId(JOB_ID)});
    if(!job){
      console.log('Job not found', JOB_ID);
      await mongoose.disconnect();
      process.exit(0);
    }
    console.log('Job:', {id: job._id.toString(), title: job.title, visibility: job.visibility, company: job.company?.toString(), postedBy: job.postedBy?.toString()});
    if(job.company){
      const comp = await db.collection('companies').findOne({_id: new ObjectId(job.company)});
      console.log('Company:', comp ? {id: comp._id.toString(), name: comp.name, owner: comp.owner, isVerified: comp.isVerified} : 'not found');
    }
    if(job.postedBy){
      const user = await db.collection('users').findOne({_id: new ObjectId(job.postedBy)});
      console.log('PostedBy user:', user ? {id: user._id.toString(), email: user.email, role: user.role} : 'not found');
    }
    await mongoose.disconnect();
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();
