import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { reviewService } from "./review.service";
import { IRequestUser } from "../admin/admin.interface";


const giveReview = catchAsync(async (req, res) => {
    const payload = req.body;
    const user = req.user as IRequestUser;
    const result = await reviewService.giveReview(user, payload);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review created successfully',
        data: result,
    });
});

const getAllReviews = catchAsync(async (req, res) => {

    const result = await reviewService.getAllReviews();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieval successfully',
        data: result
    });
});

const myReviews = catchAsync(async (req, res) => {
    const user = req.user as IRequestUser;
    const result = await reviewService.myReviews(user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieval successfully',
        data: result
    });

});

const updateReview = catchAsync(async (req, res) => {
    const user = req.user as IRequestUser;
    const reviewId = req.params.id;
    const payload = req.body;

    const result = await reviewService.updateReview(user, reviewId as string, payload);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review updated successfully',
        data: result
    });
}
);

const deleteReview = catchAsync(async (req, res) => {
    const user = req.user as IRequestUser;
    const reviewId = req.params.id;
    const result = await reviewService.deleteReview(user, reviewId as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review deleted successfully',
        data: result
    });
});


export const reviewController = {
    giveReview,
    getAllReviews,
    myReviews,
    updateReview,
    deleteReview
}