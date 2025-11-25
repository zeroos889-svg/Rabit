-- Performance Optimization: Database Indexes
-- Created: 2025-11-25
-- Purpose: Add indexes to frequently queried columns for better performance
-- MySQL compatible syntax

-- Consultants table indexes
CREATE INDEX idx_consultants_status ON consultants(status);
CREATE INDEX idx_consultants_user_id ON consultants(userId);
CREATE INDEX idx_consultants_hourly_rate ON consultants(hourlyRate);
CREATE INDEX idx_consultants_created_at ON consultants(createdAt);

-- Consultation Bookings indexes
CREATE INDEX idx_bookings_client_id ON consultationBookings(clientId);
CREATE INDEX idx_bookings_consultant_id ON consultationBookings(consultantId);
CREATE INDEX idx_bookings_status ON consultationBookings(status);
CREATE INDEX idx_bookings_scheduled_date ON consultationBookings(scheduledDate);
CREATE INDEX idx_bookings_created_at ON consultationBookings(createdAt);

-- Consultant Reviews indexes
CREATE INDEX idx_reviews_consultant_id ON consultantReviews(consultantId);
CREATE INDEX idx_reviews_booking_id ON consultantReviews(bookingId);
CREATE INDEX idx_reviews_client_id ON consultantReviews(clientId);
CREATE INDEX idx_reviews_rating ON consultantReviews(rating);

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Sessions table indexes
CREATE INDEX idx_sessions_user_id ON sessions(userId);
CREATE INDEX idx_sessions_expires_at ON sessions(expiresAt);

-- Companies table indexes
CREATE INDEX idx_companies_user_id ON companies(userId);
CREATE INDEX idx_companies_industry ON companies(industry);

-- Composite indexes for common query patterns
CREATE INDEX idx_bookings_consultant_status ON consultationBookings(consultantId, status);
CREATE INDEX idx_bookings_client_status ON consultationBookings(clientId, status);
CREATE INDEX idx_consultants_status_rating ON consultants(status, averageRating);
