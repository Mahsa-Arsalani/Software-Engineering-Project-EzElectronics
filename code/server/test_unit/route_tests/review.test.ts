import { test, expect, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import {Role, User} from "../../src/components/user"
import Authenticator from "../../src/routers/auth"
import ErrorHandler from "../../src/helper"

import ReviewController from "../../src/controllers/reviewController"
const baseURL = "/ezelectronics"

//jest.mock("../../src/helper")
jest.mock("../../src/components/review")
jest.mock("../../src/routers/auth")

afterEach(()=>{
    jest.resetAllMocks()
    jest.clearAllMocks()
})

describe("Review Routes unit test", ()=>{

    const testReview1 = {
        model: "Alexa",
        user: "testuser1",
        date: "2024/06/04",
        score: 2,
        comment: "testcomment1"
    }

    describe("POST /reviews/:model",()=>{

        const testReview2 = { //Define a test review object sent to the route
            model: "Alexa",
            user: "testuser2",
            date: "2024/06/04",
            score: 3,
            comment: "testcomment2"
        }

        //Example of a unit test for the POST ezelectronics/reviews/:model route
        //The test checks if the route returns a 200 success code
        //The test also expects the createUser method of the controller to be called once with the correct parameters
        test("It should return a 200 success code", async () => {
            jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce() //Mock the addReview method of the controller
            const response = await request(app).post(baseURL + "/review").send(testReview2) //Send a POST request to the route
            expect(response.status).toBe(200) //Check if the response status is 200
            expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1) //Check if the addReview method has been called once
            //Check if the addReview method has been called with the correct parameters
            expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(testReview2.model,
                testReview2.user,
                testReview2.score,
                testReview2.comment)
        })
    })

})