CREATE TABLE IF NOT EXISTS "users" (
	"id" serial NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" text NOT NULL DEFAULT 'user',
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	"lastSignedIn" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "users_id" PRIMARY KEY("id"),
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);

CREATE TABLE IF NOT EXISTS "auditLogs" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"action" varchar(255),
	"entityType" varchar(100),
	"entityId" int,
	"changes" text,
	"ipAddress" varchar(45),
	"userAgent" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "auditLogs_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "calculationHistory" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"calculationType" text,
	"inputData" text,
	"result" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "calculationHistory_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "candidateActivities" (
	"id" serial NOT NULL,
	"applicationId" int NOT NULL,
	"userId" int NOT NULL,
	"activityType" text,
	"description" text,
	"metadata" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "candidateActivities_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "candidateEvaluations" (
	"id" serial NOT NULL,
	"applicationId" int NOT NULL,
	"evaluatorId" int NOT NULL,
	"technicalScore" int,
	"softSkillsScore" int,
	"cultureFitScore" int,
	"overallScore" int,
	"notes" text,
	"recommendation" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "candidateEvaluations_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "candidates" (
	"id" serial NOT NULL,
	"fullName" varchar(255),
	"email" varchar(320),
	"phone" varchar(20),
	"nationality" varchar(100),
	"currentLocation" varchar(255),
	"cvUrl" text,
	"linkedinUrl" varchar(255),
	"portfolioUrl" varchar(255),
	"skills" text,
	"experience" text,
	"education" text,
	"languages" text,
	"aiParsedData" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "candidates_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "caseComments" (
	"id" serial NOT NULL,
	"caseId" int NOT NULL,
	"userId" int NOT NULL,
	"comment" text,
	"isInternal" boolean DEFAULT false,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "caseComments_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "chatHistory" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"message" text,
	"response" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "chatHistory_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "companies" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"nameAr" varchar(255),
	"nameEn" varchar(255),
	"commercialRegister" varchar(50),
	"industry" varchar(100),
	"employeeCount" text,
	"city" varchar(100),
	"address" text,
	"website" varchar(255),
	"logo" text,
	"description" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "companies_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "consultantAvailability" (
	"id" serial NOT NULL,
	"consultantId" int NOT NULL,
	"dayOfWeek" text,
	"startTime" time,
	"endTime" time,
	"isAvailable" boolean DEFAULT true,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "consultantAvailability_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "consultantBlockedDates" (
	"id" serial NOT NULL,
	"consultantId" int NOT NULL,
	"startDate" date,
	"endDate" date,
	"reason" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "consultantBlockedDates_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "consultantDocuments" (
	"id" serial NOT NULL,
	"consultantId" int NOT NULL,
	"documentType" text,
	"documentUrl" text,
	"verificationStatus" text DEFAULT 'pending',
	"expiryDate" date,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "consultantDocuments_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "consultantEarnings" (
	"id" serial NOT NULL,
	"consultantId" int NOT NULL,
	"bookingId" int,
	"amount" decimal(10,2),
	"commissionRate" decimal(5,2),
	"platformFee" decimal(10,2),
	"netEarnings" decimal(10,2),
	"paymentStatus" text DEFAULT 'pending',
	"paidDate" date,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "consultantEarnings_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "consultantReviews" (
	"id" serial NOT NULL,
	"consultantId" int NOT NULL,
	"userId" int NOT NULL,
	"bookingId" int,
	"rating" int,
	"review" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "consultantReviews_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "consultants" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"fullNameAr" varchar(255),
	"fullNameEn" varchar(255),
	"phone" varchar(20),
	"email" varchar(320),
	"profilePicture" text,
	"bio" text,
	"yearsOfExperience" int,
	"hourlyRate" decimal(10,2),
	"specializations" text,
	"qualifications" text,
	"languages" text,
	"averageRating" decimal(3,2),
	"totalReviews" int DEFAULT 0,
	"totalBookings" int DEFAULT 0,
	"responseTime" int,
	"cancellationRate" decimal(5,2),
	"maxDailyBookings" int DEFAULT 5,
	"consultantAvailability" text,
	"consultantBlockedDates" text,
	"verificationStatus" text DEFAULT 'pending',
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "consultants_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "consultationBookings" (
	"id" serial NOT NULL,
	"consultantId" int NOT NULL,
	"clientId" int NOT NULL,
	"bookingNumber" varchar(50),
	"consultationTypeId" int,
	"scheduledDate" date,
	"scheduledTime" time,
	"duration" int,
	"status" text DEFAULT 'pending',
	"meetingLink" varchar(255),
	"notes" text,
	"clientNotes" text,
	"totalAmount" decimal(10,2),
	"finalAmount" decimal(10,2),
	"paymentStatus" text DEFAULT 'pending',
	"paymentMethod" varchar(50),
	"startedAt" timestamp,
	"endedAt" timestamp,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "consultationBookings_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "consultationMessages" (
	"id" serial NOT NULL,
	"bookingId" int NOT NULL,
	"senderId" int NOT NULL,
	"message" text,
	"attachments" text,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "consultationMessages_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "consultationTypes" (
	"id" serial NOT NULL,
	"nameAr" varchar(255),
	"nameEn" varchar(255),
	"descriptionAr" text,
	"descriptionEn" text,
	"duration" int,
	"basePrice" decimal(10,2),
	"icon" varchar(255),
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "consultationTypes_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "discountCodeUsage" (
	"id" serial NOT NULL,
	"codeId" int NOT NULL,
	"userId" int NOT NULL,
	"usedAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "discountCodeUsage_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "discountCodes" (
	"id" serial NOT NULL,
	"code" varchar(50),
	"discountType" text,
	"discountValue" decimal(10,2),
	"maxUsage" int,
	"currentUsage" int DEFAULT 0,
	"validFrom" date,
	"validUntil" date,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "discountCodes_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "documents" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"documentType" varchar(100),
	"documentUrl" text,
	"uploadedAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "documents_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "emailLogs" (
	"id" serial NOT NULL,
	"userId" int,
	"recipientEmail" varchar(320),
	"subject" varchar(255),
	"body" text,
	"status" text DEFAULT 'sent',
	"sentAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "emailLogs_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "employees" (
	"id" serial NOT NULL,
	"companyId" int NOT NULL,
	"userId" int NOT NULL,
	"fullNameAr" varchar(255),
	"fullNameEn" varchar(255),
	"email" varchar(320),
	"phone" varchar(20),
	"position" varchar(100),
	"department" varchar(100),
	"salary" decimal(10,2),
	"joinDate" date,
	"endDate" date,
	"status" text DEFAULT 'active',
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "employees_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "generatedDocuments" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"documentType" varchar(100),
	"documentUrl" text,
	"generatedAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "generatedDocuments_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "generatedLetters" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"letterType" varchar(100),
	"content" text,
	"generatedAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "generatedLetters_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "hrCases" (
	"id" serial NOT NULL,
	"companyId" int NOT NULL,
	"caseNumber" varchar(50),
	"subject" varchar(255),
	"description" text,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"assignedTo" int,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "hrCases_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "individualHRs" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"fullNameAr" varchar(255),
	"fullNameEn" varchar(255),
	"email" varchar(320),
	"phone" varchar(20),
	"specialization" varchar(100),
	"yearsOfExperience" int,
	"certifications" text,
	"bio" text,
	"profilePicture" text,
	"averageRating" decimal(3,2),
	"totalReviews" int DEFAULT 0,
	"verificationStatus" text DEFAULT 'pending',
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "individualHRs_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "interviewSchedules" (
	"id" serial NOT NULL,
	"applicationId" int NOT NULL,
	"scheduledDate" date,
	"scheduledTime" time,
	"interviewType" text,
	"interviewer" varchar(255),
	"location" varchar(255),
	"status" text DEFAULT 'scheduled',
	"feedback" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "interviewSchedules_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "jobApplications" (
	"id" serial NOT NULL,
	"jobId" int NOT NULL,
	"candidateId" int NOT NULL,
	"status" text DEFAULT 'applied',
	"appliedAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "jobApplications_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "jobs" (
	"id" serial NOT NULL,
	"companyId" int NOT NULL,
	"titleAr" varchar(255),
	"titleEn" varchar(255),
	"descriptionAr" text,
	"descriptionEn" text,
	"requirements" text,
	"location" varchar(255),
	"salaryMin" decimal(10,2),
	"salaryMax" decimal(10,2),
	"jobType" text,
	"status" text DEFAULT 'open',
	"postedAt" timestamp NOT NULL DEFAULT now(),
	"closedAt" timestamp,
	CONSTRAINT "jobs_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "notificationPreferences" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"emailNotifications" boolean DEFAULT true,
	"smsNotifications" boolean DEFAULT false,
	"pushNotifications" boolean DEFAULT true,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "notificationPreferences_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"title" varchar(255),
	"message" text,
	"type" varchar(50),
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "notifications_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "passwords" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"hashedPassword" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "passwords_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"bookingId" int,
	"amount" decimal(10,2),
	"paymentMethod" varchar(50),
	"transactionId" varchar(100),
	"status" text DEFAULT 'pending',
	"paidAt" timestamp,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "payments_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial NOT NULL,
	"roleId" int NOT NULL,
	"permissionName" varchar(100),
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "permissions_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "pipelineStages" (
	"id" serial NOT NULL,
	"companyId" int NOT NULL,
	"stageName" varchar(100),
	"stageOrder" int,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "pipelineStages_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "processingActivities" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"activityType" varchar(100),
	"description" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "processingActivities_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "retentionLogs" (
	"id" serial NOT NULL,
	"employeeId" int NOT NULL,
	"action" varchar(100),
	"reason" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "retentionLogs_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "retentionPolicies" (
	"id" serial NOT NULL,
	"companyId" int NOT NULL,
	"policyName" varchar(255),
	"description" text,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "retentionPolicies_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "securityIncidents" (
	"id" serial NOT NULL,
	"userId" int NOT NULL,
	"incidentType" varchar(100),
	"description" text,
	"severity" text DEFAULT 'medium',
	"resolvedAt" timestamp,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "securityIncidents_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "smsLogs" (
	"id" serial NOT NULL,
	"userId" int,
	"recipientPhone" varchar(20),
	"message" text,
	"status" text DEFAULT 'sent',
	"sentAt" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "smsLogs_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "specializations" (
	"id" serial NOT NULL,
	"nameAr" varchar(255),
	"nameEn" varchar(255),
	"descriptionAr" text,
	"descriptionEn" text,
	"icon" varchar(255),
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now() ,
	CONSTRAINT "specializations_id" PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"executed_at" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "__drizzle_migrations_id" PRIMARY KEY("id"),
	CONSTRAINT "__drizzle_migrations_name_unique" UNIQUE("name")
);
