const { z } = require("zod");

const trimmedString = z.string().trim();
const optionalTrimmedString = z.string().trim().optional();
const emailString = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת אימייל")
  .email("כתובת האימייל אינה תקינה")
  .max(255, "כתובת האימייל ארוכה מדי");
const urlString = z.string().trim().url("הקישור אינו תקין");
const strongPasswordSchema = z
  .string()
  .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
  .max(255, "הסיסמה ארוכה מדי")
  .regex(/[A-Z]/, "הסיסמה חייבת לכלול לפחות אות גדולה אחת")
  .regex(/\d/, "הסיסמה חייבת לכלול לפחות מספר אחד")
  .regex(/[^A-Za-z0-9]/, "הסיסמה חייבת לכלול לפחות תו מיוחד אחד");

const authRegisterSchema = z.object({
  firstName: trimmedString.min(1, "יש להזין שם פרטי").max(100, "השם הפרטי ארוך מדי"),
  lastName: trimmedString.min(1, "יש להזין שם משפחה").max(100, "שם המשפחה ארוך מדי"),
  email: emailString,
  password: strongPasswordSchema,
});

const authLoginSchema = z.object({
  email: emailString,
  password: z
    .string()
    .min(1, "יש להזין סיסמה")
    .max(255, "הסיסמה ארוכה מדי"),
});

const forgotPasswordSchema = z.object({
  email: emailString,
});

const resetPasswordWithTokenSchema = z.object({
  token: trimmedString.min(1, "קישור האיפוס אינו תקין").max(500, "קישור האיפוס אינו תקין"),
  newPassword: strongPasswordSchema,
});

const updatePasswordSchema = z.object({
  newPassword: strongPasswordSchema,
});

const updateProfileSchema = z
  .object({
    firstName: optionalTrimmedString,
    lastName: optionalTrimmedString,
    email: emailString.optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.firstName ||
          value.lastName ||
          value.email,
      ),
    {
      message: "יש לעדכן לפחות שדה אחד",
      path: [],
    },
  );

const analyzeMessageSchema = z.object({
  message: trimmedString
    .min(1, "יש להזין הודעה לניתוח")
    .max(10000, "ההודעה ארוכה מדי"),
});

const manualAnalysisSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]).optional(),
  riskScore: z.number().min(0).max(100).nullable().optional(),
  registrableDomain: z.string().optional(),
  hostname: z.string().optional(),
  findings: z.array(z.string()).optional(),
});

const googleVerdictSchema = z.object({
  safe: z.boolean().nullable().optional(),
  threats: z.array(z.string()).optional(),
  checks: z.array(z.any()).optional(),
  unavailable: z.boolean().optional(),
  error: z.string().optional(),
});

const sslCertificateSchema = z.object({
  hasHttps: z.boolean().optional(),
  hasCertificate: z.boolean().optional(),
  certificateTrusted: z.boolean().optional(),
  certificateAuthorizationError: z.string().optional(),
  certificateValid: z.boolean().optional(),
  isExpired: z.boolean().optional(),
  daysUntilExpiry: z.number().nullable().optional(),
  hostnameMatchesCertificate: z.boolean().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  issuer: z.string().optional(),
  subject: z.string().optional(),
  subjectAltName: z.string().optional(),
  fingerprint: z.string().optional(),
  serialNumber: z.string().optional(),
  error: z.string().optional(),
  errorCode: z.string().optional(),
});

const checkedLinkSchema = z.object({
  url: urlString.optional(),
  originalUrl: urlString.optional(),
  expandedUrl: urlString.optional(),
  redirectHops: z.array(z.any()).optional(),
  safe: z.boolean().optional(),
  safetyStatus: z.enum(["safe", "unknown", "suspicious"]).optional(),
  manualUnsafe: z.boolean().optional(),
  threats: z.array(z.string()).optional(),
  manualAnalysis: manualAnalysisSchema.nullable().optional(),
  googleVerdict: googleVerdictSchema.nullable().optional(),
  sslCertificate: sslCertificateSchema.nullable().optional(),
  marketingClassification: z
    .object({
      isLegitimateMarketing: z.boolean(),
      matchedBrands: z.array(z.string()),
    })
    .nullable()
    .optional(),
});

const saveHistorySchema = z.object({
  message: trimmedString
    .min(1, "יש להזין הודעה")
    .max(10000, "ההודעה ארוכה מדי"),
  summary: z.string().max(2000, "הסיכום ארוך מדי").optional(),
  analysis: z.record(z.string(), z.array(z.string())).optional(),
  textAnalysis: z.boolean().optional(),
  safe: z.boolean().optional(),
  status: z.enum(["safe", "caution", "suspicious"]).optional(),
  matchedWords: z.array(z.string()).optional(),
  extractedUrls: z.array(urlString).optional(),
  urlAnalysis: z.boolean().optional(),
  urlCaution: z.boolean().optional(),
  checkedLinks: z.array(checkedLinkSchema).optional(),
  urlThreats: z.array(checkedLinkSchema).optional(),
});

const urlPayloadSchema = z.object({
  url: urlString,
  messageText: z.string().max(10000).optional(),
  extractedUrls: z.array(urlString).max(100).optional(),
});

const aiChatSchema = z.object({
  message: trimmedString
    .min(1, "יש להזין את תוכן ההודעה")
    .max(10000, "תוכן ההודעה ארוך מדי"),
  analysis: z.record(z.string(), z.any()),
  question: trimmedString
    .min(1, "יש להזין שאלה לבוט")
    .max(1000, "השאלה ארוכה מדי"),
});

module.exports = {
  authRegisterSchema,
  authLoginSchema,
  forgotPasswordSchema,
  resetPasswordWithTokenSchema,
  updatePasswordSchema,
  updateProfileSchema,
  analyzeMessageSchema,
  saveHistorySchema,
  urlPayloadSchema,
  aiChatSchema,
};
