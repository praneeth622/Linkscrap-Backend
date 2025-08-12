# Complete Frontend Integration Guide for LinkScrap Backend APIs

## Overview

This guide provides comprehensive instructions for integrating all 11 LinkedIn data collection APIs from your LinkScrap backend into any frontend application. The backend runs on `http://localhost:3000` and provides extensive LinkedIn data collection capabilities through BrightData integration.

## Base Configuration

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = {
  // Health Check
  health: '/health',
  
  // People Profile APIs
  peopleProfileCollect: '/linkedin/people-profile/collect',
  peopleProfileDiscover: '/linkedin/people-profile/discover',
  
  // People Search API
  peopleSearchCollect: '/linkedin/people-search-collect',
  
  // Company Information API
  companyInfoCollect: '/linkedin/company-info/collect',
  
  // Job Listing APIs
  jobListingCollect: '/linkedin/job-listing/collect',
  jobListingDiscoverKeyword: '/linkedin/job-listing/discover-keyword',
  jobListingDiscoverUrl: '/linkedin/job-listing/discover-url',
  
  // Post Collection APIs
  postCollect: '/linkedin/post-collect',
  postDiscoverCompany: '/linkedin/post-discover-company',
  postDiscoverProfile: '/linkedin/post-discover-profile',
  postDiscoverUrl: '/linkedin/post-discover-url'
};

// HTTP Client Setup (using fetch or axios)
const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
  
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },
  
  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};
```

## 1. People Profile Collection API

### Collect LinkedIn Profiles by URLs

```javascript
// Function to collect LinkedIn profiles
async function collectLinkedInProfiles(profileUrls) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.peopleProfileCollect, {
      urls: profileUrls
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status,
      instructions: response.instructions
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Check snapshot status
async function checkProfileCollectionStatus(snapshotId) {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.peopleProfileCollect}/snapshot/${snapshotId}/status`
    );
    return response;
  } catch (error) {
    throw new Error(`Failed to check status: ${error.message}`);
  }
}

// Get collected profile data
async function getProfileCollectionData(snapshotId) {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.peopleProfileCollect}/snapshot/${snapshotId}/data`
    );
    return response;
  } catch (error) {
    throw new Error(`Failed to get data: ${error.message}`);
  }
}

// Get all collected profiles
async function getAllCollectedProfiles() {
  try {
    return await apiClient.get(API_ENDPOINTS.peopleProfileCollect);
  } catch (error) {
    throw new Error(`Failed to get profiles: ${error.message}`);
  }
}

// Example usage
const profileUrls = [
  'https://www.linkedin.com/in/elad-moshe-05a90413/',
  'https://www.linkedin.com/in/jonathan-myrvik-3baa01109',
  'https://www.linkedin.com/in/aviv-tal-75b81/'
];

collectLinkedInProfiles(profileUrls)
  .then(result => {
    if (result.success) {
      console.log('Collection started:', result.snapshotId);
      // Poll for status updates
      pollForCompletion(result.snapshotId, checkProfileCollectionStatus, getProfileCollectionData);
    }
  });
