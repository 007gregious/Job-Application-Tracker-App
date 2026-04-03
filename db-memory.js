// Simple in-memory database for local development
// This stores data in memory (data is lost when server restarts)

class MemoryDB {
  constructor() {
    this.applications = [];
    this.nextId = 1;
    console.log('⚠️  Using in-memory storage (data will be lost on restart)');
    console.log('📦 To use PostgreSQL, install it locally or use Render\'s database');
  }

  buildStats(results) {
    const applied = results.filter((a) => a.status === 'Applied').length;
    const interview = results.filter((a) => a.status === 'Interview').length;
    const offer = results.filter((a) => a.status === 'Offer').length;
    const rejected = results.filter((a) => a.status === 'Rejected').length;

    return {
      total: results.length,
      applied,
      interview,
      offer,
      rejected
    };
  }

  parseUpdateAssignments(text) {
    const matches = [...text.matchAll(/(\w+)\s*=\s*\$(\d+)/g)];
    return matches.map(([, field, paramRef]) => ({
      field,
      paramIndex: Number(paramRef) - 1
    }));
  }

  async query(text, params = []) {
    const query = text.toLowerCase();

    // COUNT query (for stats)
    if (query.includes('count') && query.includes('from applications')) {
      const userId = params[0];
      let results = [...this.applications];

      if (userId) {
        results = results.filter((app) => app.user_id === userId);
      }

      return { rows: [this.buildStats(results)] };
    }

    // SELECT query
    if (query.includes('select') && query.includes('from applications')) {
      const userId = params[0];
      let results = [...this.applications];

      if (userId) {
        results = results.filter((app) => app.user_id === userId);
      }

      // Queue status filter: ... WHERE user_id = $1 AND apply_queue_status = $2
      if (query.includes('apply_queue_status = $2')) {
        const queueStatus = params[1];
        results = results.filter((app) => app.apply_queue_status === queueStatus);
      }

      // Record-by-id filter: ... WHERE id = $1
      if (query.includes('where id = $1')) {
        const id = Number(params[0]);
        results = results.filter((app) => app.id === id);
      }

      return { rows: results };
    }

    // INSERT query
    if (query.includes('insert into applications')) {
      const newApp = {
        id: this.nextId++,
        user_id: params[0],
        company: params[1],
        position: params[2],
        location: params[3] || null,
        salary: params[4] || null,
        job_type: params[5] || null,
        status: params[6],
        applied_date: params[7],
        contact_person: params[8] || null,
        contact_email: params[9] || null,
        job_url: params[10] || null,
        notes: params[11] || null,
        source: params[12] || null,
        fit_score: 0,
        apply_queue_status: 'draft',
        packet_resume_version: null,
        packet_cover_letter: null,
        packet_answers_json: null,
        autofill_url: null,
        submitted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.applications.push(newApp);
      return { rows: [newApp] };
    }

    // UPDATE query
    if (query.includes('update applications set')) {
      const id = Number(params[0]);
      const index = this.applications.findIndex((app) => app.id === id);

      if (index === -1) {
        return { rows: [] };
      }

      const assignments = this.parseUpdateAssignments(text);
      const updates = {};

      assignments.forEach(({ field, paramIndex }) => {
        if (field === 'updated_at') {
          return;
        }

        if (paramIndex >= 0 && paramIndex < params.length) {
          updates[field] = params[paramIndex];
        }
      });

      this.applications[index] = {
        ...this.applications[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      return { rows: [this.applications[index]] };
    }

    // DELETE query
    if (query.includes('delete from applications')) {
      const id = Number(params[0]);
      const index = this.applications.findIndex((app) => app.id === id);

      if (index === -1) {
        return { rows: [] };
      }

      this.applications.splice(index, 1);
      return { rows: [{ id }] };
    }

    return { rows: [] };
  }
}

module.exports = new MemoryDB();
