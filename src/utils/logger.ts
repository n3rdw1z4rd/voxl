export const logdev = import.meta.env.DEV
    ? console.debug.bind(console, '%c[dbg]', 'font-weight: bold; color: #888;')
    : (..._: any[]): void => { };

export const log = logdev;

export const loginf = console.log.bind(console, '%c[inf]', 'font-weight: bold;');

export const logwrn = console.log.bind(console, '%c[wrn]', 'font-weight: bold; color: orange;');

export const logerr = console.log.bind(console, '%c[err]', 'font-weight: bold; color: red;');
