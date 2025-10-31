import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const options = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000,
};
console.log(options.baseURL);

const API = axios.create(options);
export const APIRefresh = axios.create(options);

// Define types for the failed queue
type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

// Define a custom request config that includes our _retry flag
interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Refresh interceptor (no changes)
APIRefresh.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response
);

// Request retry flag
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      const accessToken = token && prom.resolve(token);
      console.log(accessToken);
    }
  });

  failedQueue = [];
};

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig;
    const { data, status } = error.response || {};

    // Token not found or expired
    if (
      (data as { message?: string })?.message === "Token not found" &&
      status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise(
          (resolve: (value: AxiosResponse) => void, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                API(originalRequest).then(resolve).catch(reject);
              },
              reject: (err: unknown) => reject(err),
            });
          }
        );
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await APIRefresh.get<{ accessToken: string }>(
          "/auths/refresh-token"
        );
        const newAccessToken = res.data.accessToken;
        console.log(res);
        // Optionally update cookies or headers
        API.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return API(originalRequest);
      } catch (err) {
        processQueue(err, null);
        window.location.href = "/";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
