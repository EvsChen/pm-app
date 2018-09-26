import config from './config/appConfig';

const buildApi = str => {
    // TODO: using a react variable to determine this
    // determine if the current environment is test env
    const hostname = window.location.hostname;
    // const backendHost = 'pm-app-env.uwa3mts8vm.us-east-1.elasticbeanstalk.com';
    // USING HTTPS!!!!!!
    // config优先级最高
    const ifLocal = !config.useOnlineEnv 
      && (hostname === 'localhost'
      || /^192/.test(hostname)
      || /^172/.test(hostname));
    const baseApi = ifLocal
      ? `http://${hostname}:3001/api/v1`
      : `${config.apiServer}/api/v1`;
    return `${baseApi}${str}`;
};

const api = {
    registerUser : buildApi('/users/create'),
    authenticateUser: buildApi('/users/authenticate'),
    // Task related routes
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
    removeAction: buildApi('/actions/remove'),
    // logs
    getAppLog: buildApi('/log/app.log'),
    getErrorsLog: buildApi('/log/errors.log'),
    getAccessLog: buildApi('/log/access.log')

};

export default api;