```

## 2. People Profile Discovery API

### Discover LinkedIn Profiles by Search Parameters

```javascript
// Function to discover LinkedIn profiles
async function discoverLinkedInProfiles(searchParams) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.peopleProfileDiscover, {
      searches: searchParams
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status,
      searchCount: response.search_queries
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage
const searchParams = [
  {
    keyword: 'software engineer',
    location: 'San Francisco',
    current_company: 'Google',
    past_company: 'Microsoft',
    industry: 'Technology',
    school: 'Stanford University'
  },
  {
    keyword: 'product manager',
    location: 'New York',
    industry: 'Technology'
  }
];

discoverLinkedInProfiles(searchParams)
  .then(result => {
    if (result.success) {
      console.log('Discovery started:', result.snapshotId);
    }
  });
```

## 3. People Search Collection API

### Search and Collect People by Name

```javascript
// Function to search and collect people
async function searchAndCollectPeople(searchCriteria) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.peopleSearchCollect, {
      searches: searchCriteria
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status,
      searchesCount: response.searches_count
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get all collected people with pagination
async function getAllCollectedPeople(page = 1, limit = 10) {
  try {
    return await apiClient.get(
      `${API_ENDPOINTS.peopleSearchCollect}?page=${page}&limit=${limit}`
    );
  } catch (error) {
    throw new Error(`Failed to get people: ${error.message}`);
  }
}

// Search people by criteria
async function searchPeopleByCriteria(criteria) {
  try {
    const params = new URLSearchParams(criteria).toString();
    return await apiClient.get(
      `${API_ENDPOINTS.peopleSearchCollect}/search?${params}`
    );
  } catch (error) {
    throw new Error(`Failed to search people: ${error.message}`);
  }
}

// Example usage
const searchCriteria = [
  {
    url: 'https://www.linkedin.com',
    first_name: 'james',
    last_name: 'smith'
  },
  {
    url: 'https://www.linkedin.com',
    first_name: 'Lisa',
    last_name: 'Ledger'
  }
];

searchAndCollectPeople(searchCriteria)
  .then(result => {
    if (result.success) {
      console.log('People search started:', result.snapshotId);
    }
  });
```

## 4. Company Information Collection API

### Collect LinkedIn Company Information

```javascript
// Function to collect company information
async function collectCompanyInfo(companyUrls) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.companyInfoCollect, {
      urls: companyUrls
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage
const companyUrls = [
  'https://www.linkedin.com/company/microsoft',
  'https://www.linkedin.com/company/google',
  'https://www.linkedin.com/company/apple'
];

collectCompanyInfo(companyUrls)
  .then(result => {
    if (result.success) {
      console.log('Company collection started:', result.snapshotId);
    }
  });
```

## 5. Job Listing Collection API

### Collect Job Listings by URLs

```javascript
// Function to collect job listings
async function collectJobListings(jobUrls) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.jobListingCollect, {
      urls: jobUrls
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get job listing by posting ID
async function getJobByPostingId(postingId) {
  try {
    return await apiClient.get(
      `${API_ENDPOINTS.jobListingCollect}/posting/${postingId}`
    );
  } catch (error) {
    throw new Error(`Failed to get job: ${error.message}`);
  }
}

// Example usage
const jobUrls = [
  'https://www.linkedin.com/jobs/view/remote-typist-data-entry-specialist-work-from-home-at-cwa-group-4181034038',
  'https://www.linkedin.com/jobs/view/arrt-r-at-shared-imaging-llc-4180989163'
];

collectJobListings(jobUrls)
  .then(result => {
    if (result.success) {
      console.log('Job collection started:', result.snapshotId);
    }
  });
```

## 6. Job Listing Discovery by Keyword API

### Discover Jobs by Search Parameters

```javascript
// Function to discover jobs by keyword
async function discoverJobsByKeyword(searchParams) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.jobListingDiscoverKeyword, {
      searches: searchParams
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status,
      searchQueries: response.search_queries
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get jobs by keyword
async function getJobsByKeyword(keyword) {
  try {
    return await apiClient.get(
      `${API_ENDPOINTS.jobListingDiscoverKeyword}/search/keyword/${encodeURIComponent(keyword)}`
    );
  } catch (error) {
    throw new Error(`Failed to get jobs: ${error.message}`);
  }
}

// Example usage
const jobSearchParams = [
  {
    location: 'paris',
    keyword: 'product manager',
    country: 'FR',
    time_range: 'Past month',
    job_type: 'Full-time',
    experience_level: 'Mid-Senior level',
    remote: 'Remote'
  },
  {
    location: 'New York',
    keyword: 'python developer',
    experience_level: 'Entry level'
  }
];

discoverJobsByKeyword(jobSearchParams)
  .then(result => {
    if (result.success) {
      console.log('Job discovery started:', result.snapshotId);
    }
  });
```

## 7. Job Listing Discovery by URL API

### Discover Jobs from LinkedIn Job Pages

```javascript
// Function to discover jobs by URL
async function discoverJobsByUrl(jobPageUrls) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.jobListingDiscoverUrl, {
      urls: jobPageUrls
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status,
      discoveryUrls: response.discovery_urls
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get jobs by URL type
async function getJobsByUrlType(urlType) {
  try {
    return await apiClient.get(
      `${API_ENDPOINTS.jobListingDiscoverUrl}/url-type/${urlType}`
    );
  } catch (error) {
    throw new Error(`Failed to get jobs: ${error.message}`);
  }
}

// Example usage
const jobPageUrls = [
  'https://www.linkedin.com/jobs/search?keywords=Software&location=Tel%20Aviv-Yafo&geoId=101570771',
  'https://www.linkedin.com/jobs/semrush-jobs?f_C=2821922',
  'https://www.linkedin.com/jobs/reddit-inc.-jobs-worldwide?f_C=150573'
];

discoverJobsByUrl(jobPageUrls)
  .then(result => {
    if (result.success) {
      console.log('Job URL discovery started:', result.snapshotId);
    }
  });
```

## 8. Post Collection API

### Collect LinkedIn Posts and Articles

```javascript
// Function to collect LinkedIn posts
async function collectLinkedInPosts(postUrls) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.postCollect, {
      urls: postUrls
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status,
      postUrls: response.post_urls
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get posts by account type
async function getPostsByAccountType(accountType) {
  try {
    return await apiClient.get(
      `${API_ENDPOINTS.postCollect}/account-type/${accountType}`
    );
  } catch (error) {
    throw new Error(`Failed to get posts: ${error.message}`);
  }
}

// Get post by LinkedIn post ID
async function getPostByLinkedInId(postId) {
  try {
    return await apiClient.get(
      `${API_ENDPOINTS.postCollect}/post/${postId}`
    );
  } catch (error) {
    throw new Error(`Failed to get post: ${error.message}`);
  }
}

// Example usage
const postUrls = [
  'https://www.linkedin.com/posts/orlenchner_scrapecon-activity-7180537307521769472-oSYN',
  'https://www.linkedin.com/posts/karin-dodis_web-data-collection-for-businesses-bright-activity-7176601589682434049-Aakz',
  'https://www.linkedin.com/pulse/ab-test-optimisation-earlier-decisions-new-readout-de-b%C3%A9naz%C3%A9'
];

collectLinkedInPosts(postUrls)
  .then(result => {
    if (result.success) {
      console.log('Post collection started:', result.snapshotId);
    }
  });
```

## 9. Post Discovery by Company URL API

### Discover Posts from Company Pages

```javascript
// Function to discover posts by company URL
async function discoverPostsByCompany(companyUrls) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.postDiscoverCompany, {
      urls: companyUrls
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status,
      companyUrls: response.company_urls
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get posts by company name
async function getPostsByCompanyName(companyName) {
  try {
    return await apiClient.get(
      `${API_ENDPOINTS.postDiscoverCompany}/company/${encodeURIComponent(companyName)}`
    );
  } catch (error) {
    throw new Error(`Failed to get posts: ${error.message}`);
  }
}

// Example usage
const companyUrls = [
  'https://www.linkedin.com/company/microsoft',
  'https://www.linkedin.com/company/google',
  'https://www.linkedin.com/company/apple'
];

discoverPostsByCompany(companyUrls)
  .then(result => {
    if (result.success) {
      console.log('Company post discovery started:', result.snapshotId);
    }
  });
```

## 10. Post Discovery by Profile URL API

### Discover Posts from User Profiles

```javascript
// Function to discover posts by profile URL
async function discoverPostsByProfile(profileUrls) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.postDiscoverProfile, {
      urls: profileUrls
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status,
      profileUrls: response.profile_urls
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage
const profileUrls = [
  'https://www.linkedin.com/in/elad-moshe-05a90413/',
  'https://www.linkedin.com/in/jonathan-myrvik-3baa01109'
];

discoverPostsByProfile(profileUrls)
  .then(result => {
    if (result.success) {
      console.log('Profile post discovery started:', result.snapshotId);
    }
  });
```

## 11. Post Discovery by URL API

### Discover Posts from Various LinkedIn URLs

```javascript
// Function to discover posts by URL
async function discoverPostsByUrl(discoveryUrls) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.postDiscoverUrl, {
      urls: discoveryUrls
    });
    
    return {
      success: true,
      snapshotId: response.snapshot_id,
      status: response.status,
      discoveryUrls: response.discovery_urls
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage
const discoveryUrls = [
  'https://www.linkedin.com/feed/',
  'https://www.linkedin.com/company/microsoft/posts/',
  'https://www.linkedin.com/in/elad-moshe-05a90413/recent-activity/posts/'
];

discoverPostsByUrl(discoveryUrls)
  .then(result => {
    if (result.success) {
      console.log('URL post discovery started:', result.snapshotId);
    }
  });
```

## Utility Functions

### Polling for Async Operations

```javascript
// Generic polling function for async operations
async function pollForCompletion(snapshotId, statusCheckFn, dataRetrievalFn, maxAttempts = 30, interval = 10000) {
  let attempts = 0;
  
  const poll = async () => {
    try {
      attempts++;
      console.log(`Checking status (attempt ${attempts}/${maxAttempts})...`);
      
      const statusResponse = await statusCheckFn(snapshotId);
      console.log('Status:', statusResponse.status);
      
      if (statusResponse.status === 'ready' || statusResponse.status === 'completed') {
        console.log('Data is ready! Retrieving...');
        const data = await dataRetrievalFn(snapshotId);
        return data;
      } else if (statusResponse.status === 'failed' || statusResponse.status === 'error') {
        throw new Error(`Operation failed with status: ${statusResponse.status}`);
      } else if (attempts >= maxAttempts) {
        throw new Error('Maximum polling attempts reached');
      } else {
        // Continue polling
        setTimeout(poll, interval);
      }
    } catch (error) {
      console.error('Polling error:', error);
      throw error;
    }
  };
  
  return poll();
}

// Health check function
async function checkApiHealth() {
  try {
    const response = await apiClient.get(API_ENDPOINTS.health);
    return {
      healthy: true,
      response
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}
```

### Error Handling

```javascript
// Centralized error handling
function handleApiError(error, context = '') {
  console.error(`API Error ${context}:`, error);
  
  // Common error types and user-friendly messages
  const errorMessages = {
    'Network Error': 'Unable to connect to the server. Please check your internet connection.',
    'HTTP error! status: 400': 'Invalid request data. Please check your input.',
    'HTTP error! status: 401': 'Authentication required.',
    'HTTP error! status: 403': 'Access denied.',
    'HTTP error! status: 404': 'Resource not found.',
    'HTTP error! status: 500': 'Server error. Please try again later.',
    'HTTP error! status: 502': 'BrightData API error. Please try again later.',
    'HTTP error! status: 503': 'Service temporarily unavailable.'
  };
  
  const userMessage = errorMessages[error.message] || error.message || 'An unexpected error occurred.';
  
  return {
    success: false,
    error: userMessage,
    originalError: error
  };
}
```

### Data Validation

```javascript
// Input validation functions
function validateLinkedInUrls(urls) {
  const errors = [];
  
  if (!Array.isArray(urls) || urls.length === 0) {
    errors.push('URLs must be a non-empty array');
    return errors;
  }
  
  if (urls.length > 50) {
    errors.push('Maximum 50 URLs allowed per request');
  }
  
  urls.forEach((url, index) => {
    if (typeof url !== 'string') {
      errors.push(`URL at index ${index} must be a string`);
    } else if (url.length > 500) {
      errors.push(`URL at index ${index} is too long (max 500 characters)`);
    } else if (!url.includes('linkedin.com')) {
      errors.push(`URL at index ${index} must be a LinkedIn URL`);
    }
  });
  
  return errors;
}

function validateJobSearchParams(searches) {
  const errors = [];
  
  if (!Array.isArray(searches) || searches.length === 0) {
    errors.push('Searches must be a non-empty array');
    return errors;
  }
  
  searches.forEach((search, index) => {
    if (!search.location) {
      errors.push(`Search at index ${index} must have a location`);
    }
    if (!search.keyword) {
      errors.push(`Search at index ${index} must have a keyword`);
    }
  });
  
  return errors;
}
```

## Complete Integration Example

```javascript
// Complete example integrating multiple APIs
class LinkedInDataCollector {
  constructor() {
    this.apiClient = apiClient;
    this.activeOperations = new Map();
  }
  
  // Start a complete LinkedIn data collection workflow
  async startDataCollection(config) {
    const results = {
      profiles: null,
      jobs: null,
      posts: null,
      companies: null
    };
    
    try {
      // 1. Collect profiles if URLs provided
      if (config.profileUrls && config.profileUrls.length > 0) {
        console.log('Starting profile collection...');
        const profileResult = await collectLinkedInProfiles(config.profileUrls);
        if (profileResult.success) {
          results.profiles = await this.waitForCompletion(
            profileResult.snapshotId,
            checkProfileCollectionStatus,
            getProfileCollectionData
          );
        }
      }
      
      // 2. Discover jobs if search params provided
      if (config.jobSearchParams && config.jobSearchParams.length > 0) {
        console.log('Starting job discovery...');
        const jobResult = await discoverJobsByKeyword(config.jobSearchParams);
        if (jobResult.success) {
          results.jobs = await this.waitForCompletion(
            jobResult.snapshotId,
            (id) => apiClient.get(`${API_ENDPOINTS.jobListingDiscoverKeyword}/snapshot/${id}/status`),
            (id) => apiClient.get(`${API_ENDPOINTS.jobListingDiscoverKeyword}/snapshot/${id}/data`)
          );
        }
      }
      
      // 3. Collect posts if URLs provided
      if (config.postUrls && config.postUrls.length > 0) {
        console.log('Starting post collection...');
        const postResult = await collectLinkedInPosts(config.postUrls);
        if (postResult.success) {
          results.posts = await this.waitForCompletion(
            postResult.snapshotId,
            (id) => apiClient.get(`${API_ENDPOINTS.postCollect}/snapshot/${id}/status`),
            (id) => apiClient.get(`${API_ENDPOINTS.postCollect}/snapshot/${id}/data`)
          );
        }
      }
      
      // 4. Collect company info if URLs provided
      if (config.companyUrls && config.companyUrls.length > 0) {
        console.log('Starting company collection...');
        const companyResult = await collectCompanyInfo(config.companyUrls);
        if (companyResult.success) {
          results.companies = await this.waitForCompletion(
            companyResult.snapshotId,
            (id) => apiClient.get(`${API_ENDPOINTS.companyInfoCollect}/snapshot/${id}/status`),
            (id) => apiClient.get(`${API_ENDPOINTS.companyInfoCollect}/snapshot/${id}/data`)
          );
        }
      }
      
      return {
        success: true,
        data: results
      };
      
    } catch (error) {
      return handleApiError(error, 'Data Collection Workflow');
    }
  }
  
  async waitForCompletion(snapshotId, statusFn, dataFn) {
    return pollForCompletion(snapshotId, statusFn, dataFn);
  }
}

// Usage example
const collector = new LinkedInDataCollector();

const config = {
  profileUrls: [
    'https://www.linkedin.com/in/elad-moshe-05a90413/',
    'https://www.linkedin.com/in/jonathan-myrvik-3baa01109'
  ],
  jobSearchParams: [
    {
      location: 'San Francisco',
      keyword: 'software engineer',
      job_type: 'Full-time',
      experience_level: 'Mid-Senior level'
    }
  ],
  postUrls: [
    'https://www.linkedin.com/posts/orlenchner_scrapecon-activity-7180537307521769472-oSYN'
  ],
  companyUrls: [
    'https://www.linkedin.com/company/microsoft'
  ]
};

collector.startDataCollection(config)
  .then(result => {
    if (result.success) {
      console.log('Data collection completed:', result.data);
    } else {
      console.error('Data collection failed:', result.error);
    }
  });
```

## Response Data Structures

### Profile Data Structure
```javascript
{
  "id": "database_id",
  "linkedin_num_id": "905328471",
  "url": "https://www.linkedin.com/in/praneeth-devarasetty/",
  "name": "Praneeth Devarasetty",
  "country_code": "US",
  "city": "San Francisco, CA",
  "about": "Software Engineer passionate about building scalable systems...",
  "followers": 1200,
  "connections": 500,
  "position": "Senior Software Engineer at Google",
  "timestamp": "2025-07-20"
}
```

### Job Data Structure
```javascript
{
  "id": "database_id",
  "url": "https://www.linkedin.com/jobs/view/4270099119",
  "job_posting_id": "4270099119",
  "job_title": "Senior Software Engineer",
  "company_name": "Google",
  "job_location": "San Francisco, CA",
  "job_employment_type": "Full-time",
  "job_num_applicants": 150,
  "job_seniority_level": "Mid-Senior level",
  "job_industries": ["Technology", "Software"],
  "job_function": "Engineering",
  "salary_from": 150000,
  "salary_to": 200000,
  "job_summary": "We are looking for a talented software engineer...",
  "search_keyword": "software engineer",
  "search_location": "San Francisco"
}
```

### Post Data Structure
```javascript
{
  "id": "7351896543320330240",
  "url": "https://www.linkedin.com/posts/lifecell-international-pvt-ltd_lifecell-gold-elite-activity-7351896543320330240-rQ_s",
  "post_type": "post",
  "date_posted": "2025-07-18T08:52:07.526Z",
  "title": "We're in the news! LifeCell Gold Elite...",
  "post_text": "We're in the news! LifeCell Gold Elite is making waves...",
  "hashtags": ["#GoldElite", "#LifeCell", "#MediaCoverage"],
  "engagement": {
    "likes": 29,
    "comments": 0
  },
  "author": {
    "user_id": "lifecell-international-pvt-ltd",
    "account_type": "Organization",
    "followers": 128845
  },
  "media": {
    "images": ["image_url"],
    "videos": null,
    "document_cover_image": "document_url",
    "document_page_count": 4
  },
  "tagged_companies": [
    {
      "link": "https://in.linkedin.com/company/dainik-jagran",
      "name": "Dainik Jagran"
    }
  ],
  "tagged_people": []
}
```

### Company Data Structure
```javascript
{
  "id": "database_id",
  "url": "https://www.linkedin.com/company/microsoft",
  "name": "Microsoft",
  "industry": "Technology",
  "company_size": "10,001+ employees",
  "headquarters": "Redmond, WA",
  "founded": "1975",
  "specialties": ["Software", "Cloud Computing", "AI"],
  "about": "Microsoft is a technology company...",
  "website": "https://www.microsoft.com",
  "followers": 15000000
}
```

## Error Handling Examples

### Common Error Responses
```javascript
// Validation Error (400)
{
  "statusCode": 400,
  "message": ["urls must contain at least 1 elements"],
  "error": "Bad Request"
}

// BrightData API Error (502)
{
  "statusCode": 502,
  "message": "BrightData API error: Invalid dataset ID",
  "error": "Bad Gateway"
}

// Not Found Error (404)
{
  "statusCode": 404,
  "message": "Snapshot not found",
  "error": "Not Found"
}

// Server Error (500)
{
  "statusCode": 500,
  "message": "Database connection failed",
  "error": "Internal Server Error"
}
```

## Best Practices

1. **Always validate input data** before sending requests
2. **Implement proper error handling** for all API calls
3. **Use polling with reasonable intervals** (10-30 seconds) for async operations
4. **Set maximum polling attempts** to avoid infinite loops
5. **Cache successful responses** to avoid unnecessary API calls
6. **Implement retry logic** for transient failures
7. **Monitor API health** before starting operations
8. **Use appropriate timeouts** for HTTP requests
9. **Log all API interactions** for debugging
10. **Handle rate limiting** if implemented by the backend

## Testing the Integration

```javascript
// Test function to verify all APIs are working
async function testAllApis() {
  console.log('Testing LinkScrap Backend APIs...');
  
  // Test health endpoint
  const health = await checkApiHealth();
  console.log('Health check:', health.healthy ? 'PASS' : 'FAIL');
  
  // Test each API with minimal data
  const tests = [
    {
      name: 'Profile Collection',
      test: () => collectLinkedInProfiles(['https://www.linkedin.com/in/test'])
    },
    {
      name: 'Job Discovery',
      test: () => discoverJobsByKeyword([{location: 'test', keyword: 'test'}])
    },
    {
      name: 'Post Collection',
      test: () => collectLinkedInPosts(['https://www.linkedin.com/posts/test'])
    }
    // Add more tests as needed
  ];
  
  for (const test of tests) {
    try {
      const result = await test.test();
      console.log(`${test.name}:`, result.success ? 'PASS' : 'FAIL');
    } catch (error) {
      console.log(`${test.name}: FAIL -`, error.message);
    }
  }
}

// Run tests
testAllApis();
```

This comprehensive guide provides everything needed to integrate all 11 LinkedIn data collection APIs from your LinkScrap backend into any frontend application. The APIs support async operations, comprehensive data collection, and robust error handling.