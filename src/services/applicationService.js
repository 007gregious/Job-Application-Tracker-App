// src/services/applicationService.js - UPDATE THIS
const API_URL = process.env.REACT_APP_API_URL || '/api';

class ApplicationService {
  async getUserApplications(userId) {
    const response = await fetch(`${API_URL}/applications?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }

  async createApplication(data) {
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create');
    return response.json();
  }

  async updateApplication(id, data) {
    const response = await fetch(`${API_URL}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update');
    return response.json();
  }

  async deleteApplication(id) {
    const response = await fetch(`${API_URL}/applications/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete');
    return response.json();
  }

  async saveApplyPacket(id, data) {
    const response = await fetch(`${API_URL}/applications/${id}/packet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save apply packet');
    return response.json();
  }

  async queueReady(id, minimumReadiness = 65) {
    const response = await fetch(`${API_URL}/applications/${id}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minimumReadiness })
    });
    if (!response.ok) throw new Error('Failed to move application to ready queue');
    return response.json();
  }

  async markSubmitted(id, data) {
    const response = await fetch(`${API_URL}/applications/${id}/submitted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to confirm submission');
    return response.json();
  }

  async getReadyQueue(userId) {
    const response = await fetch(`${API_URL}/queue?userId=${userId}&status=ready`);
    if (!response.ok) throw new Error('Failed to fetch ready queue');
    return response.json();
  }

  async importJobs(userId, opportunities) {
    const response = await fetch(`${API_URL}/jobs/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, opportunities })
    });
    if (!response.ok) throw new Error('Failed to import jobs');
    return response.json();
  }
}

const applicationService = new ApplicationService();
export default applicationService;
