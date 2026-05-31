import React, { useState, type ChangeEvent } from 'react';

type Errors<T> = Partial<Record<keyof T, string>>;

interface UseAuthFormOptions<T> {
  initialValues: T;
  validate: (values: T) => Errors<T>;
  onSubmit: (values: T) => Promise<void>;
}

export default function useAuthForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseAuthFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    if (errors[name as keyof T]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (submitError) {
      setSubmitError(null);
    }
  };

  const setFieldValue = (name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(values);
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        err.message ||
        'Error';
      setSubmitError(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    values,
    errors,
    isLoading,
    submitError,
    setSubmitError,
    handleChange,
    setFieldValue,
    handleSubmit,
  };
}
