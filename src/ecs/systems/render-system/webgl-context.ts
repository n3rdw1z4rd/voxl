import { Color } from './webgl-helpers';

const DEFAULT_CLEAR_COLOR: Color = [0.1, 0.1, 0.1, 1.0];

export interface RendererParams {
    canvas?: HTMLCanvasElement,
    parent?: HTMLElement,
}

export class WebGlContext {
    public gl: WebGL2RenderingContext;

    public get canvas(): HTMLCanvasElement { return this.gl.canvas as HTMLCanvasElement; }
    public get width(): number { return this.gl.canvas.width; }
    public get height(): number { return this.gl.canvas.height; }

    constructor({ canvas, parent }: RendererParams = {}) {
        canvas = canvas ?? document.createElement('canvas') as HTMLCanvasElement;

        this.gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

        if (!this.gl) {
            throw 'CreateWebGL2RenderingContext: failed to create a WebGL2RenderingContext';
        }

        if (parent) {
            this.appendTo(parent);
        }

        this.gl.clearColor(...DEFAULT_CLEAR_COLOR);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.cullFace(this.gl.BACK);
    }

    public clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    public appendTo(htmlElement?: HTMLElement, autoResize: boolean = true) {
        const canvas = (this.gl.canvas as HTMLCanvasElement);

        if (canvas.parentElement) {
            canvas.parentElement.removeChild(canvas);
        }

        if (htmlElement) {
            htmlElement.appendChild(canvas);

            if (autoResize) {
                this.resize();
            }
        }
    }

    public resize(displayWidth?: number, displayHeight?: number): boolean {
        const { width, height } = (
            (this.gl.canvas as HTMLCanvasElement).parentElement?.getBoundingClientRect() ??
            (this.gl.canvas as HTMLCanvasElement).getBoundingClientRect()
        );

        displayWidth = (0 | (displayWidth ?? width));
        displayHeight = (0 | (displayHeight ?? height));

        if (this.gl.canvas.width !== displayWidth || this.gl.canvas.height !== displayHeight) {
            this.gl.canvas.width = displayWidth
            this.gl.canvas.height = displayHeight;

            this.gl.viewport(0, 0, displayWidth, displayHeight);

            return true;
        }

        return false;
    }
}
