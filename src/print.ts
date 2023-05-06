type PrintStyle = {
  spacing?: boolean;
  highlight: "foreground" | "background";
  context: Exclude<keyof typeof Print.palette, "reset">;
};

type Printable = any;

export class Print {
  static palette = {
    reset: "\x1b[0m",
    warn: {
      background: "\x1b[41m",
      foreground: "\x1b[31m",
    },
    success: {
      background: "\x1b[42m",
      foreground: "\x1b[32m",
    },
    info: {
      background: "\x1b[43m",
      foreground: "\x1b[33m",
    },
  };

  static styleMessage(
    message: Printable,
    { spacing, highlight, context }: PrintStyle
  ) {
    let printable = [message];
    if (context) {
      printable = [
        this.palette[context][highlight],
        message,
        this.palette.reset,
      ];
    }
    if (spacing) {
      ["\n", printable, "\n"];
    }
    return printable;
  }

  static error(message: Printable, style: Omit<PrintStyle, "context">) {
    console.error(...this.styleMessage(message, { context: "warn", ...style }));
  }

  static info(message: Printable, style: Omit<PrintStyle, "context">) {
    console.log(...this.styleMessage(message, { context: "info", ...style }));
  }

  static success(message: Printable, style: Omit<PrintStyle, "context">) {
    console.log(
      ...this.styleMessage(message, { context: "success", ...style })
    );
  }
}
