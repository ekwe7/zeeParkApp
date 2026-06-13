export function getApiErrorMessage(error, fallbackMessage = 'Something went wrong') {
  const responseData = error?.response?.data;
  const responseMessage = responseData?.message || responseData?.error;

  if (responseMessage) {
    return responseMessage;
  }

  if (error?.message === 'Network Error') {
    return 'Unable to reach the server. Check your connection and API URL.';
  }

  return error?.message || fallbackMessage;
}