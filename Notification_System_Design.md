# Stage 1

## Notification System Design

### 1. Priority Scoring Logic
We rank notifications by combining category weights and their timestamps.
Category Weights:
- Placement = 3
- Result = 2
- Event = 1

Scoring Formula:
Score = (Weight * 86400) + TimestampSeconds

Why 86400?
86400 is the number of seconds in a day. Using this as a multiplier makes a 1-level category difference (like Event vs Result) worth exactly 24 hours of recency. A placement notification will sit above a result notification unless the placement is older than a day.

### 2. Algorithmic Efficiency (Top 10)
For local client-side sorting where the list is small (N <= 100), sorting the array using a standard sort() is the simplest and safest approach.
However, in a production environment with a large notification stream:
- Naive sorting of the entire array whenever a new item arrives takes O(N log N) time, which is slow.
- Using a Min-Heap of size 10 is much more efficient. For each incoming item, we compare it to the root (the lowest score in the heap). If the new score is higher, we swap them and reheapify. This only takes O(log 10) time, which is extremely fast and uses minimal memory.
