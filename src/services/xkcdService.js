const fetch = require('node-fetch');
const { exitOnError } = require('winston');

class XKCDService {
  constructor() {
    this.baseUrl = 'https://xkcd.com';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getLatest() {
    const cacheKey = 'latest';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/info.0.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const comic = await response.json();
      const processedComic = this.processComic(comic);
      
      this.cache.set(cacheKey, {
        data: processedComic,
        timestamp: Date.now()
      });
      
      return processedComic;
    } catch (error) {
      throw new Error(`Failed to fetch latest comic: ${error.message}`);
    }
  }

  // TODO: Implement getById method
  async getById(id) {
    // Validate that id is a positive integer
    if (id < 1){
      throw new Error('Invalid comic ID');
    }

    // Check cache first using key `comic-${id}`
    const cachedKey = `comic-${id}`;
    const cachedComic = this.cache.get(cachedKey);

    if (cachedComic) { return cachedComic; }
    
    // Fetch from https://xkcd.com/${id}/info.0.json
    try {
      const response = await fetch(`${this.baseUrl}/${id}/info.0.json`);

      // Handle 404 errors appropriately (throw 'Comic not found')
      if (response.status === 404) {
        throw new Error('Comic not found');
      }

      // Handle other HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error){
      throw new Error(`Failed to getByID ${error.message}`);
    }

    // Process and cache the result
    const comic = await response.json();
    const processedComic = this.processComic(comic);

    this.cache.set(cachedKey, { 
      data: processedComic,
      timestamp: Date.now()
    });

    // Return processed comic
    return processedComic;
  }

  // TODO: Implement getRandom method
  async getRandom() {
    // Get the latest comic to know the maximum ID
    const latestID = await this.getLatest().id;

    // Generate random number between 1 and latest.id
    const randomID = Math.floor(Math.random() * latestID) + 1;

    // Use getById to fetch the random comic
    // Handle any errors appropriately
    try{
      return await this.getById(randomID);
    } 
    catch (error) {
      throw new Error(`Failed to fetch random comic: ${error.message}`);
    }
  }

  // TODO: Implement search method
  async search(query, page = 1, limit = 10) {
    const results = [];
    const total = 0;

    try{
      if (query.length < 1 || query.length > 100) {
        throw new Error('Query must be between 1 and 100 characters');
      }
    } catch (error){
      throw new Error(`Failed to search ${error.message}`);
    }
    
    // This is a simplified search implementation
    // Get latest comic to know the range
    const latestID = await this.getLatest().id;
    
    // Calculate offset from page and limit
    const offset = (page - 1) * limit;

    // Search through recent comics (e.g., last 100) for title/transcript matches
    const recentComics = this.recentComics();
    
    for (let i = 0; i < recentComics.length; i++){
      const currentComic = recentComics[i];
      if (currentComic.title.includes(query) || currentComic.transcript.includes(query)){
        results.push(currentComic);
        total++;
      }
    }

    // Return object with: query, results array, total, pagination object
    return {
      query: query,
      results: results,
      total: total,
      pagination: {
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  recentComics() {
    const recentComics = [];
    const cachedComics = Arrays.from(this.cache);
    cachedComics.reverse();

    if (this.cache.length < 100){
      const maxIterations = this.cache.length;
    } else{
      const maxIterations = 100;
    }

    for (let i = 0; i < maxIterations; i++){
      recentComics.push(this.cache[i]);
    }
    
    return recentComics;

  }
  processComic(comic) {
    return {
      id: comic.num,
      title: comic.title,
      img: comic.img,
      alt: comic.alt,
      transcript: comic.transcript || '',
      year: comic.year,
      month: comic.month,
      day: comic.day,
      safe_title: comic.safe_title
    };
  }
}

module.exports = new XKCDService();
