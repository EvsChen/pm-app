const buildApi = str => {
    const baseApi = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api/v1'
      : `http://${window.location.hostname}/api/v1`;
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
    removePerson: buildApi('/persons/remove'),

    createAction: buildApi('/actions/create'),
    queryAction: buildApi('/actions/query'),
    updateAction: buildApi('/actions/update'),
    removeAction: buildApi('/actions/remove')
};

export default api;