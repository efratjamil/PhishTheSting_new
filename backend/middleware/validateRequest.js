const { ZodError } = require("zod");

function formatZodErrors(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function validateRequest(schema, target = "body") {
  return (req, res, next) => {
    try {
      req[target] = schema.parse(req[target]);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = formatZodErrors(error);

        return res.status(400).json({
          error: "הנתונים שנשלחו אינם תקינים",
          message: details[0]?.message || "הנתונים שנשלחו אינם תקינים",
          details,
        });
      }

      return next(error);
    }
  };
}

module.exports = { validateRequest };
