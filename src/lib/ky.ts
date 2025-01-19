import ky from "ky";

// kyInstance is a pre-configured instance of ky that will automatically parse JSON responses. I.E. for date strings.
const kyInstance = ky.create({
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      if (key.endsWith("At")) return new Date(value);
      return value;
    }),
});

export default kyInstance;
