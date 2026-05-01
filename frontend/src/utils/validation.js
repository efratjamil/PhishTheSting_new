// validation.js

export const isEmptyField = (...fields) => {
  return fields.some((field) => !field || field.trim() === "");
};

export const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

export const getPasswordValidationState = (password = "") => {
  const value = String(password);

  return {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
};

export const isStrongPassword = (password) => {
  const checks = getPasswordValidationState(password);

  return Object.values(checks).every(Boolean);
};
