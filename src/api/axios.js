import _this from '../main'
import axios from 'axios'
import qs from 'qs'
import {BASE_URL} from "./config"
import {getToken, removeToken, removeUserInfo} from "../common/js/cache"

/* 设置 axios 默认URL */
axios.defaults.baseURL = BASE_URL;

/* 设置axios 默认请求类型 */
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

/* 设置 axios 默认超时时间 */
axios.defaults.timeout = 3600000;

/* 添加请求拦截 */
axios.interceptors.request.use(config => {
	let AUTH_TOKEN = getToken();
	if (AUTH_TOKEN) {
		/* 设置 axios 默认请求头 */
		config.headers.Authorization = AUTH_TOKEN;
	}

	if (config.method === 'post') {
		config.data = qs.stringify(config.data);
	}
	return config;
}, error => {
	/* 错误的传参 */
	return Promise.reject(error);
});

/* 添加响应的拦截器 */
axios.interceptors.response.use(
	response => {
		return response.data;
	},
	error => {
		if (error.response) {
			switch (error.response.status) {
				case 401:
					_this.$store.dispatch('saveUserInfo', null);
					/* 清除Token */
					removeToken();
					/* 清除UserInfo */
					removeUserInfo();
					/* 跳转登录页面 */
					_this.$router.replace({
						path: "/login"
					});
					message();
					break;
				case 403:
					/* 跳转403页面 */
					_this.$router.replace({
						path: "/403"
					});
					break;
				case 404:
					/* 跳转404页面 */
					_this.$router.replace({
						path: "/404"
					});
					break;
				default:
					/* 跳转500页面 */
					_this.$router.replace({
						path: "/500"
					})
			}
		}
		/* 返回接口返回的错误信息 */
		return Promise.reject(error.response.data)
	});

let isFirst = true;

function message() {
	if (isFirst) {
		_this.$Message.info("您的账号已被禁用，请联系管理员");
		isFirst = false;
	}
}

export default axios;
