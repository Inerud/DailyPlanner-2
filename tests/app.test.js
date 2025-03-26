const request = require('supertest');
const app = require('../app'); // Assuming routes are already defined here
const db = require('../server/config/db');

// Mocking db connection
jest.mock('../server/config/db.js', () => ({
  connect: jest.fn((callback) => callback(null)), // Mock successful connection
  execute: jest.fn().mockResolvedValue([]), // Mocking DB execute
}));

// Mocking console.log to avoid log output during tests
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('Test Suite', () => {
  beforeAll(async () => {
    // If app.listen is used, mock it out or handle async logic
    jest.mock('../app', () => ({
      listen: jest.fn().mockImplementation(() => {}),
    }));
  });

  
  let habitId;

  it('should create a new habit', async () => {
    const response = await request(app)
      .post('/api/habits')
      .send({
        user_id: 1,
        title: 'Drink Water',
        category: 'Health',
        frequency: 'DAILY',
        weekly_target: 7
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Habit created successfully');
    habitId = response.body.habit_id; // Save habit_id for future tests
  });

  it('should retrieve habits for a user', async () => {
    const response = await request(app)
      .get('/api/habits/1');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should update an existing habit', async () => {
    const response = await request(app)
      .put(`/api/habits/${habitId}`)
      .send({
        title: 'Drink Water - Updated',
        category: 'Health',
        frequency: 'DAILY',
        weekly_target: 7
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Habit updated successfully');
  });

  it('should delete a habit', async () => {
    const response = await request(app)
      .delete(`/api/habits/${habitId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Habit deleted successfully');
  });

  it('should return an error if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/habits')
      .send({
        user_id: 1,
        category: 'Health',
        frequency: 'DAILY'
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Missing required fields');
  });
});
