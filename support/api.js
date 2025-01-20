import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getDevices = async () => {
  const response = await axios.get(`${API_URL}/devices`);
  return response.data;
};

export const createDevice = async (device) => {
  await axios.post(`${API_URL}/devices`, device);
};

export const deleteDevice = async (deviceName) => {
  const devices = await getDevices();
  const device = devices.find((d) => d.system_name === deviceName);
  if (device) {
    await axios.delete(`${API_URL}/devices/${device.id}`);
  }
};
