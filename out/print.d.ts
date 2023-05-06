type PrintStyle = {
    spacing?: boolean;
    highlight: "foreground" | "background";
    context: Exclude<keyof typeof Print.palette, "reset">;
};
type Printable = any;
export declare class Print {
    static palette: {
        reset: string;
        warn: {
            background: string;
            foreground: string;
        };
        success: {
            background: string;
            foreground: string;
        };
        info: {
            background: string;
            foreground: string;
        };
    };
    static styleMessage(message: Printable, { spacing, highlight, context }: PrintStyle): any[];
    static error(message: Printable, style: Omit<PrintStyle, "context">): void;
    static info(message: Printable, style: Omit<PrintStyle, "context">): void;
    static success(message: Printable, style: Omit<PrintStyle, "context">): void;
}
export {};
