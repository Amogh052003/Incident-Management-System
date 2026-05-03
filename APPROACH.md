# Development Approach

This project was designed and implemented without relying on predefined prompts.
The approach followed a structured system design process:

## Problem Understanding
The system needs to:
- Handle high-throughput signal ingestion
- Prevent overload during bursts
- Provide real-time dashboard visibility
- Maintain strong consistency for workflow transitions

## Design Strategy

### 1. Decouple ingestion from processing
Signals are first accepted by the API and pushed to a Redis queue.
This ensures low latency at the ingestion layer.

### 2. Asynchronous processing
Worker processes consume signals from the queue and handle:
- Work item creation
- Signal storage
- Cache updates

### 3. Data separation
Different datastores are used based on access patterns:
- MongoDB → raw signals (high volume, flexible schema)
- PostgreSQL → structured work items (transactional)
- Redis → caching and queue

### 4. Backpressure handling
- Redis queue buffers spikes
- Rate limiter protects API from overload

### 5. UI optimization
Dashboard reads from Redis instead of querying databases directly,
ensuring fast refresh cycles.

## Iteration & Debugging

During development, issues such as cache inconsistency were identified and resolved by:
- Analyzing stale data behavior
- Implementing centralized cache invalidation

## Conclusion

The system was built incrementally, focusing on scalability,
fault tolerance, and real-world incident management behavior.