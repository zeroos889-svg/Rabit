CREATE TABLE "auditLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"action" varchar(255),
	"entityType" varchar(100),
	"entityId" integer,
	"changes" text,
	"ipAddress" varchar(45),
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculationHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"calculationType" varchar(255),
	"inputData" text,
	"result" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidateActivities" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicationId" integer NOT NULL,
	"userId" integer NOT NULL,
	"activityType" varchar(255),
	"description" text,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidateEvaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicationId" integer NOT NULL,
	"evaluatorId" integer NOT NULL,
	"technicalScore" integer,
	"softSkillsScore" integer,
	"cultureFitScore" integer,
	"overallScore" integer,
	"notes" text,
	"recommendation" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caseComments" (
	"id" serial PRIMARY KEY NOT NULL,
	"caseId" integer NOT NULL,
	"userId" integer NOT NULL,
	"comment" text,
	"isInternal" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatConversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"visitorName" varchar(255),
	"visitorEmail" varchar(320),
	"visitorToken" varchar(128),
	"status" varchar(255) DEFAULT 'open' NOT NULL,
	"lastMessageAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"message" text,
	"response" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversationId" integer NOT NULL,
	"senderType" varchar(255) NOT NULL,
	"senderName" varchar(255),
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"nameAr" varchar(255),
	"nameEn" varchar(255),
	"commercialRegister" varchar(50),
	"industry" varchar(100),
	"employeeCount" varchar(255),
	"city" varchar(100),
	"address" text,
	"website" varchar(255),
	"logoUrl" text,
	"subscriptionPlan" varchar(255),
	"subscriptionStatus" varchar(255),
	"subscriptionStartDate" date,
	"subscriptionEndDate" date,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_commercialRegister_unique" UNIQUE("commercialRegister")
);
--> statement-breakpoint
CREATE TABLE "consultantAvailability" (
	"id" serial PRIMARY KEY NOT NULL,
	"consultantId" integer NOT NULL,
	"dayOfWeek" varchar(255) NOT NULL,
	"startTime" varchar(10) NOT NULL,
	"endTime" varchar(10) NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultantBlockedDates" (
	"id" serial PRIMARY KEY NOT NULL,
	"consultantId" integer NOT NULL,
	"blockedDate" date NOT NULL,
	"reason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultantDocuments" (
	"id" serial PRIMARY KEY NOT NULL,
	"consultantId" integer NOT NULL,
	"documentType" varchar(255) NOT NULL,
	"documentName" varchar(255) NOT NULL,
	"documentUrl" text NOT NULL,
	"fileSize" integer,
	"mimeType" varchar(100),
	"verificationStatus" varchar(255) DEFAULT 'pending' NOT NULL,
	"verificationNotes" text,
	"verifiedBy" integer,
	"verifiedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultantEarnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"consultantId" integer NOT NULL,
	"bookingId" integer NOT NULL,
	"totalAmount" integer NOT NULL,
	"platformCommission" integer NOT NULL,
	"consultantEarning" integer NOT NULL,
	"commissionRate" integer NOT NULL,
	"payoutStatus" varchar(255) DEFAULT 'pending' NOT NULL,
	"payoutMethod" varchar(50),
	"payoutTransactionId" varchar(255),
	"payoutDate" timestamp,
	"payoutNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultantReviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"consultantId" integer NOT NULL,
	"bookingId" integer NOT NULL,
	"clientId" integer NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"professionalismRating" integer,
	"communicationRating" integer,
	"knowledgeRating" integer,
	"timelinessRating" integer,
	"isPublished" boolean DEFAULT true NOT NULL,
	"consultantResponse" text,
	"respondedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consultantReviews_bookingId_unique" UNIQUE("bookingId")
);
--> statement-breakpoint
CREATE TABLE "consultants" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"fullNameAr" varchar(255) NOT NULL,
	"fullNameEn" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"city" varchar(100),
	"profilePicture" text,
	"mainSpecialization" varchar(100) NOT NULL,
	"subSpecializations" text,
	"yearsOfExperience" integer NOT NULL,
	"qualifications" text,
	"certifications" text,
	"bioAr" text,
	"bioEn" text,
	"ibanNumber" varchar(34),
	"bankName" varchar(100),
	"accountHolderName" varchar(255),
	"commissionRate" integer DEFAULT 20 NOT NULL,
	"status" varchar(255) DEFAULT 'pending' NOT NULL,
	"rejectionReason" text,
	"approvedAt" timestamp,
	"approvedBy" integer,
	"totalConsultations" integer DEFAULT 0 NOT NULL,
	"completedConsultations" integer DEFAULT 0 NOT NULL,
	"averageRating" integer DEFAULT 0,
	"totalEarnings" integer DEFAULT 0 NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL,
	"maxDailyBookings" integer DEFAULT 5 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consultants_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "consultationBookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingNumber" varchar(50) NOT NULL,
	"clientId" integer NOT NULL,
	"consultantId" integer NOT NULL,
	"consultationTypeId" integer NOT NULL,
	"scheduledDate" date NOT NULL,
	"scheduledTime" varchar(10) NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"clientNotes" text,
	"consultantNotes" text,
	"status" varchar(255) DEFAULT 'pending' NOT NULL,
	"cancellationReason" text,
	"cancelledBy" integer,
	"cancelledAt" timestamp,
	"totalAmount" integer NOT NULL,
	"discountAmount" integer DEFAULT 0 NOT NULL,
	"finalAmount" integer NOT NULL,
	"discountCodeId" integer,
	"paymentStatus" varchar(255) DEFAULT 'pending' NOT NULL,
	"paymentMethod" varchar(50),
	"paymentTransactionId" varchar(255),
	"paidAt" timestamp,
	"rating" integer,
	"review" text,
	"reviewedAt" timestamp,
	"confirmedAt" timestamp,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consultationBookings_bookingNumber_unique" UNIQUE("bookingNumber")
);
--> statement-breakpoint
CREATE TABLE "consultationMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingId" integer NOT NULL,
	"senderId" integer NOT NULL,
	"senderType" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"attachments" text,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp,
	"isAiAssisted" boolean DEFAULT false NOT NULL,
	"aiSuggestion" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultationTypes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"nameAr" varchar(255) NOT NULL,
	"nameEn" varchar(255) NOT NULL,
	"descriptionAr" text,
	"descriptionEn" text,
	"basePriceSAR" integer NOT NULL,
	"estimatedDuration" integer DEFAULT 60 NOT NULL,
	"relatedSpecializations" text,
	"icon" varchar(100),
	"imageUrl" text,
	"color" varchar(20),
	"features" text,
	"requiredDocuments" text,
	"requiredInfo" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consultationTypes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "consultingPackages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"nameEn" varchar(255),
	"description" text,
	"descriptionEn" text,
	"duration" integer,
	"slaHours" integer,
	"priceSAR" integer NOT NULL,
	"features" text,
	"isActive" boolean DEFAULT true,
	"orderIndex" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultingResponses" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticketId" integer NOT NULL,
	"userId" integer NOT NULL,
	"message" text NOT NULL,
	"attachments" text,
	"isInternal" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultingTickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"packageId" integer NOT NULL,
	"consultantId" integer,
	"ticketNumber" varchar(50) NOT NULL,
	"status" varchar(255) DEFAULT 'pending',
	"priority" varchar(255) DEFAULT 'medium',
	"subject" varchar(255),
	"description" text,
	"submittedFormJson" text,
	"attachments" text,
	"scheduledAt" timestamp,
	"completedAt" timestamp,
	"slaDeadline" timestamp,
	"rating" integer,
	"feedback" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consultingTickets_ticketNumber_unique" UNIQUE("ticketNumber")
);
--> statement-breakpoint
CREATE TABLE "customerPdplSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"processingRole" varchar(255) DEFAULT 'controller' NOT NULL,
	"dataStorageLocation" varchar(255) DEFAULT 'SA' NOT NULL,
	"allowAiTraining" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customerPdplSettings_customerId_unique" UNIQUE("customerId")
);
--> statement-breakpoint
CREATE TABLE "dataSubjectRequests" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" varchar(255) NOT NULL,
	"payloadJson" text,
	"status" varchar(255) DEFAULT 'new' NOT NULL,
	"adminNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"closedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "dataTransfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer,
	"legalBasis" varchar(255) NOT NULL,
	"destinationCountry" varchar(2) NOT NULL,
	"dataCategories" text,
	"riskAssessmentRef" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discountCodeUsage" (
	"id" serial PRIMARY KEY NOT NULL,
	"codeId" integer NOT NULL,
	"userId" integer NOT NULL,
	"orderId" varchar(100),
	"originalAmount" integer NOT NULL,
	"discountAmount" integer NOT NULL,
	"finalAmount" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discountCodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"discountType" varchar(255) NOT NULL,
	"discountValue" integer NOT NULL,
	"maxUses" integer,
	"usedCount" integer DEFAULT 0 NOT NULL,
	"validFrom" timestamp,
	"validUntil" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discountCodes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"companyId" integer,
	"documentType" varchar(100),
	"title" varchar(255),
	"fileUrl" text,
	"fileSize" integer,
	"mimeType" varchar(100),
	"uploadedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emailLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"toEmail" varchar(320) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"template" varchar(100),
	"status" varchar(255) DEFAULT 'pending' NOT NULL,
	"errorMessage" text,
	"sentAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"fullName" varchar(255),
	"phoneNumber" varchar(20),
	"companyName" varchar(255),
	"jobTitle" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generatedDocuments" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"templateCode" varchar(100) NOT NULL,
	"outputHtml" text,
	"outputText" text,
	"lang" varchar(255) DEFAULT 'ar',
	"inputData" text,
	"companyLogo" text,
	"companyName" varchar(255),
	"isSaved" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generatedLetters" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"letterType" varchar(100),
	"content" text,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrCases" (
	"id" serial PRIMARY KEY NOT NULL,
	"companyId" integer NOT NULL,
	"createdBy" integer NOT NULL,
	"assignedTo" integer,
	"title" varchar(255),
	"description" text,
	"caseType" varchar(255),
	"priority" varchar(255),
	"status" varchar(255),
	"relatedEmployeeId" integer,
	"attachments" text,
	"resolution" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"resolvedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "individualHRs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"fullName" varchar(255),
	"phoneNumber" varchar(20),
	"specialization" varchar(100),
	"experienceYears" integer,
	"certifications" text,
	"subscriptionStatus" varchar(255),
	"subscriptionStartDate" date,
	"subscriptionEndDate" date,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviewSchedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicationId" integer NOT NULL,
	"interviewType" varchar(255),
	"scheduledAt" timestamp,
	"duration" integer,
	"location" varchar(255),
	"meetingLink" varchar(500),
	"interviewers" text,
	"status" varchar(255),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobApplications" (
	"id" serial PRIMARY KEY NOT NULL,
	"jobId" integer NOT NULL,
	"candidateId" integer NOT NULL,
	"status" varchar(255),
	"cvUrl" text,
	"coverLetter" text,
	"appliedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"companyId" integer NOT NULL,
	"title" varchar(255),
	"titleEn" varchar(255),
	"description" text,
	"requirements" text,
	"responsibilities" text,
	"employmentType" varchar(255),
	"experienceLevel" varchar(255),
	"educationLevel" varchar(100),
	"salaryMin" integer,
	"salaryMax" integer,
	"currency" varchar(3) DEFAULT 'SAR',
	"location" varchar(255),
	"remoteOption" boolean DEFAULT false,
	"benefits" text,
	"status" varchar(255),
	"publishedAt" timestamp,
	"closedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notificationPreferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"inAppEnabled" boolean DEFAULT true NOT NULL,
	"emailEnabled" boolean DEFAULT true NOT NULL,
	"pushEnabled" boolean DEFAULT false NOT NULL,
	"smsEnabled" boolean DEFAULT false NOT NULL,
	"notifyOnBooking" boolean DEFAULT true NOT NULL,
	"notifyOnResponse" boolean DEFAULT true NOT NULL,
	"notifyOnReminder" boolean DEFAULT true NOT NULL,
	"notifyOnPromotion" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notificationPreferences_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"type" varchar(255) DEFAULT 'system' NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"link" varchar(500),
	"icon" varchar(50),
	"metadata" jsonb,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passwords" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"resetToken" varchar(255),
	"resetTokenExpiry" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "passwords_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'SAR' NOT NULL,
	"status" varchar(255) DEFAULT 'pending' NOT NULL,
	"paymentMethod" varchar(255),
	"gateway" varchar(255) NOT NULL,
	"gatewayPaymentId" varchar(255),
	"gatewayResponse" text,
	"description" text,
	"itemType" varchar(255),
	"itemId" integer,
	"discountCodeId" integer,
	"discountAmount" integer DEFAULT 0,
	"finalAmount" integer NOT NULL,
	"refundedAmount" integer DEFAULT 0,
	"refundedAt" timestamp,
	"paidAt" timestamp,
	"failedAt" timestamp,
	"errorMessage" text,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"permissionLevel" varchar(255),
	"canUseCalculators" boolean DEFAULT false,
	"canGenerateLetters" boolean DEFAULT false,
	"canAccessATS" boolean DEFAULT false,
	"canManageCases" boolean DEFAULT false,
	"canViewReports" boolean DEFAULT false,
	"canManageTeam" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipelineStages" (
	"id" serial PRIMARY KEY NOT NULL,
	"companyId" integer NOT NULL,
	"name" varchar(100),
	"nameEn" varchar(100),
	"orderIndex" integer,
	"color" varchar(7),
	"isDefault" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processingActivities" (
	"id" serial PRIMARY KEY NOT NULL,
	"controllerId" integer,
	"purpose" varchar(255) NOT NULL,
	"dataCategories" text,
	"legalBasis" varchar(100) NOT NULL,
	"recipients" text,
	"retentionPeriod" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retentionLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource" varchar(100) NOT NULL,
	"recordsDeleted" integer NOT NULL,
	"executedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retentionPolicies" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource" varchar(100) NOT NULL,
	"retentionDays" integer NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "retentionPolicies_resource_unique" UNIQUE("resource")
);
--> statement-breakpoint
CREATE TABLE "securityIncidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"detectedAt" timestamp NOT NULL,
	"reportedToSdaiaAt" timestamp,
	"reportedToUsersAt" timestamp,
	"description" text NOT NULL,
	"cause" text,
	"affectedDataCategories" text,
	"affectedUsersCount" integer,
	"riskLevel" varchar(255) NOT NULL,
	"status" varchar(255) DEFAULT 'new' NOT NULL,
	"isLate" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smsLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"toPhone" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(255) DEFAULT 'pending' NOT NULL,
	"errorMessage" text,
	"sentAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specializations" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"nameAr" varchar(255) NOT NULL,
	"nameEn" varchar(255) NOT NULL,
	"descriptionAr" text,
	"descriptionEn" text,
	"icon" varchar(100),
	"imageUrl" text,
	"color" varchar(20),
	"isActive" boolean DEFAULT true NOT NULL,
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "specializations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"planType" varchar(255),
	"status" varchar(255),
	"startDate" date,
	"endDate" date,
	"price" integer,
	"paymentMethod" varchar(50),
	"autoRenew" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"caseId" integer,
	"createdBy" integer NOT NULL,
	"assignedTo" integer,
	"title" varchar(255),
	"description" text,
	"dueDate" date,
	"priority" varchar(255),
	"status" varchar(255),
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"titleAr" varchar(255) NOT NULL,
	"titleEn" varchar(255),
	"category" varchar(100),
	"placeholdersSchema" text,
	"aiPrompt" text,
	"defaultContent" text,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "templates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "usageEvents" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"eventType" varchar(100) NOT NULL,
	"payloadJson" text,
	"ipAddress" varchar(45),
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userConsents" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"policyVersion" varchar(50) NOT NULL,
	"consentedAt" timestamp DEFAULT now() NOT NULL,
	"withdrawnAt" timestamp,
	"ipAddress" varchar(45),
	"userAgent" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64),
	"name" text,
	"email" varchar(320),
	"phoneNumber" varchar(20),
	"loginMethod" varchar(64),
	"profilePicture" text,
	"role" varchar(255) DEFAULT 'user' NOT NULL,
	"userType" varchar(255),
	"emailVerified" boolean DEFAULT false,
	"profileCompleted" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
