type PrintStyle = {
    spacing?: boolean;
    highlight: "foreground" | "background";
    context: Exclude<keyof typeof Print.palette, "reset">;
};
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
    static styleMessage(message: string, { spacing, highlight, context }: PrintStyle): string[];
    static error(message: string, style: Omit<PrintStyle, "context">): void;
    static info(message: string, style: Omit<PrintStyle, "context">): void;
    static success(message: string, style: Omit<PrintStyle, "context">): void;
}
export {};
