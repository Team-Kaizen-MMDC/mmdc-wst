# Resume Upload S3 Integration - Quick Start

This guide provides a quick overview of the S3 resume upload functionality using IAM roles.

## ✅ What Was Implemented

1. **AWS S3 Utility Module** ([src/utils/awsS3.js](src/utils/awsS3.js))
   - Configures S3 client to use IAM roles instead of access keys
   - Supports automatic credential discovery (EC2, ECS, Lambda)
   - Supports role assumption for local development

2. **Updated Profile Controller** ([src/controllers/profileController.js](src/controllers/profileController.js))
   - Uses centralized AWS S3 utility
   - Maintains existing upload, get, and delete resume endpoints

3. **Environment Configuration** ([.env](.env))
   - Added `AWS_REGION` configuration
   - Added `AWS_ROLE_ARN` for local development
   - Documented IAM role approach (no access keys needed)

4. **Dependencies** ([package.json](package.json))
   - Added `@aws-sdk/credential-providers` for role assumption

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- AWS CLI installed and configured
- IAM role created with S3 permissions: `arn:aws:iam::182371258083:role/mmdc-wst-s3-access-role-84cafb59`

### Step 1: Configure AWS CLI

```bash
# Install AWS CLI (if not installed)
brew install awscli

# Configure with your IAM user credentials
aws configure
# Enter your Access Key ID, Secret Access Key, Region (ap-northeast-1)

# Test AWS CLI
aws sts get-caller-identity
```

### Step 2: Verify Environment Variables

Ensure your `.env` file has:

```bash
AWS_REGION=ap-northeast-1
RESUME_S3_BUCKET=japanssw-s3-84cafb59
AWS_ROLE_ARN=arn:aws:iam::182371258083:role/mmdc-wst-s3-access-role-84cafb59
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Start the Server

```bash
npm run dev
```

### Step 5: Test Resume Upload

```bash
# Get a JWT token by logging in first
# Then test upload:
curl -X POST http://localhost:3000/api/v1/profile/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@/path/to/resume.pdf"
```

---

## 📚 API Endpoints

### Upload Resume

```
POST /api/v1/profile/resume
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Body:
  resume: <file> (PDF, DOC, DOCX - max 10MB)

Response:
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resumeUrl": "https://s3.amazonaws.com/...",
    "resumeKey": "resumes/user-id/resume.pdf"
  }
}
```

### Get Resume URL

```
GET /api/v1/profile/resume
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "message": "Resume URL generated",
  "data": {
    "resumeUrl": "https://s3.amazonaws.com/...",
    "resumeKey": "resumes/user-id/resume.pdf"
  }
}
```

### Delete Resume

```
DELETE /api/v1/profile/resume
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "message": "Resume deleted successfully",
  "data": {}
}
```

---

## 🏗️ How It Works

### Architecture

```
Frontend (profileDashboard.html)
    ↓ HTTP Request
Backend API (profileController.js)
    ↓ Uses
AWS S3 Utility (awsS3.js)
    ↓ Assumes Role
IAM Role (mmdc-wst-s3-access-role-84cafb59)
    ↓ Grants Access
S3 Bucket (japanssw-s3-84cafb59)
```

### Credential Chain

The AWS SDK automatically tries to find credentials in this order:

1. **Environment variables** (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) - Not used ❌
2. **Shared credentials file** (~/.aws/credentials) - Used for local dev ⚙️
3. **IAM role assumption** (AWS_ROLE_ARN in .env) - Used for local dev ✅
4. **ECS container credentials** - Used on ECS/Fargate ✅
5. **EC2 instance metadata** - Used on EC2 ✅
6. **Lambda execution role** - Used on Lambda ✅

### Security Benefits

- ✅ No hardcoded credentials
- ✅ Temporary credentials that auto-rotate
- ✅ Fine-grained permissions
- ✅ Audit trail via CloudTrail
- ✅ No risk of credential leakage

---

## 📁 Frontend Integration Example

Add to [profileDashboard.html](../pages/profileDashboard.html):

```html
<!-- Resume Upload Section -->
<div class="card">
  <div class="card-body">
    <h5>Resume</h5>
    <input type="file" id="resumeInput" accept=".pdf,.doc,.docx" />
    <button onclick="uploadResume()">Upload</button>
  </div>
</div>

<script>
  async function uploadResume() {
    const fileInput = document.getElementById("resumeInput");
    const file = fileInput.files[0];

    if (!file) {
      alert("Please select a file");
      return;
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC, or DOCX file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/v1/profile/resume",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Resume uploaded successfully!");
        // Optionally display the resume URL
        console.log("Resume URL:", data.data.resumeUrl);
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    }
  }

  async function getResumeUrl() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/v1/profile/resume",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        // Open resume in new tab
        window.open(data.data.resumeUrl, "_blank");
      } else {
        alert("No resume found");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
</script>
```

---

## 🔧 Troubleshooting

### Error: "Unable to locate credentials"

**Solution:**

1. Run `aws configure` to set up AWS CLI
2. Verify `.env` has `AWS_REGION=ap-northeast-1`
3. Check that AWS CLI is working: `aws sts get-caller-identity`

### Error: "Access Denied"

**Solution:**

1. Verify IAM role has S3 permissions (see [AWS_IAM_SETUP.md](AWS_IAM_SETUP.md))
2. Check bucket name matches: `japanssw-s3-84cafb59`
3. Test bucket access: `aws s3 ls s3://japanssw-s3-84cafb59/`

### Error: "AssumeRole is not authorized"

**Solution:**

1. Check IAM role trust policy allows your user
2. Contact AWS admin to update trust relationships
3. See [AWS_IAM_SETUP.md](AWS_IAM_SETUP.md#trust-relationships)

---

## 📖 Additional Documentation

- **Detailed IAM Setup:** [AWS_IAM_SETUP.md](AWS_IAM_SETUP.md)
- **API Documentation:** [API_REFERENCE.md](API_REFERENCE.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🛠️ Development Checklist

Before deploying to production:

- [ ] IAM role has minimal permissions (only S3 on specific bucket)
- [ ] S3 bucket has encryption enabled
- [ ] S3 bucket blocks public access
- [ ] CloudTrail logging enabled
- [ ] `.env` file is in `.gitignore`
- [ ] No AWS access keys in code or `.env`
- [ ] Tested upload, get, and delete endpoints
- [ ] Frontend validates file type and size
- [ ] Error handling implemented

---

## 📞 Support

For issues:

1. Check logs: `backend/logs/`
2. Review [AWS_IAM_SETUP.md](AWS_IAM_SETUP.md) troubleshooting section
3. Test AWS CLI: `aws s3 ls s3://japanssw-s3-84cafb59/`
4. Check IAM role permissions in AWS Console
