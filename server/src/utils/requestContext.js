const cls = require('cls-hooked');
const { v4: uuid } = require('uuid');

const NAMESPACE = 'chatbot-request';

const getNamespace = () => {
  let namespace = cls.getNamespace(NAMESPACE);
  if (!namespace) {
    namespace = cls.createNamespace(NAMESPACE);
  }
  return namespace;
};

const runWithRequestContext = (callback, initialContext = {}) => {
  const namespace = getNamespace();
  namespace.run(() => {
    const context = {
      requestId: initialContext.requestId || uuid(),
      startTime: Date.now(),
      ...initialContext,
    };
    namespace.set('context', context);
    callback(context);
  });
};

const setRequestContext = (context) => {
  const namespace = getNamespace();
  namespace.set('context', context);
};

const getRequestContext = () => {
  const namespace = cls.getNamespace(NAMESPACE);
  return namespace ? namespace.get('context') : undefined;
};

module.exports = {
  runWithRequestContext,
  setRequestContext,
  getRequestContext,
};
