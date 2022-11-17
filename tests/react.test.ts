import { importAll, classListBuilder } from "../src/react";

describe("importAll", () => {
  const context = (data: { [id: string]: string }): any => {
    const context = (id: string): string => data[id];
    context.keys = () => Object.keys(data);
    return context;
  };

  const STATIC_FILE = "./static/file.abc.js";

  it("imports a file", () => {
    const data = {
      "./file.js": STATIC_FILE,
    };

    const imported = importAll(context(data));
    const expected = {
      file: STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("imports a file with longer path", () => {
    const data = {
      "./path/to/file.js": STATIC_FILE,
    };

    const imported = importAll(context(data));
    const expected = {
      file: STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("imports a file without an extension", () => {
    const data = {
      "./path/to/file": STATIC_FILE,
    };

    const imported = importAll(context(data));
    const expected = {
      file: STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("imports a hidden file", () => {
    const data = {
      "./path/to/.file.js": STATIC_FILE,
    };

    const imported = importAll(context(data));
    const expected = {
      ".file": STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("imports a hidden file without an extension", () => {
    const data = {
      "./path/to/.file": STATIC_FILE,
    };

    const imported = importAll(context(data));
    const expected = {
      ".file": STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("preserves the extension", () => {
    const data = {
      "./path/to/file.js": STATIC_FILE,
    };

    const imported = importAll(context(data), true);
    const expected = {
      "file.js": STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("preserves the extension and the path", () => {
    const data = {
      "./path/to/file.js": STATIC_FILE,
    };

    const imported = importAll(context(data), true, true);
    const expected = {
      "./path/to/file.js": STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("preserves the extension for hidden file", () => {
    const data = {
      "./path/to/.file.js": STATIC_FILE,
    };

    const imported = importAll(context(data), true);
    const expected = {
      ".file.js": STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("preserves the extension for file without an extension", () => {
    const data = {
      "./path/to/file": STATIC_FILE,
    };

    const imported = importAll(context(data), true);
    const expected = {
      file: STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("preserves the extension for hidden file without an extension", () => {
    const data = {
      "./path/to/.file": STATIC_FILE,
    };

    const imported = importAll(context(data), true);
    const expected = {
      ".file": STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("preserves the extension and the path for hidden file without an extension", () => {
    const data = {
      "./path/to/.file": STATIC_FILE,
    };

    const imported = importAll(context(data), true, true);
    const expected = {
      "./path/to/.file": STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });

  it("handles weird input", () => {
    const data = {
      "": STATIC_FILE,
      "$$/$$": STATIC_FILE,
      "...js": STATIC_FILE,
    };

    const imported = importAll(context(data), true, true);
    const expected = {
      "": STATIC_FILE,
      "$$/$$": STATIC_FILE,
      "...js": STATIC_FILE,
    };
    expect(imported).toStrictEqual(expected);
  });
});

test("classListBuilder", () => {
  const testStyles = {
    container: "Button_container_123abc",
    dark: "Colors_dark_456def",
  };

  const classes = classListBuilder(testStyles);

  expect(classes("")).toBe("");
  expect(classes("container dark")).toBe(
    "Button_container_123abc Colors_dark_456def",
  );
  expect(classes(["container", "dark"])).toBe(
    "Button_container_123abc Colors_dark_456def",
  );
  expect(classes("container light")).toBe("Button_container_123abc light");
});
