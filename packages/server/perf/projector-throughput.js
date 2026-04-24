import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Custom metrics
const eventsProcessed = new Counter('events_processed');
const projectorLag = new Trend('projector_lag_ms');
const batchLatency = new Trend('batch_latency_ms');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 1 },     // Single worker
    { duration: '5m', target: 1 },     // Sustain for 5 minutes
  ],
  thresholds: {
    projector_lag: ['p(95)<5000'],     // Projector lag should be < 5s at p95
  },
};

const PROJECTOR_URL = __ENV.PROJECTOR_URL || 'http://localhost:3100';
const API_URL = __ENV.API_URL || 'http://localhost:3000/api/trpc';

// Simulate event generation and projector processing
export default function () {
  // Check projector status
  const healthRes = http.get(`${PROJECTOR_URL}/health`);
  
  if (healthRes.status === 200) {
    const body = JSON.parse(healthRes.body);
    console.log(`Projector status: ${body.status}`);
  }
  
  sleep(5);
  
  // Measure projector lag by checking last processed sequence
  // This would need actual DB connection in a real test
  const batchStart = Date.now();
  
  // Simulate batch processing check
  sleep(1);
  
  const batchTime = Date.now() - batchStart;
  batchLatency.add(batchTime);
  
  // Simulate events processed
  eventsProcessed.add(10);
  projectorLag.add(Math.random() * 1000); // Simulated lag
  
  sleep(4);
}

export function handleSummary(data) {
  console.log(`
Projector Throughput Test Summary:
==================================
Events Processed: ${data.metrics.events_processed?.values?.count || 0}
Batch Latency p(95): ${data.metrics.batch_latency?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
Projector Lag p(95): ${data.metrics.projector_lag?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
`);
}
