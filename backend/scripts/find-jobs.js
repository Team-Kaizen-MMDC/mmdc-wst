#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

(async function run(){
  try{
    if(!process.env.MONGODB_URI){
      console.error('MONGODB_URI not found in env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const q = { title: { $regex: 'Delivery', $options: 'i' } };
    const jobs = await db.collection('jobs').find(q).toArray();
    console.log('Found jobs:', jobs.length);
    jobs.forEach(j => {
      console.log('----');
      console.log('id:', j._id.toString());
      console.log('title:', j.title);
      console.log('company:', j.company);
      console.log('postedBy:', j.postedBy);
      console.log('visibility:', j.visibility);
      console.log('createdAt:', j.createdAt);
    });
    await mongoose.disconnect();
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();
