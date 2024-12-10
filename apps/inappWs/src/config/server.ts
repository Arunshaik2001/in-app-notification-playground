import http from 'http';

export const createHttpServer = (): http.Server => {
    return http.createServer((req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Hello, world!\n');
    });
};
