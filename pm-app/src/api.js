const buildApi = (str) => {
    const baseApi = `http://${window.location.hostname}:3001/api/v1`;
    console.log(`${baseApi}${str}`);
    return `${baseApi}${str}`;
};

const api = {
    registerUser : buildApi('/users/create'),
    authenticateUser: buildApi('/users/authenticate'),
    createTask: buildApi('/tasks/create'),
    getTask: buildApi('/tasks/get'),
    queryTask: buildApi('/tasks/query'),
    getRootTask: buildApi('/tasks/getRoot'),
    getByRootTask: buildApi('/tasks/getByRoot'),
    removeTask: buildApi('/tasks/remove')
};

export default api;