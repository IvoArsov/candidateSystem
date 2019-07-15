let saver = '';

module.exports = {
    setToken: (token) => {
        saver = token
    },
    getToken: () => {
        return saver
    }
}