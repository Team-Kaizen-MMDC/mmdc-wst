const UserProfile = require("../models/UserProfile");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const multer = require("multer");
const path = require("path");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Multer memory storage for small file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}); // 10MB

// S3 client configuration (reads credentials from env)
const S3_BUCKET = process.env.RESUME_S3_BUCKET || "japanssw-s3-84cafb59";
const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-northeast-1" });

// @desc    Get current user's profile
// @route   GET /api/v1/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id }).populate(
    "user",
    "email role googleProfile",
  );

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Profile retrieved successfully", { profile }));
});

// @desc    Create user profile
// @route   POST /api/v1/profile
// @access  Private
exports.createProfile = asyncHandler(async (req, res, next) => {
  // Check if profile already exists
  const existingProfile = await UserProfile.findOne({ user: req.user.id });
  if (existingProfile) {
    return next(
      new ApiError(
        400,
        "Profile already exists. Use PUT /api/v1/profile to update",
      ),
    );
  }

  // Add user reference to profile data
  const profileData = {
    ...req.body,
    user: req.user.id,
  };

  const profile = await UserProfile.create(profileData);

  res
    .status(201)
    .json(new ApiResponse(201, "Profile created successfully", { profile }));
});

// @desc    Update user profile
// @route   PUT /api/v1/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  // Prevent user from being updated
  if (req.body.user) {
    delete req.body.user;
  }

  let profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(
      new ApiError(
        404,
        "Profile not found. Use POST /api/v1/profile to create",
      ),
    );
  }

  // Merge incoming fields into the profile document and save to ensure
  // mongoose `save` middleware runs (triggers profileCompleted recalculation).

// @desc    Delete resume from S3 and clear profile reference
// @route   DELETE /api/v1/profile/resume
// @access  Private
exports.deleteResume = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });
  if (!profile || !profile.resumePath) return next(new ApiError(404, "No resume uploaded"));

  try {
    const delCmd = new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: profile.resumePath });
    await s3.send(delCmd);

    // Clear profile field
    profile.resumePath = undefined;
    await profile.save();

    res.status(200).json(new ApiResponse(200, "Resume deleted successfully", {}));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("deleteResume: failed to delete", err && err.message ? err.message : err);
    return next(new ApiError(500, "Failed to delete resume"));
  }
});
  try {
    // Log incoming update for debugging
    // eslint-disable-next-line no-console
    console.log(
      `profileController.updateProfile: user=${req.user && req.user.id} updating fields:`,
      Object.keys(req.body),
    );

    Object.keys(req.body).forEach((key) => {
      // Protect against replacing the user reference
      if (key === "user") return;
      profile[key] = req.body[key];
    });

    await profile.save();

    res
      .status(200)
      .json(new ApiResponse(200, "Profile updated successfully", { profile }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "profileController.updateProfile: failed to save profile:",
      err && err.message ? err.message : err,
    );
    return next(new ApiError(500, "Failed to update profile"));
  }
});

// @desc    Delete user profile
// @route   DELETE /api/v1/profile
// @access  Private
exports.deleteProfile = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  await profile.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, "Profile deleted successfully", {}));
});

// @desc    Add education entry
// @route   POST /api/v1/profile/education
// @access  Private
exports.addEducation = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  profile.education.unshift(req.body);
  await profile.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Education added successfully", { profile }));
});

// @desc    Update education entry
// @route   PUT /api/v1/profile/education/:edu_id
// @access  Private
exports.updateEducation = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  const eduIndex = profile.education.findIndex(
    (edu) => edu._id.toString() === req.params.edu_id,
  );

  if (eduIndex === -1) {
    return next(new ApiError(404, "Education entry not found"));
  }

  // Update education entry
  profile.education[eduIndex] = {
    ...profile.education[eduIndex].toObject(),
    ...req.body,
  };

  await profile.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Education updated successfully", { profile }));
});

// @desc    Delete education entry
// @route   DELETE /api/v1/profile/education/:edu_id
// @access  Private
exports.deleteEducation = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  profile.education = profile.education.filter(
    (edu) => edu._id.toString() !== req.params.edu_id,
  );

  await profile.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Education deleted successfully", { profile }));
});

