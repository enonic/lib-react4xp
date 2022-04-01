import {initServiceUrlRoot} from '/lib/enonic/react4xp/dependencies/initServiceUrlRoot';


export function getServiceRoot(serviceName :string = '') {
    return initServiceUrlRoot(serviceName);
};
