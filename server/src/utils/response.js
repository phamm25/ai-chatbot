const formatResponse = (data, meta) => ({
  data,
  meta: meta || {},
});

module.exports = {
  formatResponse,
};
