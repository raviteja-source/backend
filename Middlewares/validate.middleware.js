export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message.replace(/"/g, ""),
      }));
      return res.status(400).json({
        message: "Validation failed",
        details,
      });
    }

    req.body = value;
    next();
  };
};
