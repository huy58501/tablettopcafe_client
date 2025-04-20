import { toast } from 'sonner';

interface ApiError {
  error: string;
  success: boolean;
}

export const handleApiError = (error: unknown): void => {
  let errorMessage = 'An unexpected error occurred';

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    if (apiError.error) {
      errorMessage = apiError.error;
    }
  }

  toast.error(errorMessage);
};
