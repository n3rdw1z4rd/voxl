declare type KeyValue = { [key: string]: any };

type JSONValues =
    | string
    | number
    | boolean
    | null
    | JSONValues[]
    | { [key: string]: JSONValues };

declare type JsonData = {
    [k: string]: JSONValues,
};

declare module "*.glsl" {
    const value: string;
    export default value;
}
