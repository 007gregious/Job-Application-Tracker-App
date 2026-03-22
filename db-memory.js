// Simple in-memory database for local development
// This stores data in memory (data is lost when server restarts)

class MemoryDB {
  constructor() {
    this.applications = [];
    this.nextId = 1;
    console.log('âš ï¸  Using in-memory storage (data will be lost on restart)');
    console.log('í²¡ To use PostgreSQL, install it locally or use Render\'s database');
  }

  async query(text, params) {
    // Simple query parser for basic operations
    const query = text.toLowerCase();
    
    // SELECT query
    if (query.includes('select')) {
      // Get applications by user_id
      if (query.includes('from applications')) {
        const userId = params?.[0];
        let results = [...this.applications];
        
        if (userId) {
          results = results.filter(app => app.user_id === userId);
        }
        
        return { rows: results };
      }
      return { rows: [] };
    }
    
    // INSERT query
    if (query.includes('insert')) {
      const newApp = {
        id: this.nextId++,
        user_id: params?.[0],
        company: params?.[1],
        position: params?.[2],
        location: params?.[3] || null,
        salary: params?.[4] || null,
        job_type: params?.[5] || null,
        status: params?.[6],
        applied_date: params?.[7],
        contact_person: params?.[8] || null,
        contact_email: params?.[9] || null,
        job_url: params?.[10] || null,
        notes: params?.[11] || null,
        source: params?.[12] || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      this.applications.push(newApp);
      return { rows: [newApp] };
    }
    
    // UPDATE query
    if (query.includes('update')) {
      const id = params?.[0];
      const index = this.applications.findIndex(app => app.id === parseInt(id));
      
      if (index !== -1) {
        // Parse SET clause (simplified)
        const updates = {};
        for (let i = 1; i < params.length; i++) {
          const key = text.match(/set\s+(\w+)\s*=/i)?.[1];
          if (key) updates[key] = params[i];
        }
        
        this.applications[index] = {
          ...this.applications[index],
          ...updates,
          updated_at: new Date().toISOString()
        };
        
        return { rows: [this.applications[index]] };
      }
      return { rows: [] };
    }
    
    // DELETE query
    if (query.includes('delete')) {
      const id = params?.[0];
      const index = this.applications.findIndex(app => app.id === parseInt(id));
      
      if (index !== -1) {
        this.applications.splice(index, 1);
        return { rows: [{ id: parseInt(id) }] };
      }
      return { rows: [] };
    }
    
    // COUNT query (for stats)
    if (query.includes('count') && query.includes('applications')) {
      const userId = params?.[0];
      let results = [...this.applications];
      
      if (userId) {
        results = results.filter(app => app.user_id === userId);
      }
      
      const applied = results.filter(a => a.status === 'Applied').length;
      const interview = results.filter(a => a.status === 'Interview').length;
      const offer = results.filter(a => a.status === 'Offer').length;
      const rejected = results.filter(a => a.status === 'Rejected').length;
      
      return {
        rows: [{
          total: results.length,
          applied,
          interview,
          offer,
          rejected
        }]
      };
    }
    
    return { rows: [] };
  }
}

module.exports = new MemoryDB();
