import axios from 'axios'

const instance = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_SERVER_URL
})

instance.interceptors.request.use(function (config) {
    let token = window.localStorage.getItem('persist:auth') && JSON.parse(window.localStorage.getItem('persist:auth'))?.token?.slice(1, -1)
    config.headers = {
        authorization: token ? `Bearer ${token}` : null
    }
    return config
}, function (error) {
    return Promise.reject(error)
})

instance.interceptors.response.use(function (response) {
    return response
}, function (error) {
    return Promise.reject(error)
})

export default instance
