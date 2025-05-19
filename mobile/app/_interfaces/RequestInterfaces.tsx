export enum RequestType {
    GET,
    POST,
    PATCH,
    DELETE
}

export interface Request {
    endpoint: string,
    requestType: RequestType,
    body: object
}

export interface Response {
    status: string,
    message: string,
    data: object
}

export default { Request, Response, RequestType }