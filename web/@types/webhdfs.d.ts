declare module "webhdfs" {
    interface WebHDFSOptions {
        user: string;
        host: string;
        port: number;
        path: string;
    }

    interface WebHDFS {
        createReadStream: (path: string) => NodeJS.ReadableStream;
        createWriteStream: (path: string) => NodeJS.WritableStream;
    }

    function createClient(options: WebHDFSOptions): WebHDFS;

    export { createClient, WebHDFSOptions, WebHDFS };
}
