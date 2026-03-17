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
}

const applicationService = new ApplicationService();
export default applicationService;