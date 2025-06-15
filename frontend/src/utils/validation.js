// validation.js

export const isEmptyField = (...fields) => {
  return fields.some((field) => !field || field.trim() === "");
};

export const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password) => {
  return password.length >= 6;
};
