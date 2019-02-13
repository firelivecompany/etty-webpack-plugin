import { Compiler } from "webpack";
interface EttyPluginOptions {
    template: string;
    locales: string;
    compileTo: string;
    prefillFrom?: string;
    logLevel?: "all" | "warning" | "error" | "none";
    minify?: boolean;
}
export default class EttyPlugin {
    options: EttyPluginOptions;
    mhashes: {
        [key: string]: string;
    };
    constructor(options: EttyPluginOptions);
    apply(compiler: Compiler): void;
    __makeTranslations: () => void;
    __ettyLog: string;
    __info: (message: string) => void;
    __error: (message: string) => void;
    __success: (message: string) => void;
    __warning: (message: string) => void;
}
export {};
