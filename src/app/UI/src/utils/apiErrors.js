export const extractApiError = (error) => {
  const apiError = error?.response?.data?.error ?? error?.response?.data ?? null;
  return apiError?.error ?? apiError;
};

export const mapApiErrorToFormErrors = (
  error,
  { fallbackMessage = 'Something went wrong.', detailToGeneralKeys = [] } = {}
) => {
  const apiError = extractApiError(error);

  if (!apiError) {
    return { general: error?.message || fallbackMessage };
  }

  const details = apiError.details && typeof apiError.details === 'object' ? apiError.details : null;
  if (details) {
    const generalKey = detailToGeneralKeys.find((key) => details[key]);
    if (generalKey) {
      const generalValue = Array.isArray(details[generalKey]) ? details[generalKey][0] : details[generalKey];
      return {
        ...details,
        general: generalValue,
      };
    }

    return details;
  }

  if (apiError.message) {
    return { general: apiError.message };
  }

  return { general: fallbackMessage };
};
