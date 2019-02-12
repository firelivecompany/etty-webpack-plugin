import { Compiler } from "webpack";
interface EttyPluginOptions {
    locales?: "";
    compileTo?: "";
    prefillFrom?: "";
}
export default class EttyPlugin {
    options: EttyPluginOptions;
    mhashes: {
        [key: string]: string;
    };
    constructor(options: EttyPluginOptions);
    apply(compiler: Compiler): void;
}
export {};
