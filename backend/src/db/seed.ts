import { db } from './schema';

interface SeedTopic {
  name: string;
  description: string;
  estimated_hours: number;
  resources: { title: string; url: string; type: 'video' | 'article' | 'practice' | 'course' }[];
  children?: SeedTopic[];
}

interface SeedTrack {
  name: string;
  type: 'faang' | 'mid' | 'startup';
  company: string;
  icon: string;
  topics: SeedTopic[];
}

const SEED_DATA: SeedTrack[] = [
  // ─── FAANG TRACK ───────────────────────────────────────────────
  {
    name: 'Google', type: 'faang', company: 'Google', icon: '🔵',
    topics: [
      {
        name: 'Data Structures & Algorithms', description: 'Core DSA topics tested at Google',
        estimated_hours: 40,
        resources: [
          { title: 'NeetCode 150 Roadmap', url: 'https://neetcode.io/roadmap', type: 'practice' },
          { title: 'LeetCode Problem Set', url: 'https://leetcode.com/problemset/', type: 'practice' },
        ],
        children: [
          {
            name: 'Arrays & Hashing', description: 'Two sum patterns, prefix sums, frequency maps',
            estimated_hours: 4,
            resources: [
              { title: 'NeetCode – Arrays & Hashing', url: 'https://neetcode.io/roadmap', type: 'video' },
              { title: 'LeetCode Arrays Tag', url: 'https://leetcode.com/tag/array/', type: 'practice' },
            ]
          },
          {
            name: 'Two Pointers', description: 'Opposite ends, fast/slow, pair problems',
            estimated_hours: 3,
            resources: [
              { title: 'NeetCode – Two Pointers', url: 'https://neetcode.io/roadmap', type: 'video' },
            ]
          },
          {
            name: 'Sliding Window', description: 'Fixed and variable window techniques',
            estimated_hours: 3,
            resources: [
              { title: 'NeetCode – Sliding Window', url: 'https://neetcode.io/roadmap', type: 'video' },
            ]
          },
          {
            name: 'Binary Search', description: 'Classic search, search space reduction',
            estimated_hours: 3,
            resources: [
              { title: 'NeetCode – Binary Search', url: 'https://neetcode.io/roadmap', type: 'video' },
              { title: 'GeeksforGeeks Binary Search', url: 'https://www.geeksforgeeks.org/binary-search/', type: 'article' },
            ]
          },
          {
            name: 'Linked Lists', description: 'Reversal, cycle detection, merge k lists',
            estimated_hours: 4,
            resources: [
              { title: 'NeetCode – Linked Lists', url: 'https://neetcode.io/roadmap', type: 'video' },
              { title: 'William Fiset – Linked Lists', url: 'https://www.youtube.com/@WilliamFiset-videos', type: 'video' },
            ]
          },
          {
            name: 'Trees', description: 'DFS, BFS, height, diameter, path problems',
            estimated_hours: 6,
            resources: [
              { title: 'NeetCode – Trees', url: 'https://neetcode.io/roadmap', type: 'video' },
              { title: 'William Fiset – Tree Algorithms', url: 'https://www.youtube.com/@WilliamFiset-videos', type: 'video' },
            ]
          },
          {
            name: 'Graphs', description: 'DFS/BFS, topological sort, Dijkstra, Union-Find',
            estimated_hours: 8,
            resources: [
              { title: 'NeetCode – Graphs', url: 'https://neetcode.io/roadmap', type: 'video' },
              { title: 'William Fiset – Graph Theory', url: 'https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH72HFL1Km93P', type: 'video' },
            ]
          },
          {
            name: 'Dynamic Programming', description: '1D, 2D DP, memoization, tabulation patterns',
            estimated_hours: 10,
            resources: [
              { title: 'NeetCode – Dynamic Programming', url: 'https://neetcode.io/roadmap', type: 'video' },
              { title: 'Grind 75 – DP Problems', url: 'https://www.techinterviewhandbook.org/grind75/', type: 'practice' },
            ]
          },
          {
            name: 'Heaps & Priority Queues', description: 'Min/max heaps, kth element, merge streams',
            estimated_hours: 3,
            resources: [
              { title: 'NeetCode – Heap / Priority Queue', url: 'https://neetcode.io/roadmap', type: 'video' },
            ]
          },
          {
            name: 'Bit Manipulation', description: 'XOR tricks, bit masks, counting bits',
            estimated_hours: 2,
            resources: [
              { title: 'NeetCode – Bit Manipulation', url: 'https://neetcode.io/roadmap', type: 'video' },
            ]
          },
        ]
      },
      {
        name: 'System Design', description: 'Large-scale distributed system design for Google',
        estimated_hours: 20,
        resources: [
          { title: 'ByteByteGo System Design', url: 'https://bytebytego.com/', type: 'course' },
          { title: 'karanpratapsingh/system-design (free)', url: 'https://github.com/karanpratapsingh/system-design', type: 'article' },
        ],
        children: [
          {
            name: 'Fundamentals', description: 'Scalability, CAP theorem, consistency models',
            estimated_hours: 4,
            resources: [
              { title: 'System Design Fundamentals – DesignGurus', url: 'https://www.designgurus.io/blog/system-design-interview-fundamentals', type: 'article' },
            ]
          },
          {
            name: 'Caching', description: 'Redis, Memcached, cache invalidation strategies',
            estimated_hours: 3,
            resources: [
              { title: 'Caching – ByteByteGo', url: 'https://bytebytego.com/', type: 'course' },
              { title: 'Caching Concepts – GeeksforGeeks', url: 'https://www.geeksforgeeks.org/caching-system-design-concept-for-beginners/', type: 'article' },
            ]
          },
          {
            name: 'Databases & Scaling', description: 'Sharding, replication, SQL vs NoSQL',
            estimated_hours: 4,
            resources: [
              { title: 'Grokking System Design', url: 'https://www.designgurus.io/course/grokking-the-system-design-interview', type: 'course' },
            ]
          },
          {
            name: 'Load Balancing & CDN', description: 'Layer 4/7, round robin, consistent hashing',
            estimated_hours: 2,
            resources: [
              { title: 'ByteByteGo – Load Balancing', url: 'https://bytebytego.com/', type: 'course' },
            ]
          },
          {
            name: 'Message Queues', description: 'Kafka, RabbitMQ, pub-sub patterns',
            estimated_hours: 3,
            resources: [
              { title: 'ByteByteGo – Message Queues', url: 'https://bytebytego.com/', type: 'course' },
            ]
          },
          {
            name: 'Microservices', description: 'Service decomposition, API gateway, service mesh',
            estimated_hours: 4,
            resources: [
              { title: 'Microservices Guide – Martin Fowler', url: 'https://martinfowler.com/articles/microservices.html', type: 'article' },
            ]
          },
        ]
      },
      {
        name: 'Behavioral', description: 'Google behavioral interviews using STAR method',
        estimated_hours: 5,
        resources: [
          { title: 'STAR Method Guide', url: 'https://interviewsteps.com/blogs/news/amazon-star-method', type: 'article' },
        ],
        children: [
          {
            name: 'Googleyness & Leadership', description: 'Comfort with ambiguity, collaboration, inclusive behavior',
            estimated_hours: 2,
            resources: [
              { title: 'Google Interviews Handbook', url: 'https://www.techinterviewhandbook.org/behavioral-interview/', type: 'article' },
            ]
          },
          {
            name: 'STAR Stories (5 core)', description: 'Prepare 5 strong STAR stories covering impact, conflict, failure, leadership, innovation',
            estimated_hours: 3,
            resources: [
              { title: 'STAR Method – Exponent', url: 'https://www.tryexponent.com/blog/how-to-nail-amazons-behavioral-interview-questions', type: 'article' },
            ]
          },
        ]
      }
    ]
  },
  {
    name: 'Meta', type: 'faang', company: 'Meta', icon: '🔷',
    topics: [
      {
        name: 'Coding (DSA)', description: 'Meta focuses heavily on medium-hard LeetCode style problems',
        estimated_hours: 30,
        resources: [
          { title: 'Blind 75 Problems', url: 'https://neetcode.io/practice/blind75', type: 'practice' },
          { title: 'NeetCode 150', url: 'https://neetcode.io/', type: 'practice' },
        ],
        children: [
          {
            name: 'Top Meta LeetCode Questions', description: 'Frequently asked Meta-specific problems',
            estimated_hours: 8,
            resources: [
              { title: 'LeetCode Meta Tag', url: 'https://leetcode.com/company/facebook/', type: 'practice' },
              { title: 'Grind 75 Customizable', url: 'https://www.techinterviewhandbook.org/grind75/', type: 'practice' },
            ]
          },
          {
            name: 'String Manipulation', description: 'Palindromes, anagrams, parsing patterns',
            estimated_hours: 4,
            resources: [
              { title: 'NeetCode – Strings', url: 'https://neetcode.io/roadmap', type: 'video' },
            ]
          },
          {
            name: 'Recursion & Backtracking', description: 'Permutations, combinations, n-queens',
            estimated_hours: 5,
            resources: [
              { title: 'NeetCode – Backtracking', url: 'https://neetcode.io/roadmap', type: 'video' },
              { title: 'Back To Back SWE – Recursion', url: 'https://backtobackswe.com/', type: 'video' },
            ]
          },
        ]
      },
      {
        name: 'System Design', description: 'Design social network scale systems',
        estimated_hours: 15,
        resources: [
          { title: 'ByteByteGo – Design Facebook/Instagram', url: 'https://bytebytego.com/', type: 'course' },
        ],
        children: [
          {
            name: 'News Feed Design', description: 'Fan-out, ranking, pagination at scale',
            estimated_hours: 4,
            resources: [
              { title: 'Grokking – Design News Feed', url: 'https://www.designgurus.io/course/grokking-the-system-design-interview', type: 'course' },
            ]
          },
          {
            name: 'Messenger / Chat System', description: 'WebSockets, message delivery guarantees',
            estimated_hours: 4,
            resources: [
              { title: 'ByteByteGo – Design Chat System', url: 'https://bytebytego.com/', type: 'course' },
            ]
          },
        ]
      },
      {
        name: 'Behavioral', description: 'Meta core values: Move fast, be bold, focus on impact',
        estimated_hours: 4,
        resources: [
          { title: 'Meta Interview Values', url: 'https://www.techinterviewhandbook.org/behavioral-interview/', type: 'article' },
          { title: 'STAR Method – Exponent', url: 'https://www.tryexponent.com/blog/how-to-nail-amazons-behavioral-interview-questions', type: 'article' },
        ]
      },
    ]
  },
  {
    name: 'Amazon', type: 'faang', company: 'Amazon', icon: '🟠',
    topics: [
      {
        name: 'Leadership Principles', description: 'Amazon\'s 16 LPs – the backbone of all Amazon interviews',
        estimated_hours: 12,
        resources: [
          { title: 'Amazon LP Deep Dive – DesignGurus', url: 'https://www.designgurus.io/blog/amazon-leadership-principles-behavioral-interview', type: 'article' },
          { title: 'Community LP Notes (GitHub)', url: 'https://github.com/tombetthauser/amazon-behavioral-interview', type: 'article' },
          { title: 'Amazon LP Interview Questions – Exponent', url: 'https://www.tryexponent.com/blog/how-to-nail-amazons-behavioral-interview-questions', type: 'article' },
        ],
        children: [
          { name: 'Customer Obsession', description: 'Stories showing you start with the customer', estimated_hours: 1, resources: [] },
          { name: 'Ownership', description: 'Acting beyond your direct role', estimated_hours: 1, resources: [] },
          { name: 'Invent & Simplify', description: 'Innovative solutions and simplification', estimated_hours: 1, resources: [] },
          { name: 'Are Right, A Lot', description: 'Good judgment and data-driven decisions', estimated_hours: 1, resources: [] },
          { name: 'Learn & Be Curious', description: 'Self-improvement and domain exploration', estimated_hours: 1, resources: [] },
          { name: 'Hire & Develop the Best', description: 'Raising the bar, mentorship', estimated_hours: 1, resources: [] },
          { name: 'Insist on Highest Standards', description: 'Quality bar and raising it', estimated_hours: 1, resources: [] },
          { name: 'Think Big', description: 'Bold direction, inspire results', estimated_hours: 1, resources: [] },
          { name: 'Bias for Action', description: 'Speed, calculated risk-taking', estimated_hours: 1, resources: [] },
          { name: 'Frugality', description: 'Accomplish more with less', estimated_hours: 1, resources: [] },
          { name: 'Earn Trust', description: 'Candor, respecting others', estimated_hours: 1, resources: [] },
          { name: 'Dive Deep', description: 'Operating at all levels, detail-oriented', estimated_hours: 1, resources: [] },
        ]
      },
      {
        name: 'Coding (DSA)', description: 'Amazon focuses on medium difficulty with LP alignment',
        estimated_hours: 20,
        resources: [
          { title: 'LeetCode Amazon Tag', url: 'https://leetcode.com/company/amazon/', type: 'practice' },
          { title: 'Grind 75', url: 'https://www.techinterviewhandbook.org/grind75/', type: 'practice' },
        ]
      },
      {
        name: 'System Design', description: 'Large-scale e-commerce and AWS system design',
        estimated_hours: 15,
        resources: [
          { title: 'Grokking System Design', url: 'https://www.designgurus.io/course/grokking-the-system-design-interview', type: 'course' },
          { title: 'ByteByteGo Course', url: 'https://bytebytego.com/', type: 'course' },
        ]
      },
    ]
  },
  {
    name: 'Microsoft', type: 'faang', company: 'Microsoft', icon: '🪟',
    topics: [
      {
        name: 'Coding (DSA)', description: 'Microsoft favors medium difficulty, often object-oriented problems',
        estimated_hours: 25,
        resources: [
          { title: 'LeetCode Microsoft Tag', url: 'https://leetcode.com/company/microsoft/', type: 'practice' },
          { title: 'NeetCode 150', url: 'https://neetcode.io/', type: 'practice' },
        ]
      },
      {
        name: 'System Design', description: 'Design cloud-scale systems (Azure, Office 365 scale)',
        estimated_hours: 12,
        resources: [
          { title: 'karanpratapsingh/system-design', url: 'https://github.com/karanpratapsingh/system-design', type: 'article' },
          { title: 'ByteByteGo', url: 'https://bytebytego.com/', type: 'course' },
        ]
      },
      {
        name: 'Behavioral', description: 'Growth mindset, collaboration, impact-focused stories',
        estimated_hours: 4,
        resources: [
          { title: 'Tech Interview Handbook – Behavioral', url: 'https://www.techinterviewhandbook.org/behavioral-interview/', type: 'article' },
        ]
      },
    ]
  },

  // ─── MID-TIER TRACK ────────────────────────────────────────────
  {
    name: 'Stripe', type: 'mid', company: 'Stripe', icon: '💳',
    topics: [
      {
        name: 'Coding (DSA)', description: 'Stripe focuses on practical coding and medium difficulty problems',
        estimated_hours: 20,
        resources: [
          { title: 'Grind 75 – Customizable', url: 'https://www.techinterviewhandbook.org/grind75/', type: 'practice' },
          { title: 'LeetCode Stripe Tag', url: 'https://leetcode.com/company/stripe/', type: 'practice' },
        ]
      },
      {
        name: 'API Design', description: 'RESTful API design, idempotency, error handling patterns',
        estimated_hours: 6,
        resources: [
          { title: 'Stripe API Design Principles', url: 'https://stripe.com/docs/api', type: 'article' },
          { title: 'RESTful API Design Best Practices', url: 'https://www.geeksforgeeks.org/rest-api-introduction/', type: 'article' },
        ]
      },
      {
        name: 'Payments & Distributed Systems', description: 'Idempotency, consistency, financial transaction systems',
        estimated_hours: 8,
        resources: [
          { title: 'Designing Distributed Systems', url: 'https://github.com/karanpratapsingh/system-design', type: 'article' },
        ]
      },
    ]
  },
  {
    name: 'Airbnb', type: 'mid', company: 'Airbnb', icon: '🏠',
    topics: [
      {
        name: 'Coding (DSA)', description: 'Full-stack focus, front-to-back coding challenges',
        estimated_hours: 18,
        resources: [
          { title: 'LeetCode Airbnb Tag', url: 'https://leetcode.com/company/airbnb/', type: 'practice' },
          { title: 'Grind 75', url: 'https://www.techinterviewhandbook.org/grind75/', type: 'practice' },
        ]
      },
      {
        name: 'System Design', description: 'Search, booking systems, availability calendars',
        estimated_hours: 10,
        resources: [
          { title: 'Grokking – Design Airbnb/Booking System', url: 'https://www.designgurus.io/course/grokking-the-system-design-interview', type: 'course' },
        ]
      },
      {
        name: 'Frontend Engineering', description: 'React, accessibility, performance, component design',
        estimated_hours: 8,
        resources: [
          { title: 'Frontend Interview Handbook', url: 'https://www.frontendinterviewhandbook.com/', type: 'article' },
        ]
      },
    ]
  },
  {
    name: 'Uber', type: 'mid', company: 'Uber', icon: '🚗',
    topics: [
      {
        name: 'Coding (DSA)', description: 'Geo algorithms, graph problems, medium-hard DSA',
        estimated_hours: 20,
        resources: [
          { title: 'LeetCode Uber Tag', url: 'https://leetcode.com/company/uber/', type: 'practice' },
          { title: 'William Fiset – Graph Algorithms', url: 'https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH72HFL1Km93P', type: 'video' },
        ]
      },
      {
        name: 'System Design', description: 'Real-time ride matching, surge pricing, geospatial indexing',
        estimated_hours: 12,
        resources: [
          { title: 'ByteByteGo – Design Uber', url: 'https://bytebytego.com/', type: 'course' },
          { title: 'Grokking System Design', url: 'https://www.designgurus.io/course/grokking-the-system-design-interview', type: 'course' },
        ]
      },
    ]
  },

  // ─── STARTUP TRACK ─────────────────────────────────────────────
  {
    name: 'Startup General', type: 'startup', company: 'Startups', icon: '🚀',
    topics: [
      {
        name: 'Generalist DSA', description: 'Broad DSA preparation suitable for startups',
        estimated_hours: 15,
        resources: [
          { title: 'Blind 75 Problems', url: 'https://neetcode.io/practice/blind75', type: 'practice' },
          { title: 'Grind 75', url: 'https://www.techinterviewhandbook.org/grind75/', type: 'practice' },
        ]
      },
      {
        name: 'Full-Stack Fundamentals', description: 'Frontend + Backend, databases, APIs',
        estimated_hours: 10,
        resources: [
          { title: 'CS Fundamentals Roadmap', url: 'https://roadmap.sh/backend', type: 'article' },
        ]
      },
      {
        name: 'CS Fundamentals', description: 'OS, Networking, Databases — common at startups',
        estimated_hours: 8,
        resources: [
          { title: 'CS Fundamentals – GeeksforGeeks', url: 'https://www.geeksforgeeks.org/operating-systems/', type: 'article' },
        ],
        children: [
          {
            name: 'Operating Systems', description: 'Processes, threads, memory management, scheduling',
            estimated_hours: 3,
            resources: [
              { title: 'OS Concepts – GeeksforGeeks', url: 'https://www.geeksforgeeks.org/operating-systems/', type: 'article' },
            ]
          },
          {
            name: 'Networking', description: 'TCP/IP, HTTP/HTTPS, DNS, CDN fundamentals',
            estimated_hours: 3,
            resources: [
              { title: 'Computer Networks – GeeksforGeeks', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/', type: 'article' },
            ]
          },
          {
            name: 'Databases', description: 'SQL, indexing, transactions, ACID properties',
            estimated_hours: 2,
            resources: [
              { title: 'SQL Tutorial – LeetCode', url: 'https://leetcode.com/study-plan/sql/', type: 'practice' },
            ]
          },
        ]
      },
      {
        name: 'Behavioral', description: 'Culture fit, motivation, problem-solving approach',
        estimated_hours: 3,
        resources: [
          { title: 'Behavioral Interview Guide', url: 'https://www.techinterviewhandbook.org/behavioral-interview/', type: 'article' },
        ]
      },
    ]
  },
];

function insertTopics(topics: SeedTopic[], trackId: number, parentId: number | null, order: number): void {
  topics.forEach((topic, idx) => {
    const result = db.prepare(`
      INSERT INTO topics (track_id, parent_id, name, description, sort_order, estimated_hours)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(trackId, parentId, topic.name, topic.description, order + idx, topic.estimated_hours);

    const topicId = result.lastInsertRowid as number;

    // Insert resources for this topic
    topic.resources.forEach(r => {
      db.prepare(`
        INSERT INTO resources (topic_id, title, url, type) VALUES (?, ?, ?, ?)
      `).run(topicId, r.title, r.url, r.type);
    });

    // Recurse children
    if (topic.children?.length) {
      insertTopics(topic.children, trackId, topicId, 0);
    }
  });
}

export function seedIfEmpty() {
  const count = (db.prepare('SELECT COUNT(*) as c FROM tracks').get() as { c: number }).c;
  if (count > 0) return;

  console.log('Seeding database with SDE prep roadmap...');

  SEED_DATA.forEach((track, trackIdx) => {
    const result = db.prepare(`
      INSERT INTO tracks (name, type, company, icon, sort_order) VALUES (?, ?, ?, ?, ?)
    `).run(track.name, track.type, track.company, track.icon, trackIdx);

    const trackId = result.lastInsertRowid as number;
    insertTopics(track.topics, trackId, null, 0);
  });

  console.log('Seed complete: inserted', SEED_DATA.length, 'tracks with topics and resources.');
}
