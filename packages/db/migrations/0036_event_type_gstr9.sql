-- Migration 0036: event_type enum gains gstr9_generated

ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'gstr9_generated';--> statement-breakpoint
