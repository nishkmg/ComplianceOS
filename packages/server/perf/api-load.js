import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency_ms');
const projectorLatency = new Trend('projector_latency_ms');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '3m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 100 },  // Spike to 100 users
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should complete below 500ms
    errors: ['rate<0.01'],              // Error rate should be less than 1%
    api_latency: ['p(95)<300'],         // API latency p95 < 300ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/trpc`;

// Authentication setup
function login() {
  const res = http.post(`${BASE_URL}/api/auth/callback/credentials`, {
    email: 'demo@complianceos.test',
    password: 'demo123',
    redirect: 'false',
  });
  
  check(res, {
    'login successful': (r) => r.status === 302 || r.status === 200,
  });
  
  return res.cookies;
}

// Test scenarios
export default function () {
  const cookies = login();
  
  // Test 1: Health endpoint
  const healthStart = Date.now();
  const healthRes = http.get(`${BASE_URL}/api/health`);
  apiLatency.add(Date.now() - healthStart);
  
  check(healthRes, {
    'health check: status 200': (r) => r.status === 200,
    'health check: db connected': (r) => {
      const body = JSON.parse(r.body);
      return body.checks?.database?.status === 'connected';
    },
  });
  
  errorRate.add(healthRes.status !== 200);
  sleep(1);
  
  // Test 2: Accounts list (authenticated)
  const accountsRes = http.get(
    `${API_URL}/accounts/list`,
    { cookies }
  );
  
  check(accountsRes, {
    'accounts list: status 200': (r) => r.status === 200,
  });
  
  errorRate.add(accountsRes.status !== 200);
  sleep(0.5);
  
  // Test 3: Fiscal years list
  const fyRes = http.get(
    `${API_URL}/fiscalYears/list`,
    { cookies }
  );
  
  check(fyRes, {
    'fiscal years list: status 200': (r) => r.status === 200,
  });
  
  errorRate.add(fyRes.status !== 200);
  sleep(0.5);
  
  // Test 4: Projector health check
  const projectorUrl = __ENV.PROJECTOR_URL || 'http://localhost:3100';
  const projectorStart = Date.now();
  const projectorRes = http.get(`${projectorUrl}/health`);
  projectorLatency.add(Date.now() - projectorStart);
  
  check(projectorRes, {
    'projector health: status 200': (r) => r.status === 200,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    './perf-results.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  const { http_req_duration, errors, api_latency_ms, projector_latency_ms } = data.metrics;
  
  return `
Performance Test Summary:
========================
HTTP Request Duration:
  p(50): ${http_req_duration?.values?.['p(50)']?.toFixed(2) || 'N/A'}ms
  p(95): ${http_req_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
  p(99): ${http_req_duration?.values?.['p(99)']?.toFixed(2) || 'N/A'}ms

API Latency:
  p(50): ${api_latency_ms?.values?.['p(50)']?.toFixed(2) || 'N/A'}ms
  p(95): ${api_latency_ms?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms

Projector Latency:
  p(50): ${projector_latency_ms?.values?.['p(50)']?.toFixed(2) || 'N/A'}ms
  p(95): ${projector_latency_ms?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms

Error Rate: ${(errors?.values?.rate || 0) * 100}%
`;
}
