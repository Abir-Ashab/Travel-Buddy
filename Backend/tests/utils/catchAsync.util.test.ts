import { catchAsync } from "../../src/utils/catchAsync.util";
import { Request, Response, NextFunction } from "express";

describe("catchAsync", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should call the passed handler function", async () => {
    const handler = jest.fn((req, res, next) => Promise.resolve());
    const wrapped = catchAsync(handler);

    await wrapped(req as Request, res as Response, next as NextFunction);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("should catch errors and call next with the error", async () => {
    const error = new Error("Test error");
    const handler = jest.fn(() => Promise.reject(error));
    const wrapped = catchAsync(handler);

    await wrapped(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
    expect(console.log).toHaveBeenCalledWith(error);
  });

  it("should work if next is not provided", async () => {
    const handler = jest.fn((req, res, next) => Promise.resolve());
    const wrapped = catchAsync(handler);

    // @ts-expect-error: next is optional for this test
    await wrapped(req as Request, res as Response);

    expect(handler).toHaveBeenCalled();
  });
});