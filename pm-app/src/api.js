const buildApi = (str) => {
    const baseApi = 'http://localhost:3001/api/v1';
    return `${baseApi}${str}`;
};

const api = {
    registerUser : buildApi('/users/create'),
    authenticateUser: buildApi('/users/authenticate'),
    createTask: buildApi('/tasks/create'),
    getTask: buildApi('/tasks/get')
};

export default api;