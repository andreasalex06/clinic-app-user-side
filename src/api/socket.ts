import { io } from "socket.io-client";

function getSocketUrl() {
  const apiUrl =
    import.meta.env.VITE_API_URL ??
    `${window.location.protocol}//${window.location.hostname}:5050/api`;

  return apiUrl.replace(/\/api\/?$/, "");
}

export function createPatientSocket(token: string) {
  return io(getSocketUrl(), {
    auth: { token },
    autoConnect: true
  });
}