// @desc    Add experience entry
// @route   POST /api/v1/profile/experience
// @access  Private
exports.addExperience = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  profile.experience.unshift(req.body);
  await profile.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Experience added successfully", { profile }));
});

// @desc    Update experience entry
// @route   PUT /api/v1/profile/experience/:exp_id
// @access  Private
exports.updateExperience = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  const expIndex = profile.experience.findIndex(
    (exp) => exp._id.toString() === req.params.exp_id,
  );

  if (expIndex === -1) {
    return next(new ApiError(404, "Experience entry not found"));
  }

  // Update experience entry
  profile.experience[expIndex] = {
    ...profile.experience[expIndex].toObject(),
    ...req.body,
  };

  await profile.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Experience updated successfully", { profile }));
});

// @desc    Delete experience entry
// @route   DELETE /api/v1/profile/experience/:exp_id
// @access  Private
exports.deleteExperience = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  profile.experience = profile.experience.filter(
    (exp) => exp._id.toString() !== req.params.exp_id,
  );

  await profile.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Experience deleted successfully", { profile }));
});

// @desc    Update skills
// @route   PUT /api/v1/profile/skills
// @access  Private
exports.updateSkills = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  profile.skills = req.body.skills || [];
  await profile.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Skills updated successfully", { profile }));
});

// @desc    Update certifications
// @route   PUT /api/v1/profile/certifications
// @access  Private
exports.updateCertifications = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  profile.certifications = req.body.certifications || [];
  await profile.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, "Certifications updated successfully", { profile }),
    );
});

// @desc    Update languages
// @route   PUT /api/v1/profile/languages
// @access  Private
exports.updateLanguages = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  profile.languages = req.body.languages || [];
  await profile.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Languages updated successfully", { profile }));
});

// @desc    Update availability
// @route   PUT /api/v1/profile/availability
// @access  Private
exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ApiError(404, "Profile not found"));
  }

  profile.availability = {
    ...profile.availability,
    ...req.body,
  };
  await profile.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, "Availability updated successfully", { profile }),
    );
});

// @desc    Upload or overwrite resume file
// @route   POST /api/v1/profile/resume
// @access  Private
exports.uploadResume = [
  // multer middleware
  upload.single("resume"),
  asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return next(new ApiError(400, "No file uploaded"));
    }

    const profile = await UserProfile.findOne({ user: req.user.id });
    if (!profile) return next(new ApiError(404, "Profile not found"));

    // Validate file type (allow pdf, doc, docx)
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return next(
        new ApiError(400, "Unsupported file type. Use PDF or DOC/DOCX."),
      );
    }

    // Use a fixed key per-user so uploads overwrite by default
    const key = `resumes/${req.user.id}/resume${ext}`;

    try {
      const putParams = {
        Bucket: S3_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: "private",
      };

      await s3.send(new PutObjectCommand(putParams));

      // Save key to profile
      profile.resumePath = key;
      await profile.save();

      // Return a short-lived presigned GET URL so frontend can display immediately
      const getCmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
      const url = await getSignedUrl(s3, getCmd, { expiresIn: 60 * 5 }); // 5 minutes

      res
        .status(200)
        .json(
          new ApiResponse(200, "Resume uploaded successfully", {
            resumeUrl: url,
            resumeKey: key,
          }),
        );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        "uploadResume: upload failed",
        err && err.message ? err.message : err,
      );
      return next(new ApiError(500, "Failed to upload resume"));
    }
  }),
];

// @desc    Get presigned URL to view resume
// @route   GET /api/v1/profile/resume
// @access  Private
exports.getResume = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({ user: req.user.id });
  if (!profile || !profile.resumePath)
    return next(new ApiError(404, "No resume uploaded"));

  try {
    const getCmd = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: profile.resumePath,
    });
    const url = await getSignedUrl(s3, getCmd, { expiresIn: 60 * 5 });
    res
      .status(200)
      .json(
        new ApiResponse(200, "Resume URL generated", {
          resumeUrl: url,
          resumeKey: profile.resumePath,
        }),
      );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "getResume: failed to generate URL",
      err && err.message ? err.message : err,
    );
    return next(new ApiError(500, "Failed to retrieve resume"));
  }
});
