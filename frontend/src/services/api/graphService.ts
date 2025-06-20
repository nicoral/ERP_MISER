import { STORAGE_KEY_TOKEN } from '../../config/constants';

export const getGraphDistribution = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/roles/graph/distribution`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data;
  }
  throw new Error(data.message);
};

export const getGraphDistributionRequirements = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/requirements/graph/distribution`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data;
  }
  throw new Error(data.message);
};
