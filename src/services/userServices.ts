import { handleApiError } from '../lib/errorHandler';

interface Employee {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  position?: string;
  address?: string;
  startDate: string;
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  name?: string;
  created_at?: string;
  employee?: Employee;
  loginHistory?: {
    ip: string;
    device: string;
    login_time: string;
  }[];
  clockIns?: {
    id: number;
    clockIn: string;
    clockOut: string | null;
    status: string;
    notes: string | null;
    userId: string;
  }[];
}

interface NewUser {
  username: string;
  password: string;
  role: string;
  fullName: string;
  email?: string;
  phone?: string;
  position?: string;
  address?: string;
}

interface UpdateUserData {
  username: string;
  role: string;
  newRole: string;
  password?: string;
  newPassword?: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`/api/get-users`, {
      headers: {
        credentials: 'include',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users');
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const updateUser = async (data: UpdateUserData): Promise<void> => {
  try {
    const response = await fetch('/api/update-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update user');
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createUser = async (newUser: NewUser): Promise<void> => {
  try {
    const response = await fetch('/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create user');
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete user');
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
