// TODO: changing the baseApi if the app is deployed on the cloud
const buildApi = (str) => {
    const baseApi = `http://${window.location.hostname}:3001/api/v1`;
    return `${baseApi}${str}`;
};

const api = {
    registerUser : buildApi('/users/create'),
    authenticateUser: buildApi('/users/authenticate'),
    createTask: buildApi('/tasks/create'),
    updateTask: buildApi('/tasks/update'),
    removeTask: buildApi('/tasks/remove'),
    getTask: buildApi('/tasks/get'),
    queryTask: buildApi('/tasks/query'),
    getRootTask: buildApi('/tasks/getRoot'),
    getRelatedPerson: buildApi('/tasks/getRelatedPerson'),
    getByRootTask: buildApi('/tasks/getByRoot'),
    createPerson: buildApi('/persons/create'),
    updatePerson: buildApi('/persons/update'),
    queryPerson: buildApi('/persons/query'),
    removePerson: buildApi('/persons/remove')
};

export default api;