package service

import (
	"testing"
	"time"
)

func TestAuthServiceRemovesExpiredLockout(t *testing.T) {
	svc := &authService{
		attempts: map[string]*loginAttempt{
			"locked@example.com": {
				count:         maxLoginAttempts,
				lockedAt:      time.Now().Add(-lockoutDuration - time.Second),
				lastAttemptAt: time.Now().Add(-lockoutDuration - time.Second),
			},
		},
	}

	if svc.isAccountLocked("locked@example.com") {
		t.Fatal("expected expired lockout to be cleared")
	}

	if _, exists := svc.attempts["locked@example.com"]; exists {
		t.Fatal("expected expired lockout record to be removed")
	}
}

func TestAuthServiceCleansExpiredAttemptsOnFailure(t *testing.T) {
	svc := &authService{
		attempts: map[string]*loginAttempt{
			"stale@example.com": {
				count:         1,
				lastAttemptAt: time.Now().Add(-attemptRetentionTTL - time.Second),
			},
		},
	}

	svc.recordFailedAttempt("fresh@example.com")

	if _, exists := svc.attempts["stale@example.com"]; exists {
		t.Fatal("expected stale attempt record to be removed")
	}

	attempt, exists := svc.attempts["fresh@example.com"]
	if !exists {
		t.Fatal("expected fresh attempt record to be created")
	}

	if attempt.count != 1 {
		t.Fatalf("expected attempt count 1, got %d", attempt.count)
	}

	if attempt.lastAttemptAt.IsZero() {
		t.Fatal("expected last attempt timestamp to be recorded")
	}
}

func TestAuthServiceNormalizesAttemptEmail(t *testing.T) {
	svc := &authService{attempts: make(map[string]*loginAttempt)}

	svc.recordFailedAttempt(" Admin@Example.com ")
	svc.recordFailedAttempt("admin@example.com")

	if len(svc.attempts) != 1 {
		t.Fatalf("expected one normalized attempt bucket, got %d", len(svc.attempts))
	}

	attempt, exists := svc.attempts["admin@example.com"]
	if !exists {
		t.Fatal("expected normalized email key")
	}

	if attempt.count != 2 {
		t.Fatalf("expected merged attempt count 2, got %d", attempt.count)
	}
}
